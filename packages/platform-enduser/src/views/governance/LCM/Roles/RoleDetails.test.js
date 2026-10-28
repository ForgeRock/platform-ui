/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as SchemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import * as RoleApi from '@forgerock/platform-shared/src/api/governance/RoleApi';
import * as PermissionsApi from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as applicationImageResolver from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import * as Notifications from '@forgerock/platform-shared/src/utils/notification';
import { createAppContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import {
  getRoleByIdMock,
  getSchemaMock,
  getPrivilegesMock,
  getManagedResourceListMock,
  getEntitlementListMock,
} from './mock';
import i18n from '@/i18n';
import RoleDetails from './RoleDetails';

mockModal();
mockNotification();
mockValidation(['required']);
mockRouter({ params: { roleId: 'testId', roleStatus: 'active' } });

// The progress modal's own behavior is covered in its unit test; here it is
// stubbed so the parent save flow (progress -> inline review -> continue ->
// submit) can be asserted. The standalone similarity modal is no longer part
// of this flow.
jest.mock('@forgerock/platform-shared/src/components/governance/LCM/Roles/RoleRequestProgressModal', () => ({
  name: 'RoleRequestProgressModal',
  props: ['stepState', 'similarRoles', 'outcome', 'canContinue', 'isTesting'],
  emits: ['close', 'retry', 'continue'],
  template: `<div>
    <span data-testid="progress-modal-outcome">{{ outcome }}</span>
    <span data-testid="progress-modal-can-continue">{{ canContinue }}</span>
    <span data-testid="progress-modal-similar-roles">{{ JSON.stringify(similarRoles) }}</span>
    <button data-testid="progress-modal-retry-button" @click="$emit('retry')">Retry</button>
    <button data-testid="progress-modal-continue-button" @click="$emit('continue')">Continue</button>
    <button data-testid="progress-modal-done-button" @click="$emit('close')">Done</button>
  </div>`,
}));

jest.spyOn(SchemaApi, 'getSchema').mockImplementation((obj) => getSchemaMock(obj));
jest.spyOn(RoleApi, 'getRoleDataById').mockImplementation((id, status, dataType, queryParams = {}, requestId) => getRoleByIdMock(id, status, dataType, queryParams, requestId));
jest.spyOn(RoleApi, 'getRoleSimilarity').mockImplementation(() => Promise.resolve({ data: { result: [] } }));
jest.spyOn(RoleApi, 'getRoleSimilarityById').mockImplementation(() => Promise.resolve({ data: { result: [] } }));
PermissionsApi.getPrivileges = jest.fn().mockImplementation(() => getPrivilegesMock());
jest.spyOn(ManagedResourceApi, 'getManagedResourceList').mockImplementation((resource, queryParams = {}) => getManagedResourceListMock(resource, queryParams));
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');
jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
jest.spyOn(AccessRequestApi, 'requestAction').mockImplementation(() => Promise.resolve({
  data: {},
}));
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
  getApplicationDisplayName: jest.fn().mockReturnValue('app display name'),
}));
jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
  getApplicationDisplayName: jest.fn().mockReturnValue('app display name'),
}));
applicationImageResolver.onImageError = jest.fn().mockImplementation(() => {});
EntitlementApi.getApplicationList.mockImplementation(() => Promise.resolve({
  data: {
    result: [
      {
        application: {
          name: 'TestApp',
          id: 'TestId',
          objectTypes: [
            {
              name: 'TestObjectType',
              accountAttribute: 'accountAttribute1',
            },
            {
              name: 'TestObjectType2',
            },
          ],
        },
      },
    ],
  },
}));
ManagedResourceApi.getManagedResourceList.mockImplementation(() => getManagedResourceListMock());
EntitlementApi.getEntitlementSchema.mockImplementation(() => Promise.resolve({
  data: {
    properties: {
      testObjectProperty: {
        type: 'string',
        order: 2,
        displayName: 'test object property',
      },
      testObjectProperty2: {
        type: 'string',
        order: 3,
        displayName: 'test object property2',
        flags: ['NOT_CREATABLE'],
      },
    },
  },
}));
EntitlementApi.getEntitlementList.mockImplementation(() => getEntitlementListMock());

describe('RoleDetails', () => {
  let wrapper;
  const app = createAppContainer();

  beforeEach(() => {
    mockRouter({ params: { roleId: 'testId', roleStatus: 'active' } });
  });
  function mountComponent(user = { userId: '1234' }, params = {}) {
    setupTestPinia({ user });
    wrapper = mount(RoleDetails, {
      attachTo: app,
      global: {
        plugins: [i18n],
        mocks: {
          route: {
            params: {
              roleId: 'testId',
              roleStatus: 'active',
              ...params,
            },
          },
          $store: {
            userId: 'testUserId',
            state: {
              SharedStore: {
                uiConfig: {},
              },
            },
          },
        },
      },
    });
    return wrapper;
  }

  it('displays the role name as a header on the page', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const roleName = wrapper.find('h1');
    expect(roleName.text()).toBe('Test Role');
  });

  it('has tabs for the role details, entitlements, and members when editing an existing role', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const roleTabs = wrapper.findAll('li.nav-item');
    expect(roleTabs.length).toBe(3);
    expect(roleTabs[0].text()).toContain('Details');
    expect(roleTabs[1].text()).toContain('Entitlements');
    expect(roleTabs[2].text()).toContain('Members');
  });

  it('does not show the members tab when creating a new role', async () => {
    mockRouter({ params: { roleId: 'new', roleStatus: 'active' } });
    wrapper = mountComponent(null, { roleId: 'new' });
    await flushPromises();
    const roleTabs = wrapper.findAll('li.nav-item');
    expect(roleTabs.length).toBe(2);
    expect(roleTabs[0].text()).toContain('Details');
    expect(roleTabs[1].text()).toContain('Entitlements');
  });

  it('displays a "Save" button for existing roles if the user has modifyRole permissions', async () => {
    wrapper = mountComponent(null, { roleId: 'new' });
    await flushPromises();
    const saveBtn = wrapper.find('div.d-flex.justify-content-end > button');
    expect(saveBtn.exists()).toBe(true);
    expect(saveBtn.text()).toBe('Save');
  });

  it('hides save buttons for existing roles if the user does not have modifyRole permissions', async () => {
    wrapper = mountComponent();
    PermissionsApi.getPrivileges.mockImplementationOnce(() => Promise.resolve({
      data: {
        permissions: ['viewRole'],
      },
    }));
    await flushPromises();
    const saveDraftDiv = wrapper.find('div.d-flex.justify-content-end');
    const saveDraftBtn = wrapper.find('div.d-flex.justify-content-end > bbutton');
    const saveBtn = wrapper.find('div.d-flex.justify-content-end > bbutton');
    expect(saveDraftDiv.exists()).toBe(true);
    expect(saveDraftBtn.exists()).toBe(false);
    expect(saveBtn.exists()).toBe(false);
  });

  it('displays the save buttons for new roles if the user has createRole permissions', async () => {
    mockRouter({ params: { roleId: 'new', roleStatus: 'active' } });
    PermissionsApi.getPrivileges.mockImplementationOnce(() => Promise.resolve({
      data: {
        permissions: ['createRole'],
      },
    }));
    wrapper = mountComponent(null, { roleId: 'new' });
    await flushPromises();
    const saveBtns = wrapper.findAll('div.d-flex.justify-content-end > button');
    const saveDraftBtn = saveBtns[0];
    const saveBtn = saveBtns[1];
    expect(saveDraftBtn.exists()).toBe(true);
    expect(saveDraftBtn.text()).toBe('Save as Draft');
    expect(saveBtn.exists()).toBe(true);
    expect(saveBtn.text()).toBe('Save');
  });

  it('hides save buttons for new roles if the user does not have createRole permissions', async () => {
    wrapper = mountComponent(null, { roleId: 'new' });
    PermissionsApi.getPrivileges.mockImplementationOnce(() => Promise.resolve({
      data: {
        permissions: ['modifyRole'],
      },
    }));
    await flushPromises();
    const saveDraftDiv = wrapper.find('div.d-flex.justify-content-end');
    const saveDraftBtn = wrapper.find('div.d-flex.justify-content-end > bbutton');
    const saveBtn = wrapper.find('div.d-flex.justify-content-end > bbutton');
    expect(saveDraftDiv.exists()).toBe(true);
    expect(saveDraftBtn.exists()).toBe(false);
    expect(saveBtn.exists()).toBe(false);
  });

  it('runs the similarity check and submits the request from the progress modal when no similar roles are found', async () => {
    const mockPayload = {
      role: {
        glossary: {},
        object: {
          description: '',
          entitlements: ['ent1'],
          justifications: [],
          name: 'Test',
        },
        status: 'active',
      },
    };
    mockRouter({ params: { roleId: 'new', roleStatus: 'active' } });
    wrapper = mountComponent();
    await flushPromises();
    wrapper.vm.updateTabData('details', null, {
      role: {
        name: 'Test',
      },
    });
    wrapper.vm.updateTabData('entitlements', 'load', { result: [{ id: 'ent1' }], resultCount: 1 });
    await flushPromises();
    const saveBtns = wrapper.findAll('div.d-flex.justify-content-end > button');
    expect(saveBtns.length).toBe(2);
    expect(saveBtns[1].text()).toBe('Save');
    saveBtns[1].trigger('click');
    await flushPromises();
    expect(RoleApi.getRoleSimilarity).toHaveBeenCalled();
    // No similar roles found: submission goes straight through without confirmation
    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('createRole', 'publish', null, mockPayload);
    expect(wrapper.find('[data-testid="progress-modal-outcome"]').text()).toBe('success');
  });

  it('waits for an inline similar-roles review when the check finds matches, then submits on Continue', async () => {
    mockRouter({ params: { roleId: 'new', roleStatus: 'active' } });
    AccessRequestApi.requestAction.mockClear();
    RoleApi.getRoleSimilarity.mockClear();
    RoleApi.getRoleSimilarity.mockImplementationOnce(() => Promise.resolve({
      data: {
        result: [
          {
            id: 'similar1', name: 'Existing Role', status: 'active', jaccard: 0.65, sharedItems: ['ent1'], totalShared: 2, entitlementCount: 3,
          },
        ],
      },
    }));
    wrapper = mountComponent();
    await flushPromises();
    wrapper.vm.updateTabData('details', null, {
      role: {
        name: 'Test',
      },
    });
    wrapper.vm.updateTabData('entitlements', 'load', { result: [{ id: 'ent1' }], resultCount: 1 });
    await flushPromises();
    const saveBtns = wrapper.findAll('div.d-flex.justify-content-end > button');
    saveBtns[1].trigger('click');
    await flushPromises();
    // Similar roles found: the progress modal holds at the review step, nothing submitted yet
    expect(wrapper.find('[data-testid="progress-modal-can-continue"]').text()).toBe('true');
    const rolesPassed = JSON.parse(wrapper.find('[data-testid="progress-modal-similar-roles"]').text());
    expect(rolesPassed[0].name).toBe('Existing Role');
    expect(AccessRequestApi.requestAction).not.toHaveBeenCalledWith('createRole', 'publish', null, expect.anything());
    // Continuing from the progress modal submits the request
    await wrapper.find('[data-testid="progress-modal-continue-button"]').trigger('click');
    await flushPromises();
    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('createRole', 'publish', null, expect.anything());
    expect(wrapper.find('[data-testid="progress-modal-outcome"]').text()).toBe('success');
  });

  it('shows an error outcome with retry when the similarity check fails', async () => {
    mockRouter({ params: { roleId: 'new', roleStatus: 'active' } });
    AccessRequestApi.requestAction.mockClear();
    RoleApi.getRoleSimilarity.mockClear();
    RoleApi.getRoleSimilarity.mockImplementationOnce(() => Promise.reject(new Error('similarity failed')));
    wrapper = mountComponent();
    await flushPromises();
    wrapper.vm.updateTabData('details', null, {
      role: {
        name: 'Test',
      },
    });
    wrapper.vm.updateTabData('entitlements', 'load', { result: [{ id: 'ent1' }], resultCount: 1 });
    await flushPromises();
    const saveBtns = wrapper.findAll('div.d-flex.justify-content-end > button');
    saveBtns[1].trigger('click');
    await flushPromises();
    expect(wrapper.find('[data-testid="progress-modal-outcome"]').text()).toBe('error');
    expect(AccessRequestApi.requestAction).not.toHaveBeenCalledWith('createRole', 'publish', null, expect.anything());
    // Retry re-runs the failed check; the retried check finds no matches and auto-submits
    RoleApi.getRoleSimilarity.mockClear();
    RoleApi.getRoleSimilarity.mockImplementationOnce(() => Promise.resolve({ data: { result: [] } }));
    await wrapper.find('[data-testid="progress-modal-retry-button"]').trigger('click');
    await flushPromises();
    expect(RoleApi.getRoleSimilarity).toHaveBeenCalledTimes(1);
    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('createRole', 'publish', null, expect.anything());
    expect(wrapper.find('[data-testid="progress-modal-outcome"]').text()).toBe('success');
  });

  it('re-enables the save buttons after the progress modal is canceled', async () => {
    mockRouter({ params: { roleId: 'new', roleStatus: 'active' } });
    AccessRequestApi.requestAction.mockClear();
    RoleApi.getRoleSimilarity.mockClear();
    RoleApi.getRoleSimilarity.mockImplementationOnce(() => Promise.reject(new Error('similarity failed')));
    wrapper = mountComponent();
    await flushPromises();
    wrapper.vm.updateTabData('details', null, {
      role: {
        name: 'Test',
      },
    });
    wrapper.vm.updateTabData('entitlements', 'load', { result: [{ id: 'ent1' }], resultCount: 1 });
    await flushPromises();
    const saveBtns = wrapper.findAll('div.d-flex.justify-content-end > button');
    saveBtns[1].trigger('click');
    await flushPromises();
    // While the save flow is open, the save buttons are disabled
    expect(wrapper.find('div.d-flex.justify-content-end > button').attributes('disabled')).toBeDefined();
    // Canceling the progress modal resets the save flow
    await wrapper.find('[data-testid="progress-modal-done-button"]').trigger('click');
    await flushPromises();
    expect(wrapper.find('div.d-flex.justify-content-end > button').attributes('disabled')).toBeUndefined();
  });

  it('shows an error outcome with retry when the request submission fails after the check passed', async () => {
    mockRouter({ params: { roleId: 'new', roleStatus: 'active' } });
    AccessRequestApi.requestAction.mockClear();
    AccessRequestApi.requestAction.mockRejectedValueOnce(new Error('submit failed'));
    wrapper = mountComponent();
    await flushPromises();
    wrapper.vm.updateTabData('details', null, {
      role: {
        name: 'Test',
      },
    });
    await flushPromises();
    const saveBtns = wrapper.findAll('div.d-flex.justify-content-end > button');
    saveBtns[1].trigger('click');
    await flushPromises();
    // No matches found: submission auto-proceeds and fails
    expect(wrapper.find('[data-testid="progress-modal-outcome"]').text()).toBe('error');
    // Retry re-runs only the submit step, not the similarity check
    RoleApi.getRoleSimilarity.mockClear();
    AccessRequestApi.requestAction.mockResolvedValueOnce({ data: { id: 'req1' } });
    await wrapper.find('[data-testid="progress-modal-retry-button"]').trigger('click');
    await flushPromises();
    expect(RoleApi.getRoleSimilarity).not.toHaveBeenCalled();
    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('createRole', 'publish', null, expect.anything());
    expect(wrapper.find('[data-testid="progress-modal-outcome"]').text()).toBe('success');
  });

  it('does not submit a request when the modal is canceled while the check is in flight', async () => {
    mockRouter({ params: { roleId: 'new', roleStatus: 'active' } });
    AccessRequestApi.requestAction.mockClear();
    // Check that resolves only after the user has canceled the modal
    let resolveCheck;
    RoleApi.getRoleSimilarity.mockImplementationOnce(() => new Promise((resolve) => { resolveCheck = resolve; }));
    wrapper = mountComponent();
    await flushPromises();
    wrapper.vm.updateTabData('details', null, {
      role: {
        name: 'Test',
      },
    });
    wrapper.vm.updateTabData('entitlements', 'load', { result: [{ id: 'ent1' }], resultCount: 1 });
    await flushPromises();
    wrapper.find('div.d-flex.justify-content-end > button').trigger('click');
    await flushPromises();
    // Cancel out while the check is hanging, then let the check resolve
    await wrapper.find('[data-testid="progress-modal-done-button"]').trigger('click');
    resolveCheck({ data: { result: [] } });
    await flushPromises();
    expect(AccessRequestApi.requestAction).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="progress-modal-outcome"]').text()).toBe('');
  });

  it('submits without calling the similarity check when the role has no entitlements', async () => {
    mockRouter({ params: { roleId: 'new', roleStatus: 'active' } });
    AccessRequestApi.requestAction.mockClear();
    RoleApi.getRoleSimilarity.mockClear();
    wrapper = mountComponent();
    await flushPromises();
    wrapper.vm.updateTabData('details', null, {
      role: {
        name: 'Test',
      },
    });
    await flushPromises();
    const saveBtns = wrapper.findAll('div.d-flex.justify-content-end > button');
    saveBtns[1].trigger('click');
    await flushPromises();
    // Nothing to compare: the check is skipped entirely and submission goes straight through
    expect(RoleApi.getRoleSimilarity).not.toHaveBeenCalled();
    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('createRole', 'publish', null, expect.anything());
    expect(wrapper.find('[data-testid="progress-modal-outcome"]').text()).toBe('success');
  });

  it('treats the no-entitlements backend error as a passed check and submits', async () => {
    mockRouter({ params: { roleId: 'testId', roleStatus: 'active' } });
    AccessRequestApi.requestAction.mockClear();
    RoleApi.getRoleSimilarityById.mockClear();
    // Existing role with entitlements in the form, but the backend rejects the
    // check because it resolves the persisted role to having none to compare
    const noEntitlementsError = new Error('Entitlements must be provided for this endpoint.');
    noEntitlementsError.response = { data: { message: 'Entitlements must be provided for this endpoint.' } };
    RoleApi.getRoleSimilarityById.mockImplementationOnce(() => Promise.reject(noEntitlementsError));
    wrapper = mountComponent();
    await flushPromises();
    const saveBtn = wrapper.find('div.d-flex.justify-content-end > button');
    saveBtn.trigger('click');
    await flushPromises();
    // Backend rejects with no-entitlements: check treated as passed, submission auto-proceeds
    expect(wrapper.find('[data-testid="progress-modal-outcome"]').text()).toBe('success');
    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('modifyRole', 'publish', null, expect.anything());
  });

  it('issues a roleGrant request immediately when members are added', async () => {
    mockRouter({ params: { roleId: 'testId', roleStatus: 'active' } });
    wrapper = mountComponent();
    await flushPromises();
    AccessRequestApi.requestAction.mockClear();
    wrapper.vm.updateTabData('members', 'add', [{ usr_id: 'user3', givenName: 'Carol', sn: 'Clark' }]);
    await flushPromises();
    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('roleGrant', 'publish', null, { common: { userId: 'user3', roleId: 'testId' } });
    expect(AccessRequestApi.requestAction).not.toHaveBeenCalledWith('roleRemove', expect.anything(), expect.anything(), expect.anything());
  });

  it('issues a roleRemove request immediately when members are removed', async () => {
    mockRouter({ params: { roleId: 'testId', roleStatus: 'active' } });
    wrapper = mountComponent();
    await flushPromises();
    AccessRequestApi.requestAction.mockClear();
    wrapper.vm.updateTabData('members', 'remove', [{ user: { id: 'user1' } }]);
    await flushPromises();
    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('roleRemove', 'publish', null, { common: { userId: 'user1', roleId: 'testId' } });
    expect(AccessRequestApi.requestAction).not.toHaveBeenCalledWith('roleGrant', expect.anything(), expect.anything(), expect.anything());
  });

  it('reloads the member list and shows an error when a roleGrant partially fails', async () => {
    mockRouter({ params: { roleId: 'testId', roleStatus: 'active' } });
    wrapper = mountComponent();
    await flushPromises();
    const error = new Error('grant failed');
    AccessRequestApi.requestAction
      .mockResolvedValueOnce({ data: { id: 'req1' } })
      .mockRejectedValueOnce(error);
    RoleApi.getRoleDataById.mockClear();
    wrapper.vm.updateTabData('members', 'add', [
      { usr_id: 'user3' },
      { usr_id: 'user4' },
    ]);
    await flushPromises();
    expect(RoleApi.getRoleDataById).toHaveBeenCalledWith('testId', 'active', 'members');
    expect(Notifications.showErrorMessage).toHaveBeenCalledWith(error, expect.any(String));
  });

  it('reloads the member list and shows an error when a roleRemove partially fails', async () => {
    mockRouter({ params: { roleId: 'testId', roleStatus: 'active' } });
    wrapper = mountComponent();
    await flushPromises();
    const error = new Error('remove failed');
    AccessRequestApi.requestAction
      .mockResolvedValueOnce({ data: { id: 'req1' } })
      .mockRejectedValueOnce(error);
    RoleApi.getRoleDataById.mockClear();
    wrapper.vm.updateTabData('members', 'remove', [
      { user: { id: 'user1' } },
      { user: { id: 'user2' } },
    ]);
    await flushPromises();
    expect(RoleApi.getRoleDataById).toHaveBeenCalledWith('testId', 'active', 'members');
    expect(Notifications.showErrorMessage).toHaveBeenCalledWith(error, expect.any(String));
  });

  it('calls the modifyRole endpoint with the correct payload when saving an existing role', async () => {
    const mockPayload = {
      role: {
        roleId: 'testId',
        glossary: {},
        object: {
          description: 'Test',
          entitlements: ['ent1', 'ent2'],
          justifications: [],
          name: 'Test Role',
        },
        status: 'active',
      },
    };
    mockRouter({ params: { roleId: 'testId', roleStatus: 'active' } });
    wrapper = mountComponent();
    await flushPromises();
    AccessRequestApi.requestAction.mockClear();
    RoleApi.getRoleSimilarityById.mockClear();
    const saveBtn = wrapper.find('div.d-flex.justify-content-end > button');
    saveBtn.trigger('click');
    await flushPromises();
    expect(RoleApi.getRoleSimilarityById).toHaveBeenCalledWith('testId', 'active');
    // Check passed with no matches: submission auto-proceeds
    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('modifyRole', 'publish', null, mockPayload);
    expect(AccessRequestApi.requestAction).not.toHaveBeenCalledWith('roleGrant', expect.anything(), expect.anything(), expect.anything());
    expect(AccessRequestApi.requestAction).not.toHaveBeenCalledWith('roleRemove', expect.anything(), expect.anything(), expect.anything());
  });

  it('passes the "Draft Role Saved" heading to the success modal when saving an existing draft role', async () => {
    mockRouter({ params: { roleId: 'testId', roleStatus: 'draft' } });
    wrapper = mountComponent();
    await flushPromises();
    AccessRequestApi.requestAction.mockClear();
    // For a draft role the button order is Publish, then Save
    const saveBtn = wrapper.findAll('div.d-flex.justify-content-end > button')
      .filter((button) => button.text() === 'Save')[0];
    expect(saveBtn.exists()).toBe(true);
    saveBtn.trigger('click');
    await flushPromises();

    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('modifyRole', 'publish', null, expect.objectContaining({
      role: expect.objectContaining({ status: 'draft', roleId: 'testId' }),
    }));
    const successModal = wrapper.findComponent({ name: 'RequestSubmitSuccessModal' });
    expect(successModal.props('headingText')).toBe('Role Draft Saved');
  });

  it('calls the publishRole endpoint when publishing an existing draft role', async () => {
    mockRouter({ params: { roleId: 'testId', roleStatus: 'draft' } });
    wrapper = mountComponent();
    await flushPromises();
    AccessRequestApi.requestAction.mockClear();
    const publishBtn = wrapper.findAll('div.d-flex.justify-content-end > button')
      .filter((button) => button.text() === 'Publish')[0];
    expect(publishBtn.exists()).toBe(true);
    publishBtn.trigger('click');
    await flushPromises();

    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('publishRole', 'publish', null, expect.objectContaining({
      role: expect.objectContaining({ status: 'draft', roleId: 'testId' }),
    }));
    const successModal = wrapper.findComponent({ name: 'RequestSubmitSuccessModal' });
    expect(successModal.props('successText')).toBe('Role draft has been published successfully');
  });

  it('shows the draft-saved heading and message when saving a new role as a draft', async () => {
    mockRouter({ params: { roleId: 'new', roleStatus: 'active' } });
    wrapper = mountComponent();
    await flushPromises();
    AccessRequestApi.requestAction.mockClear();
    wrapper.vm.updateTabData('details', null, {
      role: {
        name: 'Test',
      },
    });
    await flushPromises();
    // For a new role the button order is Save as Draft, then Save
    const saveDraftBtn = wrapper.find('div.d-flex.justify-content-end > button');
    expect(saveDraftBtn.text()).toBe('Save as Draft');
    saveDraftBtn.trigger('click');
    await flushPromises();

    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith('createRole', 'save', null, expect.anything());
    const successModal = wrapper.findComponent({ name: 'RequestSubmitSuccessModal' });
    expect(successModal.props('headingText')).toBe('Role Draft Saved');
    expect(successModal.props('successText')).toBe('Draft role has been successfully saved');
  });
});
