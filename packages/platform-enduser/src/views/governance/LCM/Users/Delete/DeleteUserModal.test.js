/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import DeleteUserModal from './DeleteUserModal';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');

describe('DeleteUserModal', () => {
  let wrapper;

  AccessRequestApi.submitCustomRequest.mockImplementation(() => Promise.resolve({ data: { id: '123' } }));

  function mountComponent() {
    return mount(DeleteUserModal, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: { push: jest.fn() },
        },
      },
      props: {
        isTesting: true,
        userId: 'testUserId',
      },
    });
  }

  it('can confirm user deletion and move to next step', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const nextButton = wrapper.findComponent('[aria-label="Submit"]');
    expect(nextButton.exists()).toBe(true);
    expect(wrapper.vm.step).toBe(0);

    expect(wrapper.text()).toContain('Are you sure you want to delete this user?');

    nextButton.trigger('click');
    await flushPromises();
    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith(
      'deleteUser',
      {
        common: {},
        custom: {},
        user: { userId: 'testUserId' },
      },
    );
    expect(wrapper.vm.step).toBe(1);
  });

  it('second step has link to access request', async () => {
    wrapper = mountComponent();
    const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
    wrapper.vm.step = 1;
    wrapper.vm.requestId = '123';
    await flushPromises();

    const viewLink = wrapper.find('button.btn-outline-primary');
    expect(viewLink.text()).toBe('View Request');
    viewLink.trigger('click');

    expect(routerPushSpy).toHaveBeenCalledWith({
      name: 'MyRequestDetails',
      params: { requestId: '123' },
    });
  });
});
