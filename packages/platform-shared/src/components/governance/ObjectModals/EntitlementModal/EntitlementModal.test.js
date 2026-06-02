/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { getApplicationDisplayName, getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import EntitlementModal from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils');
jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
describe('EntitlementModal', () => {
  let entitlement;
  let wrapper;
  beforeEach(() => {
    entitlement = {
      entitlement: {
        id: '9986d9a5-5ffd-4046-8643-c34a60cddb6e',
      },
      application: {
        templateName: 'salesforce',
      },
    };

    getApplicationLogo.mockImplementation(() => 'testlogo');
    getApplicationDisplayName.mockImplementation(() => 'testname');

    wrapper = mount(EntitlementModal, {
      global: {
        attachTo: document.body,
        mocks: {
          $t: (t) => t,
        },
      },
      propsData: {
        entitlement,
      },
    });
    wrapper.vm.isTest = true;
  });

  it('should load application logo correctly', () => {
    expect(wrapper.vm.logo).toBe('testlogo');
    expect(getApplicationLogo).toHaveBeenCalledWith(entitlement.application);
  });

  it('should load entitlement name correctly', () => {
    expect(wrapper.vm.displayNameHeader).toBe('governance.certificationTask.entitlementModal.name');
    expect(getApplicationDisplayName).toHaveBeenCalledWith(entitlement.application);
  });

  it('should render default modalId', () => {
    expect(wrapper.find('#CertificationTaskEntAccountModal').exists()).toBeTruthy();
  });

  it('does not fetch schema when entitlement has no applicationId or objectType', async () => {
    await flushPromises();
    expect(ApplicationsApi.getObjectTypeSchema).not.toHaveBeenCalled();
    expect(wrapper.vm.objectTypeSchema).toBeNull();
    expect(wrapper.vm.isLoadingSchema).toBe(false);
  });

  it('fetches and sets schema when entitlement has applicationId and objectType', async () => {
    ApplicationsApi.getObjectTypeSchema.mockResolvedValue({
      data: { properties: { __NAME__: { displayName: 'Group Name' } } },
    });

    await wrapper.setProps({
      entitlement: {
        ...entitlement,
        application: { id: 'app1', templateName: 'salesforce' },
        item: { objectType: 'group' },
      },
    });
    await flushPromises();

    expect(ApplicationsApi.getObjectTypeSchema).toHaveBeenCalledWith('app1', 'group');
    expect(wrapper.vm.objectTypeSchema).toEqual({ __NAME__: 'Group Name' });
    expect(wrapper.vm.isLoadingSchema).toBe(false);
  });

  it('leaves schema null and clears loading on API failure', async () => {
    ApplicationsApi.getObjectTypeSchema.mockRejectedValue(new Error('fail'));

    await wrapper.setProps({
      entitlement: {
        ...entitlement,
        application: { id: 'app1', templateName: 'salesforce' },
        item: { objectType: 'group' },
      },
    });
    await flushPromises();

    expect(wrapper.vm.objectTypeSchema).toBeNull();
    expect(wrapper.vm.isLoadingSchema).toBe(false);
  });
});
