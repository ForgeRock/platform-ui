/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import * as AccessReviewApi from '@/api/governance/AccessReviewApi';
import * as AccessRequestApi from '@/api/governance/AccessRequestApi';
import GovernanceDashboard from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

jest.mock('@/api/governance/AccessReviewApi');
jest.mock('@/api/governance/AccessRequestApi');

/**
 * @constant
 * @type {Object}
 * @default
 */
const USER_STORE = {
  userId: null,
  managedResource: null,
  roles: null,
  internalUser: false,
  adminUser: false,
  profile: {},
  schema: {},
  access: [],
  givenName: '',
  sn: '',
  email: '',
  userName: '',
};

describe('GovernanceDashboard', () => {
  let wrapper;

  AccessReviewApi.getCertificationItems = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));
  AccessRequestApi.getRequestsItems = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));
  AccessRequestApi.getApprovalsItems = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));

  function shallowMountComponent(governanceEnabledV3 = false) {
    wrapper = shallowMount(GovernanceDashboard, {
      localVue,
      mocks: {
        $t: (text) => (text),
        $store: {
          state: {
            UserStore: USER_STORE,
            SharedStore: {
              isGovernanceEnabledV3: governanceEnabledV3,
            },
          },
        },
      },
    });
  }
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GovernanceDashboard successfully loaded', () => {
    shallowMountComponent();
    expect(wrapper.name()).toBe('GovernanceDashboard');
  });

  describe('getAccessReviewsCount', () => {
    shallowMountComponent();
    it('should call getCertificationItems', async () => {
      const getCertSpy = jest.spyOn(AccessReviewApi, 'getCertificationItems').mockImplementation(() => Promise.resolve({ data: { objectTypes: {} } }));
      wrapper.vm.getAccessReviewsCount();

      await wrapper.vm.$nextTick();
      expect(getCertSpy).toHaveBeenCalledWith({ status: 'active' });
    });
  });

  describe('getPendingRequestsCount', () => {
    shallowMountComponent(true);
    it('should call getRequestsItems', async () => {
      const getCertSpy = jest.spyOn(AccessRequestApi, 'getRequestsItems').mockImplementation(() => Promise.resolve({ data: { objectTypes: {} } }));
      wrapper.vm.getPendingRequestsCount();

      await wrapper.vm.$nextTick();
      expect(getCertSpy).toHaveBeenCalledWith({ status: 'pending' });
    });
  });

  describe('getPendingApprovalsCount', () => {
    shallowMountComponent(true);
    it('should call getApprovalsItems', async () => {
      const getCertSpy = jest.spyOn(AccessRequestApi, 'getApprovalsItems').mockImplementation(() => Promise.resolve({ data: { objectTypes: {} } }));
      wrapper.vm.getPendingApprovalsCount();

      await wrapper.vm.$nextTick();
      expect(getCertSpy).toHaveBeenCalledWith({ status: 'pending' });
    });
  });
});
