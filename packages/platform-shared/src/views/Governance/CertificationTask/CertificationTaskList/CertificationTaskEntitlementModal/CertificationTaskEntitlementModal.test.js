/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, createLocalVue } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import CertificationTaskEntitlementModal from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

describe('CertificationTaskEntitlementModal', () => {
  let application;
  let wrapper;
  let getApplicationLogo;
  let getApplicationDisplayName;
  beforeEach(() => {
    const localVue = createLocalVue();
    localVue.use(BootstrapVue);
    const entitlement = {
      id: '9986d9a5-5ffd-4046-8643-c34a60cddb6e',
    };
    application = {
      templateName: 'salesforce',
    };

    getApplicationLogo = jest.fn(() => 'testlogo');
    getApplicationDisplayName = jest.fn(() => 'testname');
    const AppSharedUtilsMixin = {
      methods: {
        getApplicationLogo,
        getApplicationDisplayName,
      },
    };

    wrapper = mount(CertificationTaskEntitlementModal, {
      mocks: {
        $t: (t) => t,
      },
      propsData: {
        entitlement,
        application,
      },
      mixins: [AppSharedUtilsMixin],
      localVue,
      attachToDocument: true,
    });
    wrapper.vm.isTest = true;
  });

  it('Component should load correctly', () => {
    expect(wrapper.name()).toBe('CertificationTaskEntitlementModal');
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
