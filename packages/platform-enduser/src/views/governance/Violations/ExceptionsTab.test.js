/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, shallowMount } from '@vue/test-utils';
import * as ViolationApi from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import * as Notification from '@forgerock/platform-shared/src/utils/notification';
import ExceptionsTab from './ExceptionsTab';
import i18n from '@/i18n';
import router from '@/router';

describe('ExceptionsTab', () => {
  function setup() {
    return shallowMount(ExceptionsTab, {
      global: {
        plugins: [i18n, router],
      },
    });
  }

  it('getExceptions method should load the violation list', async () => {
    const data = {
      result: [
        {
          decision: {
            violation: {
              status: 'in-progress',
              startDate: '2024-05-13T23:12:21+00:00',
            },
          },
          policyRule: {
            name: 'NoCustomerSupport',
          },
          user: {
            cn: 'Opal Millions',
            givenName: 'Opal',
            id: '4f268edd-fa51-412a-8168-1443b4ad8198',
            mail: 'Opal@IGATestQA.onmicrosoft.com',
            sn: 'Millions',
            userName: 'Opal@IGATestQA.onmicrosoft.com',
          },
          id: '002bd665-3946-465c-b444-de470fa04254',
        },
        {
          decision: {
            violation: {
              status: 'in-progress',
              startDate: '2024-05-14T10:30:00+00:00',
            },
          },
          policyRule: {
            name: 'NoUnauthorizedAccess',
          },
          user: {
            cn: 'John Doe',
            givenName: 'John',
            id: '5b239edd-ab67-492a-9877-5678cdef1234',
            mail: 'John@IGATestQA.onmicrosoft.com',
            sn: 'Doe',
            userName: 'John@IGATestQA.onmicrosoft.com',
          },
          id: '112ae773-4829-4f8c-a6b4-ccd570ba1234',
        },
        {
          decision: {
            violation: {
              status: 'in-progress',
              startDate: '2024-05-15T15:45:00+00:00',
            },
          },
          policyRule: {
            name: 'DataPrivacyBreach',
          },
          user: {
            cn: 'Alice Johnson',
            givenName: 'Alice',
            id: '7c120edd-cd23-487a-9278-abcde4567890',
            mail: 'Alice@IGATestQA.onmicrosoft.com',
            sn: 'Johnson',
            userName: 'Alice@IGATestQA.onmicrosoft.com',
          },
          id: '223bf884-5690-4f9b-a8cd-dfd671cb4567',
        },

      ],
      totalCount: 100,
      resultCount: 3,
    };
    ViolationApi.getViolationListEndUser = jest.fn().mockImplementation(() => Promise.resolve({ data }));

    const wrapper = setup();
    wrapper.vm.getExceptions();
    await flushPromises();

    expect(wrapper.vm.exceptions).toEqual(data.result);
    expect(wrapper.vm.exceptionsCount).toBe(100);
    expect(wrapper.vm.isLoadingExceptions).toBe(false);
  });

  it('getExceptions method should handle error when loading the violation list', async () => {
    const error = new Error('error');
    ViolationApi.getViolationListEndUser.mockRejectedValue(error);
    const showErrorMessageSpy = jest.spyOn(Notification, 'showErrorMessage').mockImplementation(() => {});

    const wrapper = setup();

    wrapper.vm.getExceptions();
    await flushPromises();

    expect(wrapper.vm.exceptions).toEqual([]);
    expect(wrapper.vm.exceptionsCount).toBe(0);
    expect(wrapper.vm.isLoadingExceptions).toBe(false);
    expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'There was an error getting the exception data');
  });

  it('should navigate to the exception details page', async () => {
    const wrapper = setup();
    const routerPushSpy = jest.spyOn(router, 'push').mockImplementation(() => {});
    const exceptionListComponent = wrapper.findComponent({ name: 'ExceptionList' });
    exceptionListComponent.vm.$emit('view-exception-details', { id: '002bd665-3946-465c-b444-de470fa04254' });
    await flushPromises();

    expect(routerPushSpy).toHaveBeenCalledWith({
      name: 'Violation',
      params: {
        violationId: '002bd665-3946-465c-b444-de470fa04254',
        itemType: 'exception',
      },
    });
  });
});
