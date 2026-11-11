/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import * as AccountApi from '@forgerock/platform-shared/src/api/governance/AccountApi';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as GlossaryApi from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import EditAccountModal from './EditAccountModal';

mockValidation(['required']);

const mockForm = ref(null);
const mockFormValue = ref({});
const mockIsValidForm = ref(true);
const mockGetFormDefinitionByType = jest.fn().mockResolvedValue(undefined);
const mockSetDefaultFormValues = jest.fn();

jest.mock('@forgerock/platform-shared/src/composables/governance/forms', () => ({
  __esModule: true,
  default: () => ({
    form: mockForm,
    formTypes: { APPLICATION: 'application' },
    formValue: mockFormValue,
    isValidForm: mockIsValidForm,
    getFormDefinitionByType: mockGetFormDefinitionByType,
    setDefaultFormValues: mockSetDefaultFormValues,
  }),
}));

jest.mock('@forgerock/platform-shared/src/api/governance/AccountApi');
jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');

const testAccount = {
  id: 'system/Target/User/102',
  application: {
    id: 'app-1',
    name: 'Test App',
  },
  item: {
    objectType: 'User',
  },
  keys: {
    accountId: 'account-456',
  },
  user: {
    id: 'user-123',
    userName: 'jdoe',
  },
  account: {
    userName: 'jdoe',
    immutableId: 'do-not-change',
  },
  glossary: {
    idx: {
      '/account': {
        accountType: 'normal',
        environment: 'dev',
      },
    },
  },
};

const testSchema = {
  userName: {
    displayName: 'Username',
    type: 'string',
    order: 1,
    flags: [],
  },
  immutableId: {
    displayName: 'Immutable Id',
    type: 'string',
    order: 2,
    flags: ['NOT_UPDATEABLE'],
  },
};

describe('EditAccountModal', () => {
  let showErrorMessage;
  let routerPush;

  function mountComponent(props = {}, { admin = true } = {}) {
    setupTestPinia();
    if (admin) {
      useUserStore().idmRoles = ['openidm-admin'];
      useUserStore().idmUIAdminRoles = ['openidm-admin'];
    } else {
      useUserStore().idmRoles = [];
      useUserStore().idmUIAdminRoles = [];
    }
    ({ routerPush } = mockRouter({}));
    return mount(EditAccountModal, {
      global: {
        stubs: {
          FormBuilder: true,
        },
        mocks: {
          $t: (key) => key,
        },
      },
      props: { isTesting: true, currentItem: testAccount, ...props },
    });
  }

  beforeEach(() => {
    ({ showErrorMessage } = mockNotification());
    mockForm.value = null;
    mockFormValue.value = {};
    mockGetFormDefinitionByType.mockClear();
    AccountApi.getAccountById.mockResolvedValue({ data: testAccount });
    ApplicationsApi.getObjectTypeSchema.mockResolvedValue({ data: { properties: testSchema } });
    AccessRequestApi.submitCustomRequest.mockClear();
    AccessRequestApi.submitCustomRequest.mockResolvedValue({ data: { id: 'request-1' } });
    GlossaryApi.getGlossaryAttributes.mockResolvedValue({
      data: {
        result: [
          {
            name: 'accountType',
            displayName: 'Account Type',
            type: 'string',
            isMultiValue: false,
          },
          {
            name: 'environment',
            displayName: 'Environment',
            type: 'string',
            isMultiValue: false,
            enumeratedValues: [{ text: 'Dev', value: 'dev' }],
          },
        ],
        resultCount: 2,
        totalCount: 2,
      },
    });
  });

  it('loads the account, derives applicationId/objectType, and looks up the update form assignment', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    expect(AccountApi.getAccountById).toHaveBeenCalledWith(testAccount.id);
    expect(ApplicationsApi.getObjectTypeSchema).toHaveBeenCalledWith('app-1', 'User');
    expect(mockGetFormDefinitionByType).toHaveBeenCalledWith('application', expect.objectContaining({
      applicationId: 'app-1',
      objectType: 'User',
      operation: 'update',
    }));
  });

  it('initializes on first open even when currentItem and show() happen in the same tick', async () => {
    // Simulates Accounts.vue: mount with no item, then set the prop and emit the
    // modal's show event in the same tick — the @show handler must read the
    // flushed prop, not the stale one captured when the event fired.
    const wrapper = mountComponent({ currentItem: null });
    wrapper.setProps({ currentItem: testAccount }); // not awaited — update flushes on nextTick
    await wrapper.findComponent({ name: 'BModal' }).vm.$emit('show');
    await flushPromises();

    expect(AccountApi.getAccountById).toHaveBeenCalledWith(testAccount.id);
    expect(mockGetFormDefinitionByType).toHaveBeenCalledWith('application', expect.objectContaining({
      objectType: 'User',
      operation: 'update',
    }));
  });

  it('keeps NOT_UPDATEABLE properties visible but marks them read-only', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    expect(Object.keys(wrapper.vm.accountSchema)).toEqual(['userName', 'immutableId']);
    expect(wrapper.vm.accountSchema.immutableId.readOnly).toBe(true);
    expect(wrapper.vm.accountSchema.userName.readOnly).toBe(false);
  });

  it('shows the request confirmation modal with a View Request link to the created request', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    await wrapper.vm.saveAccountEdits();
    await flushPromises();

    expect(wrapper.vm.requestId).toBe('request-1');
    const successModal = wrapper.findComponent({ name: 'RequestSubmitSuccessModal' });
    expect(successModal.exists()).toBe(true);
    expect(wrapper.emitted('account-saved')).toBeTruthy();

    // the $t mock renders the button label as its translation key
    const successContent = wrapper.findComponent({ name: 'RequestSubmitSuccess' });
    const viewRequestButton = successContent.findAll('button').find((b) => b.text() === 'common.viewRequest');
    expect(viewRequestButton).toBeTruthy();
    await viewRequestButton.trigger('click');
    await flushPromises();

    expect(routerPush).toHaveBeenCalledWith({ name: 'RequestDetails', params: { requestId: 'request-1' } });
  });

  it('keeps the View Request link when the edit modal hides after submission', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    await wrapper.vm.saveAccountEdits();
    // hiding the edit modal after a successful save fires `hidden` -> resetModal();
    // the success modal is shown at that point and must still have its request id
    await wrapper.findComponent({ name: 'BModal' }).vm.$emit('hidden');
    await flushPromises();

    expect(wrapper.vm.requestId).toBe('request-1');
    const successContent = wrapper.findComponent({ name: 'RequestSubmitSuccess' });
    const viewRequestButton = successContent.findAll('button').find((b) => b.text() === 'common.viewRequest');
    expect(viewRequestButton).toBeTruthy();
  });

  it('clears the previous request id when the edit modal is opened again', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();
    await wrapper.vm.saveAccountEdits();
    await flushPromises();

    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    expect(wrapper.vm.requestId).toBe('');
  });

  it('falls back to the property key as the label when the schema has no displayName', async () => {
    ApplicationsApi.getObjectTypeSchema.mockResolvedValue({
      data: {
        properties: {
          rawAttribute: {
            type: 'string',
            order: 1,
            flags: [],
          },
        },
      },
    });
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    expect(wrapper.vm.accountSchema.rawAttribute.displayName).toBe('rawAttribute');
  });

  it('loads the account glossary schema and prefills existing glossary values', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    expect(wrapper.vm.glossarySchema).toHaveLength(2);
    expect(wrapper.vm.glossaryValues).toEqual({ accountType: 'normal', environment: 'dev' });
    expect(wrapper.findComponent({ name: 'GlossaryEditForm' }).exists()).toBe(true);
  });

  it('hides the account owner and type fields while still seeding their values from the account', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'AccountOwnerFields' }).exists()).toBe(false);
    // the values round-trip into the payload even though the fields are hidden
    expect(wrapper.vm.accountOwnerValues).toEqual({ userId: 'user-123', accountType: 'normal' });
  });

  it('does not render the account owner fields when an assigned form is found', async () => {
    mockForm.value = { form: { fields: [] } };
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'AccountOwnerFields' }).exists()).toBe(false);
  });

  it('disables the save button when the assigned form reports invalid', async () => {
    mockForm.value = { form: { fields: [] } };
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    wrapper.findComponent({ name: 'FormBuilder' }).vm.$emit('is-valid', false);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'ButtonWithSpinner' }).props('disabled')).toBe(true);
  });

  it('enables the save button once the assigned form reports valid', async () => {
    mockForm.value = { form: { fields: [] } };
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    wrapper.findComponent({ name: 'FormBuilder' }).vm.$emit('is-valid', true);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'ButtonWithSpinner' }).props('disabled')).toBe(false);
  });

  it('submits modifyAccount with the edited glossary values', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    wrapper.vm.glossaryValues = { accountType: 'service', environment: 'prod' };
    await wrapper.vm.saveAccountEdits();
    await flushPromises();

    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith('modifyAccount', expect.objectContaining({
      account: expect.objectContaining({
        accountId: 'account-456',
        applicationId: 'app-1',
        objectType: 'User',
        object: expect.objectContaining({ userName: 'jdoe' }),
        glossary: { accountType: 'service', environment: 'prod' },
      }),
    }));
  });

  it('submits modifyAccount without a glossary key when the account has none', async () => {
    AccountApi.getAccountById.mockResolvedValue({
      data: { ...testAccount, glossary: undefined },
    });
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    expect(wrapper.vm.glossaryValues).toEqual({});
    await wrapper.vm.saveAccountEdits();
    await flushPromises();

    const { account: submittedAccount } = AccessRequestApi.submitCustomRequest.mock.calls[0][1];
    expect(submittedAccount.glossary).toBeUndefined();
  });

  it('shows only the base properties when the glossary schema request fails', async () => {
    GlossaryApi.getGlossaryAttributes.mockRejectedValue(new Error('fail'));
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    expect(wrapper.vm.glossarySchema).toEqual([]);
    expect(wrapper.findComponent({ name: 'GlossaryEditForm' }).exists()).toBe(false);
    expect(wrapper.text()).not.toContain('governance.accounts.editAccount.noPropertiesAvailable');
  });

  it('shows the no-properties message when both the schema and glossary sections are empty', async () => {
    // schema request fails and the glossary schema request fails
    ApplicationsApi.getObjectTypeSchema.mockRejectedValue(new Error('fail'));
    GlossaryApi.getGlossaryAttributes.mockRejectedValue(new Error('fail'));
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'EntitlementEditForm' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'GlossaryEditForm' }).exists()).toBe(false);
    expect(wrapper.text()).toContain('governance.accounts.editAccount.noPropertiesAvailable');
  });

  it('shows the no-properties message when the object type has no properties at all', async () => {
    ApplicationsApi.getObjectTypeSchema.mockResolvedValue({ data: { properties: {} } });
    GlossaryApi.getGlossaryAttributes.mockRejectedValue(new Error('fail'));
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    expect(wrapper.find('[data-testid="edit-account-no-properties"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'EntitlementEditForm' }).exists()).toBe(false);
  });

  it('shows only the assigned form when one is found, hiding the base and glossary cards', async () => {
    mockForm.value = { form: { fields: [] } };
    mockFormValue.value = { object: { customField: 'custom-value' }, glossary: {} };
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'FormBuilder' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'EntitlementEditForm' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'GlossaryEditForm' }).exists()).toBe(false);
    expect(wrapper.text()).not.toContain('governance.entitlements.glossaryAttributes');
  });

  it('seeds the assigned form with the account\'s existing values, which win over the form\'s blank defaults', async () => {
    // the composable's initial model carries an empty entry per form field —
    // the account's stored glossary values must not be clobbered by them
    mockForm.value = { form: { fields: [] } };
    mockFormValue.value = {
      object: {},
      glossary: { active: '', 'confidence score': '' },
    };
    const account = {
      ...testAccount,
      glossary: {
        idx: {
          '/account': {
            accountType: 'normal',
            environment: 'dev',
            active: true,
            'confidence score': 90,
          },
        },
      },
    };
    AccountApi.getAccountById.mockResolvedValue({ data: account });
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(account);
    await flushPromises();

    expect(wrapper.vm.formValue.glossary).toEqual({
      active: true,
      'confidence score': 90,
      accountType: 'normal',
      environment: 'dev',
    });
    // owner keys seed the model's top level, mirroring the submitted account block shape
    expect(wrapper.vm.formValue.userId).toBe('user-123');
    expect(wrapper.vm.formValue.accountType).toBe('normal');
  });

  it('takes form-mode glossary values from the form model, not the standalone editor', async () => {
    mockForm.value = { form: { fields: [] } };
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    // the user edits fields through the assigned form — the form model is the
    // sole source at submit time
    mockFormValue.value = { object: { customField: 'x' }, glossary: { environment: 'prod' } };
    await wrapper.vm.saveAccountEdits();
    await flushPromises();

    const { account: submittedAccount } = AccessRequestApi.submitCustomRequest.mock.calls[0][1];
    expect(submittedAccount.glossary).toEqual({ environment: 'prod' });
    expect(submittedAccount.glossary.environment).not.toBe('dev');
  });

  it('shows base properties and glossary fields when no form is assigned', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'FormBuilder' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'EntitlementEditForm' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'GlossaryEditForm' }).exists()).toBe(true);
  });

  it('submits modifyAccount with base account properties when no form is assigned', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    await wrapper.vm.saveAccountEdits();
    await flushPromises();

    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith('modifyAccount', {
      common: {
        context: { type: 'admin' },
        justification: 'LCM: Modify account',
      },
      custom: {},
      account: {
        accountId: 'account-456',
        applicationId: 'app-1',
        objectType: 'User',
        userId: 'user-123',
        accountType: 'normal',
        object: { userName: 'jdoe', immutableId: 'do-not-change' },
        glossary: { accountType: 'normal', environment: 'dev' },
      },
    });
    expect(wrapper.emitted('account-saved')).toBeTruthy();
  });

  it('omits the admin context and adds justification for non-admin users, matching the delete flow', async () => {
    const wrapper = mountComponent({}, { admin: false });
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    await wrapper.vm.saveAccountEdits();
    await flushPromises();

    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith('modifyAccount', expect.objectContaining({
      common: { justification: 'LCM: Modify account' },
    }));
  });

  it('merges assigned form values into the modifyAccount payload and omits justification', async () => {
    mockForm.value = { form: { fields: [] } };
    mockFormValue.value = { customField: 'custom-value' };
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    await wrapper.vm.saveAccountEdits();
    await flushPromises();

    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith('modifyAccount', {
      common: {
        context: { type: 'admin' },
      },
      custom: {},
      account: {
        accountId: 'account-456',
        applicationId: 'app-1',
        objectType: 'User',
        customField: 'custom-value',
        // owner keys are seeded into the form model's top level, mirroring the
        // submitted account block shape
        userId: 'user-123',
        accountType: 'normal',
        object: { userName: 'jdoe', immutableId: 'do-not-change' },
        glossary: { accountType: 'normal', environment: 'dev' },
      },
    });
  });

  it('shows an error and does not emit account-saved when submission fails', async () => {
    AccessRequestApi.submitCustomRequest.mockRejectedValue(new Error('fail'));
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    await wrapper.vm.saveAccountEdits();
    await flushPromises();

    expect(showErrorMessage).toHaveBeenCalledWith(expect.anything(), 'Error submitting request');
    expect(wrapper.emitted('account-saved')).toBeFalsy();
    expect(wrapper.vm.isSaving).toBe(false);
  });

  it('surfaces the backend 400 message when the modifyAccount submission is invalid', async () => {
    AccessRequestApi.submitCustomRequest.mockRejectedValue({
      response: { status: 400, data: { message: 'account attribute validation failed' } },
    });
    const wrapper = mountComponent();
    await wrapper.vm.initializeModal(testAccount);
    await flushPromises();

    await wrapper.vm.saveAccountEdits();
    await flushPromises();

    expect(showErrorMessage).toHaveBeenCalledWith(
      expect.objectContaining({ response: expect.objectContaining({ status: 400 }) }),
      'Error submitting request',
    );
    expect(wrapper.emitted('account-saved')).toBeFalsy();
    expect(wrapper.vm.isSaving).toBe(false);
  });
});
