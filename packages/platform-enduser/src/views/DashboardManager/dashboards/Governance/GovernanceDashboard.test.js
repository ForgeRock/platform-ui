/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import * as GovernanceEnduserApi from '@/api/GovernanceEnduserApi';
import GovernanceDashboard from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

jest.mock('@/api/GovernanceEnduserApi');

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

  GovernanceEnduserApi.getCertificationItems = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));

  beforeEach(() => {
    wrapper = shallowMount(GovernanceDashboard, {
      localVue,
      mocks: {
        $t: (text) => (text),
        $store: {
          state: {
            UserStore: USER_STORE,
          },
        },
      },
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GovernanceDashboard successfully loaded', () => {
    expect(wrapper.name()).toBe('GovernanceDashboard');
  });

  describe('getAccessReviewsCount', () => {
    it('should call getCertificationItems', async () => {
      const getCertSpy = jest.spyOn(GovernanceEnduserApi, 'getCertificationItems').mockImplementation(() => Promise.resolve({ data: { objectTypes: {} } }));
      wrapper.vm.getAccessReviewsCount();

      await wrapper.vm.$nextTick();
      expect(getCertSpy).toHaveBeenCalledWith({ status: 'active' });
    });
  });
});
