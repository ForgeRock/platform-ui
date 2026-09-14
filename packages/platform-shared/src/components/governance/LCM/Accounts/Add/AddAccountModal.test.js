/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as GlossaryApi from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import AddAccountModal from './AddAccountModal';

mockValidation(['required']);

const mockForm = ref({ form: { fields: [] } });
const mockFormValue = ref({});
const mockIsLoadingForm = ref(false);
const mockIsValidForm = ref(true);
const mockGetFormDefinitionByType = jest.fn().mockResolvedValue(undefined);
const mockSetDefaultFormValues = jest.fn();

jest.mock('@forgerock/platform-shared/src/composables/governance/forms', () => ({
  __esModule: true,
  default: () => ({
    form: mockForm,
    formTypes: { APPLICATION: 'application' },
    formValue: mockFormValue,
    isLoadingForm: mockIsLoadingForm,
    isValidForm: mockIsValidForm,
    getFormDefinitionByType: mockGetFormDefinitionByType,
    setDefaultFormValues: mockSetDefaultFormValues,
  }),
}));

jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');
jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');

describe('AddAccountModal', () => {
  let showErrorMessage;

  function mountComponent() {
    return mount(AddAccountModal, {
      global: {
        stubs: {
          AppAndObjectType: {
            name: 'AppAndObjectType',
            props: {
              overrideScopePermission: Boolean,
              applicationOnly: Boolean,
              filterByAccountAttribute: Boolean,
              labelText: String,
            },
            template: '<button @click="$emit(\'input\', { applicationId: \'app-1\' })">select</button>',
          },
          FormBuilder: true,
          RequestSubmitSuccess: true,
        },
        mocks: {
          $t: (key) => key,
        },
      },
      props: { isTesting: true },
    });
  }

  beforeEach(() => {
    ({ showErrorMessage } = mockNotification());
    mockForm.value = { form: { fields: [] } };
    mockFormValue.value = {};
    mockGetFormDefinitionByType.mockReset().mockResolvedValue(undefined);
    getManagedResourceList.mockResolvedValue({ data: { result: [] } });
    AccessRequestApi.submitCustomRequest.mockClear();
    AccessRequestApi.submitCustomRequest.mockResolvedValue({ data: { id: 'request-1' } });
    ApplicationsApi.getObjectTypeSchema.mockReset();
    GlossaryApi.getGlossaryAttributes.mockClear();
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

  it('passes overrideScopePermission to the application selector so unmanaged applications are included', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const appSelector = wrapper.findComponent({ name: 'AppAndObjectType' });
    expect(appSelector.props('overrideScopePermission')).toBe(true);
    expect(appSelector.props('applicationOnly')).toBe(true);
  });

  it('does not filter applications by accountAttribute', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const appSelector = wrapper.findComponent({ name: 'AppAndObjectType' });
    expect(appSelector.props('filterByAccountAttribute')).toBe(false);
  });

  it('overrides the entitlement wording with the account-specific label', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const appSelector = wrapper.findComponent({ name: 'AppAndObjectType' });
    expect(appSelector.props('labelText')).toBe('governance.accounts.newAccount.chooseApplication');
  });

  it('labels the footer button Next on the application step and Submit on the form step', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.findComponent({ name: 'ButtonWithSpinner' }).props('buttonText')).toBe('Next');

    wrapper.vm.applicationId = 'app-1';
    await wrapper.vm.nextStep();
    await flushPromises();

    expect(wrapper.findComponent({ name: 'ButtonWithSpinner' }).props('buttonText')).toBe('Submit');
  });

  it('keeps the Next label while the form step is loading on the application step', async () => {
    let resolveFormLoad;
    mockGetFormDefinitionByType.mockReturnValue(new Promise((resolve) => { resolveFormLoad = resolve; }));

    const wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.applicationId = 'app-1';
    const stepPromise = wrapper.vm.nextStep();
    await nextTick();
    await flushPromises();

    // while the form loads the button stays disabled, shows the spinner, and keeps the Next label
    const button = wrapper.findComponent({ name: 'ButtonWithSpinner' });
    expect(button.props('disabled')).toBe(true);
    expect(button.props('showSpinner')).toBe(true);
    expect(button.props('spinnerText')).toBe('Next');

    resolveFormLoad();
    await stepPromise;
    await flushPromises();

    expect(wrapper.vm.step).toBe(1);
    expect(wrapper.findComponent({ name: 'ButtonWithSpinner' }).props('buttonText')).toBe('Submit');
  });

  it('loads the account form after selecting an application', async () => {
    const wrapper = mountComponent();
    wrapper.vm.applicationId = 'app-1';
    await wrapper.vm.nextStep();
    await flushPromises();

    expect(mockGetFormDefinitionByType).toHaveBeenCalledWith('application', expect.objectContaining({
      applicationId: 'app-1',
      operation: 'create',
    }));
    expect(wrapper.vm.step).toBe(1);
  });

  it('passes the derived object type to the form lookup so disconnected apps use the exact assignment query', async () => {
    const wrapper = mountComponent();
    // Disconnected apps have no inbound user mapping, so the object type comes
    // from the app's own non-entitlement object type
    wrapper.vm.application = {
      isDisconnected: true,
      objectTypes: [
        { name: '__ACCOUNT__' },
        { name: '__GROUP__', accountAttribute: 'memberOf' },
      ],
    };
    wrapper.vm.applicationId = 'app-2';
    await wrapper.vm.nextStep();
    await flushPromises();

    expect(mockGetFormDefinitionByType).toHaveBeenCalledWith('application', expect.objectContaining({
      applicationId: 'app-2',
      objectType: '__ACCOUNT__',
      operation: 'create',
    }));
  });

  it('submits createAccount with application and form values', async () => {
    const wrapper = mountComponent();
    wrapper.vm.application = {
      connectorId: 'Ldap',
      mappingNames: ['systemLdapUser_managedAlpha_user'],
      objectTypes: [{ name: 'User' }],
    };
    wrapper.vm.applicationId = 'app-1';
    wrapper.vm.formValue = { userName: 'new-account' };
    wrapper.vm.step = 1;

    await wrapper.vm.nextStep();
    await flushPromises();

    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith('createAccount', {
      common: {
        context: {
          type: 'admin',
        },
      },
      custom: {},
      account: {
        applicationId: 'app-1',
        objectType: 'User',
        userName: 'new-account',
      },
    });
    expect(wrapper.vm.step).toBe(2);
    expect(wrapper.vm.requestId).toBe('request-1');
  });

  it('queries the account glossary schema and renders the fallback fields when no form is assigned', async () => {
    mockForm.value = null;
    ApplicationsApi.getObjectTypeSchema.mockResolvedValue({
      data: {
        properties: {
          userName: {
            displayName: 'Username',
            type: 'string',
            order: 1,
            flags: [],
          },
        },
      },
    });
    const wrapper = mountComponent();
    wrapper.vm.application = {
      connectorId: 'Ldap',
      mappingNames: ['systemLdapUser_managedAlpha_user'],
      objectTypes: [{ name: 'User' }],
    };
    wrapper.vm.applicationId = 'app-1';
    await wrapper.vm.nextStep();
    await flushPromises();

    expect(GlossaryApi.getGlossaryAttributes).toHaveBeenCalled();
    expect(wrapper.vm.glossarySchema).toHaveLength(2);
    expect(wrapper.findComponent({ name: 'GlossaryEditForm' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'EntitlementEditForm' }).exists()).toBe(true);
    expect(wrapper.text()).not.toContain('governance.accounts.newAccount.formUnavailable');
  });

  it('shows the account owner and type fields in the no-form fallback and includes them in the payload', async () => {
    mockForm.value = null;
    ApplicationsApi.getObjectTypeSchema.mockResolvedValue({
      data: {
        properties: {
          userName: {
            displayName: 'Username',
            type: 'string',
            order: 1,
            flags: [],
          },
        },
      },
    });
    const wrapper = mountComponent();
    wrapper.vm.application = {
      connectorId: 'Ldap',
      mappingNames: ['systemLdapUser_managedAlpha_user'],
      objectTypes: [{ name: 'User' }],
    };
    wrapper.vm.applicationId = 'app-1';
    wrapper.vm.accountOwnerValues = { userId: 'user-9', accountType: 'machine' };
    await wrapper.vm.nextStep();
    await flushPromises();

    expect(wrapper.findComponent({ name: 'AccountOwnerFields' }).exists()).toBe(true);
    expect(wrapper.text()).toContain('Account owner');

    wrapper.vm.accountValues = { userName: 'new-account' };
    wrapper.vm.accountOwnerValues = { userId: 'user-9', accountType: 'machine' };
    await wrapper.vm.nextStep();
    await flushPromises();

    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith('createAccount', expect.objectContaining({
      account: expect.objectContaining({
        applicationId: 'app-1',
        objectType: 'User',
        userId: 'user-9',
        accountType: 'machine',
        object: { userName: 'new-account' },
      }),
    }));
  });

  it('renders the account owner fields before the account attributes and glossary cards', async () => {
    mockForm.value = null;
    ApplicationsApi.getObjectTypeSchema.mockResolvedValue({
      data: {
        properties: {
          userName: {
            displayName: 'Username',
            type: 'string',
            order: 1,
            flags: [],
          },
        },
      },
    });
    const wrapper = mountComponent();
    wrapper.vm.application = {
      connectorId: 'Ldap',
      mappingNames: ['systemLdapUser_managedAlpha_user'],
      objectTypes: [{ name: 'User' }],
    };
    wrapper.vm.applicationId = 'app-1';
    await wrapper.vm.nextStep();
    await flushPromises();

    // both fallback cards carry the form-section class; the owner fields must precede them
    const html = wrapper.html();
    expect(html.indexOf('Account owner')).toBeGreaterThan(-1);
    expect(html.indexOf('Account owner')).toBeLessThan(html.indexOf('form-section'));
  });

  it('does not render the account owner fields when an assigned form is found', async () => {
    mockForm.value = { form: { fields: [] } };
    const wrapper = mountComponent();
    wrapper.vm.applicationId = 'app-1';
    await wrapper.vm.nextStep();
    await flushPromises();

    expect(wrapper.findComponent({ name: 'AccountOwnerFields' }).exists()).toBe(false);
  });

  it('disables the submit button when the assigned form reports invalid', async () => {
    mockForm.value = { form: { fields: [] } };
    const wrapper = mountComponent();
    wrapper.vm.applicationId = 'app-1';
    await wrapper.vm.nextStep();
    await flushPromises();

    wrapper.findComponent({ name: 'FormBuilder' }).vm.$emit('is-valid', false);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'ButtonWithSpinner' }).props('disabled')).toBe(true);
  });

  it('enables the submit button once the assigned form reports valid', async () => {
    mockForm.value = { form: { fields: [] } };
    const wrapper = mountComponent();
    wrapper.vm.applicationId = 'app-1';
    await wrapper.vm.nextStep();
    await flushPromises();

    wrapper.findComponent({ name: 'FormBuilder' }).vm.$emit('is-valid', true);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'ButtonWithSpinner' }).props('disabled')).toBe(false);
  });

  it('shows account attribute fields for a disconnected application when no form is assigned', async () => {
    mockForm.value = null;
    ApplicationsApi.getObjectTypeSchema.mockResolvedValue({
      data: {
        properties: {
          userName: {
            displayName: 'Username',
            type: 'string',
            order: 1,
            flags: [],
          },
        },
      },
    });
    const wrapper = mountComponent();
    // Disconnected apps have no connectorId/mappingNames — the object type must
    // fall back to the app's own non-entitlement object type
    wrapper.vm.application = {
      isDisconnected: true,
      objectTypes: [
        { name: '__ACCOUNT__' },
        { name: '__GROUP__', accountAttribute: 'memberOf' },
      ],
    };
    wrapper.vm.applicationId = 'app-2';
    await wrapper.vm.nextStep();
    await flushPromises();

    expect(wrapper.vm.accountObjectType).toBe('__ACCOUNT__');
    expect(ApplicationsApi.getObjectTypeSchema).toHaveBeenCalledWith('app-2', '__ACCOUNT__');
    expect(wrapper.findComponent({ name: 'EntitlementEditForm' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'GlossaryEditForm' }).exists()).toBe(true);
  });

  it('prefers the __ACCOUNT__ object type over other types without an accountAttribute', async () => {
    const wrapper = mountComponent();
    // An app can declare several types without an accountAttribute; only the
    // conventional __ACCOUNT__ name is a reliable account type
    wrapper.vm.application = {
      isDisconnected: true,
      objectTypes: [
        { name: '__GROUP__' },
        { name: '__ACCOUNT__' },
      ],
    };
    wrapper.vm.applicationId = 'app-2';
    await wrapper.vm.nextStep();
    await flushPromises();

    expect(wrapper.vm.accountObjectType).toBe('__ACCOUNT__');
    expect(mockGetFormDefinitionByType).toHaveBeenCalledWith('application', expect.objectContaining({
      applicationId: 'app-2',
      objectType: '__ACCOUNT__',
      operation: 'create',
    }));
  });

  it('issues the account schema and glossary schema requests concurrently when no form is assigned', async () => {
    mockForm.value = null;
    let resolveSchema;
    let resolveGlossary;
    ApplicationsApi.getObjectTypeSchema.mockReturnValue(new Promise((resolve) => { resolveSchema = resolve; }));
    GlossaryApi.getGlossaryAttributes.mockReturnValue(new Promise((resolve) => { resolveGlossary = resolve; }));

    const wrapper = mountComponent();
    wrapper.vm.application = {
      connectorId: 'Ldap',
      mappingNames: ['systemLdapUser_managedAlpha_user'],
      objectTypes: [{ name: 'User' }],
    };
    wrapper.vm.applicationId = 'app-1';
    const stepPromise = wrapper.vm.nextStep();
    await flushPromises();

    // both requests are in flight before either resolves
    expect(ApplicationsApi.getObjectTypeSchema).toHaveBeenCalledTimes(1);
    expect(GlossaryApi.getGlossaryAttributes).toHaveBeenCalledTimes(1);

    resolveSchema({
      data: {
        properties: {
          userName: { displayName: 'Username', type: 'string', flags: [] },
        },
      },
    });
    resolveGlossary({ data: { result: [], resultCount: 0, totalCount: 0 } });
    await stepPromise;
    await flushPromises();

    expect(wrapper.findComponent({ name: 'EntitlementEditForm' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'GlossaryEditForm' }).exists()).toBe(false);
  });

  it('renders only the assigned form when one is found, skipping schema and glossary lookups', async () => {
    mockForm.value = { form: { fields: [] } };
    const wrapper = mountComponent();
    wrapper.vm.applicationId = 'app-1';
    await wrapper.vm.nextStep();
    await flushPromises();

    expect(wrapper.findComponent({ name: 'FormBuilder' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'EntitlementEditForm' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'GlossaryEditForm' }).exists()).toBe(false);
    expect(ApplicationsApi.getObjectTypeSchema).not.toHaveBeenCalled();
    expect(GlossaryApi.getGlossaryAttributes).not.toHaveBeenCalled();
  });

  it('submits createAccount with the entered glossary values', async () => {
    mockForm.value = null;
    const wrapper = mountComponent();
    wrapper.vm.application = {
      connectorId: 'Ldap',
      mappingNames: ['systemLdapUser_managedAlpha_user'],
      objectTypes: [{ name: 'User' }],
    };
    wrapper.vm.applicationId = 'app-1';
    wrapper.vm.accountValues = { userName: 'new-account' };
    wrapper.vm.glossaryValues = { environment: 'dev' };
    wrapper.vm.step = 1;

    await wrapper.vm.nextStep();
    await flushPromises();

    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith('createAccount', expect.objectContaining({
      account: expect.objectContaining({
        applicationId: 'app-1',
        objectType: 'User',
        object: { userName: 'new-account' },
        glossary: { environment: 'dev' },
      }),
    }));
  });

  it('takes form-mode glossary values from the form model, not the standalone editor', async () => {
    mockForm.value = { form: { fields: [] } };
    const wrapper = mountComponent();
    wrapper.vm.application = {
      connectorId: 'Ldap',
      mappingNames: ['systemLdapUser_managedAlpha_user'],
      objectTypes: [{ name: 'User' }],
    };
    wrapper.vm.applicationId = 'app-1';
    wrapper.vm.formValue = { object: { userName: 'new-account' }, glossary: { environment: 'prod' } };
    wrapper.vm.glossaryValues = { environment: 'dev' };
    wrapper.vm.step = 1;

    await wrapper.vm.nextStep();
    await flushPromises();

    const { account: submittedAccount } = AccessRequestApi.submitCustomRequest.mock.calls[0][1];
    expect(submittedAccount.glossary).toEqual({ environment: 'prod' });
    expect(submittedAccount).not.toHaveProperty('glossary.environment', 'dev');
  });

  it('submits createAccount without a glossary key when no glossary values were entered', async () => {
    const wrapper = mountComponent();
    wrapper.vm.application = {
      connectorId: 'Ldap',
      mappingNames: ['systemLdapUser_managedAlpha_user'],
      objectTypes: [{ name: 'User' }],
    };
    wrapper.vm.applicationId = 'app-1';
    wrapper.vm.formValue = { userName: 'new-account' };
    wrapper.vm.step = 1;

    await wrapper.vm.nextStep();
    await flushPromises();

    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith('createAccount', expect.objectContaining({
      account: {
        applicationId: 'app-1',
        objectType: 'User',
        userName: 'new-account',
      },
    }));
  });

  it('surfaces the backend 400 message and stays on the form when submission fails', async () => {
    AccessRequestApi.submitCustomRequest.mockRejectedValue({
      response: { status: 400, data: { message: 'account attribute validation failed' } },
    });
    const wrapper = mountComponent();
    wrapper.vm.application = {
      connectorId: 'Ldap',
      mappingNames: ['systemLdapUser_managedAlpha_user'],
      objectTypes: [{ name: 'User' }],
    };
    wrapper.vm.applicationId = 'app-1';
    wrapper.vm.formValue = { userName: 'new-account' };
    wrapper.vm.step = 1;

    await wrapper.vm.nextStep();
    await flushPromises();

    expect(showErrorMessage).toHaveBeenCalledWith(
      expect.objectContaining({ response: expect.objectContaining({ status: 400 }) }),
      'Error submitting request',
    );
    expect(wrapper.vm.step).toBe(1);
    expect(wrapper.vm.isSaving).toBe(false);
    expect(wrapper.emitted('account-saved')).toBeFalsy();
  });

  it('falls back to the generic error message when the 400 has no message body', async () => {
    AccessRequestApi.submitCustomRequest.mockRejectedValue({
      response: { status: 400, data: {} },
    });
    const wrapper = mountComponent();
    wrapper.vm.applicationId = 'app-1';
    wrapper.vm.step = 1;

    await wrapper.vm.nextStep();
    await flushPromises();

    expect(showErrorMessage).toHaveBeenCalledWith(expect.anything(), 'Error submitting request');
    expect(wrapper.vm.step).toBe(1);
  });

  it('keeps the assigned-form-only layout when the glossary schema request fails', async () => {
    GlossaryApi.getGlossaryAttributes.mockRejectedValue(new Error('fail'));
    const wrapper = mountComponent();
    wrapper.vm.applicationId = 'app-1';
    await wrapper.vm.nextStep();
    await flushPromises();

    expect(wrapper.vm.glossarySchema).toEqual([]);
    expect(wrapper.findComponent({ name: 'GlossaryEditForm' }).exists()).toBe(false);
  });

  it('resolves the object type from the assigned form for disconnected applications', async () => {
    const wrapper = mountComponent();
    // Disconnected apps have no connectorId/mappingNames, so derivation returns
    // nothing and the form's recorded object type must be used instead
    wrapper.vm.application = { isDisconnected: true };
    wrapper.vm.applicationId = 'app-1';
    mockForm.value = { form: { fields: [] }, categories: { objectType: 'Disco Account' } };
    wrapper.vm.step = 1;
    wrapper.vm.formValue = { userName: 'new-account' };

    await wrapper.vm.nextStep();
    await flushPromises();

    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith('createAccount', {
      common: {
        context: {
          type: 'admin',
        },
      },
      custom: {},
      account: {
        applicationId: 'app-1',
        objectType: 'Disco Account',
        userName: 'new-account',
      },
    });
  });
});
