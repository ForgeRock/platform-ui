/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import i18n from '@/i18n';
import GovAssignResourceModal from './GovAssignResourceModal';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  debounce: (fn) => Object.assign(fn, { cancel: () => {} }),
}));

jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

EntitlementApi.getApplicationList.mockResolvedValue({
  data: { result: [] },
});

CommonsApi.getUserGrants.mockResolvedValue({
  data: { result: [] },
});

mockValidation(['required']);

const mountComponent = (propsData = {}) => mount(GovAssignResourceModal, {
  global: {
    plugins: [i18n],
  },
  props: {
    entitlementOptions: [{ text: 'EntitlementText', value: 'value' }],
    isTesting: true,
    resourceType: 'entitlements',
    ...propsData,
  },
});

/**
 * Advances the modal from step 0 (application picker) to step 1 (entitlement selection)
 * by emitting a selected:option event and clicking Next.
 */
async function advanceToStepOne(wrapper) {
  const selectApplicationField = wrapper.findComponent('[label="Select application"]');
  selectApplicationField.vm.$emit('selected:option', { name: 'testApp', icon: 'icon.svg' });
  await flushPromises();
  const nextButton = wrapper.findAllComponents('[type="button"]').filter((item) => item.text().includes('Next'))[0];
  await nextButton.trigger('click');
  await flushPromises();
}

describe('GovAssignResourceModal Component', () => {
  it('queries applications via getApplicationList with disconnected filter when resourceType is roles', async () => {
    mountComponent({ parentResourceName: 'role', resourceType: 'roles' });
    await flushPromises();

    expect(EntitlementApi.getApplicationList).toHaveBeenCalledWith(
      'application',
      expect.objectContaining({
        queryFilter: expect.stringContaining('!(application.isDisconnected eq "true")'),
      }),
    );
  });

  it('queries applications via getApplicationList without disconnected filter when resourceType is entitlements', async () => {
    mountComponent({ parentResourceName: 'role', resourceType: 'entitlements' });
    await flushPromises();

    expect(EntitlementApi.getApplicationList).toHaveBeenCalledWith(
      'application',
      expect.objectContaining({
        queryFilter: expect.not.stringContaining('!(application.isDisconnected eq "true")'),
      }),
    );
  });

  it('queries applications with name filter when searching', async () => {
    const wrapper = mountComponent({ parentResourceName: 'role' });
    await flushPromises();

    const resourceSelect = wrapper.findComponent('[label="Select application"]');
    resourceSelect.vm.debouncedSearch('myapp');
    await flushPromises();

    expect(EntitlementApi.getApplicationList).toHaveBeenCalledWith(
      'application',
      expect.objectContaining({
        queryFilter: expect.stringContaining('application.name co "myapp"'),
      }),
    );
  });

  it('sets an accessible aria-label on the modal', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const modal = wrapper.findComponent({ name: 'BModal' });
    expect(modal.props('ariaLabel')).toContain('Entitlements');
  });

  it('changes step when next is clicked', async () => {
    const wrapper = mountComponent({ parentResourceName: 'role' });
    await flushPromises();
    expect(wrapper.find('header').text()).toContain('Grant Entitlements');

    const selectApplicationField = wrapper.findComponent('[label="Select application"]');
    selectApplicationField.vm.$emit('selected:option', { name: 'testApp', icon: 'icon.svg' });
    await flushPromises();
    const nextButton = wrapper.findAllComponents('[type="button"]').filter((item) => item.text().includes('Next'))[0];
    nextButton.trigger('click');
    await flushPromises();
    expect(nextButton.attributes('disabled')).toBeUndefined();
    expect(wrapper.find('header').text()).toContain('Choose Entitlements');
  });

  it('enables grant button when application is selected', async () => {
    const wrapper = mountComponent({ parentResourceName: 'role' });
    await flushPromises();

    const selectApplicationField = wrapper.findComponent('[label="Select application"]');
    selectApplicationField.vm.$emit('selected:option', { name: 'testApp', icon: 'icon.svg' });
    await flushPromises();
    const nextButton = wrapper.findAll('[type="button"]').filter((item) => item.text().includes('Next'))[0];
    expect(nextButton.attributes('disabled')).toBeUndefined();
    nextButton.trigger('click');
    await flushPromises();

    wrapper.find('[type="multiselect"]').trigger('click');
    wrapper.find('[role="option"]').trigger('click');
    await flushPromises();

    const grantButton = wrapper.findAll('[type="button"]').filter((item) => item.text().includes('Grant Entitlements'))[0];
    expect(grantButton.attributes('disabled')).toBeFalsy();
  });

  it('calls getUserGrants when userId is set and an application is selected on next', async () => {
    const wrapper = mountComponent({ parentResourceName: 'role', userId: 'user-1' });
    await flushPromises();

    const selectApplicationField = wrapper.findComponent('[label="Select application"]');
    selectApplicationField.vm.$emit('selected:option', { name: 'testApp', icon: 'icon.svg' });
    wrapper.vm.selectedApplication = 'managed/application/app-1';
    await flushPromises();

    wrapper.findAll('[type="button"]').filter((item) => item.text().includes('Next'))[0].trigger('click');
    await flushPromises();

    expect(CommonsApi.getUserGrants).toHaveBeenCalledWith('user-1', expect.objectContaining({
      grantType: 'account',
      _queryFilter: "application.id eq 'app-1'",
    }));
  });

  it('does not call getUserGrants when userId is not set', async () => {
    CommonsApi.getUserGrants.mockClear();
    const wrapper = mountComponent({ parentResourceName: 'role' });
    await flushPromises();

    wrapper.vm.selectedApplication = 'managed/application/app-1';
    wrapper.findAll('[type="button"]').filter((item) => item.text().includes('Next'))[0].trigger('click');
    await flushPromises();

    expect(CommonsApi.getUserGrants).not.toHaveBeenCalled();
  });

  it('shows account dropdown when multiple account grants are returned', async () => {
    CommonsApi.getUserGrants.mockResolvedValue({
      data: {
        result: [
          { descriptor: { idx: { '/account': { displayName: 'Account A' } } }, keys: { accountId: 'acc-1' } },
          { descriptor: { idx: { '/account': { displayName: 'Account B' } } }, keys: { accountId: 'acc-2' } },
        ],
      },
    });

    const wrapper = mountComponent({ parentResourceName: 'role', userId: 'user-1' });
    await flushPromises();

    wrapper.vm.selectedApplication = 'managed/application/app-1';
    wrapper.findAll('[type="button"]').filter((item) => item.text().includes('Next'))[0].trigger('click');
    await flushPromises();

    expect(wrapper.vm.accountGrants).toHaveLength(2);
    expect(wrapper.vm.accountGrantsLoading).toBe(false);
  });

  it('disables grant button when multiple accounts exist but none is selected', async () => {
    CommonsApi.getUserGrants.mockResolvedValue({
      data: {
        result: [
          { descriptor: { idx: { '/account': { displayName: 'Account A' } } }, keys: { accountId: 'acc-1' } },
          { descriptor: { idx: { '/account': { displayName: 'Account B' } } }, keys: { accountId: 'acc-2' } },
        ],
      },
    });

    const wrapper = mountComponent({ parentResourceName: 'role', userId: 'user-1' });
    await flushPromises();

    wrapper.vm.selectedApplication = 'managed/application/app-1';
    wrapper.findAll('[type="button"]').filter((item) => item.text().includes('Next'))[0].trigger('click');
    await flushPromises();

    wrapper.find('[type="multiselect"]').trigger('click');
    wrapper.find('[role="option"]').trigger('click');
    await flushPromises();

    const grantButton = wrapper.findAll('[type="button"]').filter((item) => item.text().includes('Grant Entitlements'))[0];
    // disabled="" is a boolean HTML attribute — present means disabled, toBeDefined() is the correct check
    expect(grantButton.attributes('disabled')).toBeDefined();
  });

  it('auto-selects accountId when exactly one account grant is returned', async () => {
    CommonsApi.getUserGrants.mockResolvedValue({
      data: {
        result: [
          { descriptor: { idx: { '/account': { displayName: 'Only Account' } } }, keys: { accountId: 'acc-only' } },
        ],
      },
    });

    const wrapper = mountComponent({ parentResourceName: 'role', userId: 'user-1' });
    await flushPromises();

    wrapper.vm.selectedApplication = 'managed/application/app-1';
    wrapper.findAll('[type="button"]').filter((item) => item.text().includes('Next'))[0].trigger('click');
    await flushPromises();

    expect(wrapper.vm.selectedAccountId).toBe('acc-only');
  });

  it('emits assign-resources with { entitlements, accountId } shape', async () => {
    CommonsApi.getUserGrants.mockResolvedValue({
      data: {
        result: [
          { descriptor: { idx: { '/account': { displayName: 'Only Account' } } }, keys: { accountId: 'acc-only' } },
        ],
      },
    });

    const wrapper = mountComponent({
      parentResourceName: 'role',
      userId: 'user-1',
      entitlementOptions: [{ text: 'EntitlementText', value: 'value', assignmentId: 'assign-1' }],
    });
    await flushPromises();

    // Set up step-2 state directly to avoid multiselect DOM interaction complexity
    wrapper.vm.stepIndex = 1;
    wrapper.vm.selectedApplication = 'managed/application/app-1';
    wrapper.vm.selectedEntitlements = ['value'];
    wrapper.vm.selectedAccountId = 'acc-only';
    await flushPromises();

    wrapper.findAll('[type="button"]').filter((item) => item.text().includes('Grant Entitlements'))[0].trigger('click');
    await flushPromises();

    expect(wrapper.emitted('assign-resources')).toBeTruthy();
    const [payload] = wrapper.emitted('assign-resources')[0];
    expect(payload).toMatchObject({
      entitlements: [{ entitlementId: 'value', assignmentId: 'assign-1' }],
      accountId: 'acc-only',
    });
  });

  describe('justification field', () => {
    it('renders the justification textarea on step 1 with required: true validation when requireRequestJustification is true', async () => {
      const wrapper = mountComponent({ requireRequestJustification: true });
      await flushPromises();

      await advanceToStepOne(wrapper);

      const allFields = wrapper.findAllComponents({ name: 'FrField' });
      const justificationField = allFields.find((f) => f.props('name') === 'justificationText');
      expect(justificationField).toBeDefined();
      expect(justificationField.vm.$attrs.validation).toEqual({ required: true });
    });

    it('renders the justification textarea on step 1 with required: false validation when requireRequestJustification is false (default)', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await advanceToStepOne(wrapper);

      const allFields = wrapper.findAllComponents({ name: 'FrField' });
      const justificationField = allFields.find((f) => f.props('name') === 'justificationText');
      expect(justificationField).toBeDefined();
      expect(justificationField.vm.$attrs.validation).toEqual({ required: false });
    });

    it('emits assign-resources with { entitlements, justification } payload when grant button is clicked', async () => {
      // Stub Form (vee-validate component name) to always report valid so the grant button is enabled
      const wrapper = mount(GovAssignResourceModal, {
        global: {
          plugins: [i18n],
          stubs: {
            Form: { template: '<span><slot :meta="{ valid: true }" /></span>' },
          },
        },
        props: {
          entitlementOptions: [{ text: 'EntitlementText', value: 'value' }],
          isTesting: true,
          resourceType: 'entitlements',
        },
      });
      await flushPromises();

      await advanceToStepOne(wrapper);

      // Set justification text via the field's v-model compat event
      const allFields = wrapper.findAllComponents({ name: 'FrField' });
      const justificationField = allFields.find((f) => f.props('name') === 'justificationText');
      await justificationField.vm.$emit('modelCompat:input', 'My justification');
      await flushPromises();

      const grantButton = wrapper.findAll('[type="button"]').filter((item) => item.text().includes('Grant Entitlements'))[0];
      await grantButton.trigger('click');
      await flushPromises();

      const emitted = wrapper.emitted('assign-resources');
      expect(emitted).toBeTruthy();
      expect(emitted[0][0]).toMatchObject({
        entitlements: expect.any(Array),
        justification: 'My justification',
      });
    });
  });
});
