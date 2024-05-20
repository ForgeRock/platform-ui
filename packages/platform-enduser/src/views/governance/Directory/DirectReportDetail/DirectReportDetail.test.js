/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { mount, flushPromises } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import i18n from '@/i18n';
import DirectReportDetail from './index';
import * as DirectoryApi from '@/api/governance/DirectoryApi';

CommonsApi.getIgaAccessRequest = jest.fn().mockImplementation(() => Promise.resolve({
  data: {
    requireRequestJustification: false,
    requireRejectJustification: false,
    requireApproveJustification: false,
    defaultApprover: '',
    allowSelfApproval: false,
  },
}));
AccessRequestApi.saveNewRequest = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));
CommonsApi.getUserGrants = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));

describe('DirectReportDetail', () => {
  const setup = (grantType) => {
    setupTestPinia({ user: { userId: 'testId' } });
    return mount(DirectReportDetail, {
      global: {
        plugins: [Notifications, i18n],
        mocks: {
          $route: {
            name: 'DirectReportDetail',
            params: {
              grantType,
              userId: 'reporteeId',
            },
          },
        },
      },
    });
  };

  beforeAll(() => {
    jest.spyOn(DirectoryApi, 'getDirectReportUserInfo').mockReturnValue(Promise.resolve({
      data: {
        givenName: 'Test',
        profileImage: './test/img',
        sn: 'User',
        userName: 'Test.User@forgerock.com',
        _refResourceId: 'id',
      },
    }));
  });

  describe('@renders', () => {
    it('side menu with default tab activated', async () => {
      const wrapper = setup('account');
      await flushPromises();
      const directReportDetailTabApp = findByTestId(wrapper, 'access-tab-account');
      expect(directReportDetailTabApp.attributes().class).toContain('active');
      const directReportDetailTabRole = findByTestId(wrapper, 'access-tab-role');
      expect(directReportDetailTabRole.attributes().class).not.toContain('active');
      const directReportDetailTabEnt = findByTestId(wrapper, 'access-tab-entitlement');
      expect(directReportDetailTabEnt.attributes().class).not.toContain('active');
    });
    it('render correct user info in header', async () => {
      const wrapper = setup('account');
      await flushPromises();
      const directReportDetailHeader = findByTestId(wrapper, 'detail-report-header');
      expect(directReportDetailHeader.find('img').attributes('src')).toBe('./test/img');
      expect(directReportDetailHeader.find('h1').text()).toBe('Test User');
      expect(directReportDetailHeader.find('p').text()).toBe('Test.User@forgerock.com');
    });
    it('right tab on page refresh', async () => {
      const wrapper = setup('entitlement');
      await flushPromises();
      const directReportDetailTabEnt = findByTestId(wrapper, 'access-tab-entitlement');
      expect(directReportDetailTabEnt.attributes().class).toContain('active');
    });
    it('default error message on getDirectReportUserInfo fails', async () => {
      jest.spyOn(DirectoryApi, 'getDirectReportUserInfo').mockReturnValueOnce(Promise.reject());
      const wrapper = setup('account');
      const showErrorSpy = jest.spyOn(wrapper.vm, 'displayNotification');
      await flushPromises();
      expect(showErrorSpy).toHaveBeenCalledTimes(1);
      expect(showErrorSpy).toBeCalledWith('danger', 'Error getting direct report user information.');
    });
  });
});
