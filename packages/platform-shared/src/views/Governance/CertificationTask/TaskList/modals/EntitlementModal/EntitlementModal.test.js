/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { getApplicationDisplayName, getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import EntitlementModal from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils');
describe('EntitlementModal', () => {
  let application;
  let wrapper;
  beforeEach(() => {
    const entitlement = {
      id: '9986d9a5-5ffd-4046-8643-c34a60cddb6e',
    };
    application = {
      templateName: 'salesforce',
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
        application,
      },
    });
    wrapper.vm.isTest = true;
  });

  it('should load application logo correctly', () => {
    expect(wrapper.vm.logo).toBe('testlogo');
    expect(getApplicationLogo).toHaveBeenCalledWith(application);
  });

  it('should load entitlement name correctly', () => {
    expect(wrapper.vm.displayName).toBe('governance.certificationTask.entitlementModal.name');
    expect(getApplicationDisplayName).toHaveBeenCalledWith(application);
  });

  it('should render default modalId', () => {
    expect(wrapper.find('#CertificationTaskEntAccountModal').exists()).toBeTruthy();
  });
});
