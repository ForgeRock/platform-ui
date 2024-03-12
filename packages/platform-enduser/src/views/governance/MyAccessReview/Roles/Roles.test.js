/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { mount, flushPromises } from '@vue/test-utils';
import Roles from './index';
import i18n from '@/i18n';

const getUserGrantsResponse = {
  data: {
    result: [
      {
        item: {
          type: 'roleMembership',
        },
        compositeId: '123-abc',
        relationship: {
          conditional: true,
        },
        role: {
          name: 'roleName',
        },
      },
    ],
    totalCount: 1,
  },
};

describe('Roles', () => {
  const mountComponent = () => {
    setupTestPinia({ user: { userId: 'testId' } });
    return mount(Roles, {
      global: {
        plugins: [i18n],
        mocks: {
        },
      },
    });
  };

  describe('@renders', () => {
    it('shows table with user grant, and assignment of rule-based when relationship.conditional === true', async () => {
      CommonsApi.getUserGrants = jest.fn().mockImplementation(() => Promise.resolve(getUserGrantsResponse));
      const wrapper = mountComponent('account');
      await flushPromises();

      const assignmentBadge = wrapper.find('[role="cell"] .badge-light');
      expect(assignmentBadge.text()).toBe('Rule-based');
    });

    it('shows table with user grant, and assignment of direct when relationship.conditional === true', async () => {
      const directGetUserGrantsResponse = cloneDeep(getUserGrantsResponse);
      directGetUserGrantsResponse.data.result[0].relationship.conditional = false;
      CommonsApi.getUserGrants = jest.fn().mockImplementation(() => Promise.resolve(directGetUserGrantsResponse));
      const wrapper = mountComponent('account');
      await flushPromises();

      const assignmentBadge = wrapper.find('[role="cell"] .badge-success');
      expect(assignmentBadge.text()).toBe('Direct');
    });
  });
});
