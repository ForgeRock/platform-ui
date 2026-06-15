/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import dayjs from 'dayjs';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import ExtendRequestModal from './ExtendRequestModal';

const validationRules = mockValidation();

jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi', () => ({
  submitCustomRequest: jest.fn(),
}));

jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  displayNotification: jest.fn(),
  showErrorMessage: jest.fn(),
}));

describe('ExtendRequestModal Component', () => {
  let wrapper;

  function setup() {
    wrapper = mount(ExtendRequestModal, {
      global: {
        mocks: {
          $t: (text) => text,
        },
      },
      props: {
        isTesting: true,
        isLoading: false,
        currentItem: {
          item: {
            type: 'accountGrant',
            decision: {
              accessRequest: {
                grantEndDate: new Date().toISOString(),
              },
            },
          },
          user: { id: 'user1' },
          application: { id: 'app1' },
        },
      },
    });
  }

  it('Should not enable submit button if is_after_date validation fails', async () => {
    validationRules.extendRules({ is_after_date: jest.fn().mockReturnValue(false) });
    setup();
    await flushPromises();

    const endDateInput = wrapper.findComponent('[data-testid="test-newEndDate"]');
    await endDateInput.vm.$emit('input', new Date('2097-05-01').toISOString());

    const justificationInput = wrapper.findComponent('[data-testid="test-justificationText"]');
    await justificationInput.vm.$emit('input', 'justification');

    await flushPromises();
    expect(wrapper.find('.btn-primary.disabled').exists()).toBe(true);
  });

  it('Should not enable submit button if justification is not given', async () => {
    validationRules.extendRules({ is_after_date: jest.fn().mockReturnValue(true) });
    setup();
    await flushPromises();

    const endDateInput = wrapper.findComponent('[data-testid="test-newEndDate"]');
    await endDateInput.vm.$emit('input', new Date('2097-05-01').toISOString());

    await flushPromises();
    expect(wrapper.find('.btn-primary.disabled').exists()).toBe(true);
  });

  it('should call API with correct payload', async () => {
    submitCustomRequest.mockResolvedValue({});

    setup();

    // set internal state (script setup → use DOM or expose if needed)
    wrapper.vm.newEndDate = '2076-01-01T10:00';
    wrapper.vm.justificationText = 'Test justification';
    wrapper.vm.selectedPriority = 'high';

    await wrapper.vm.createExtendRequest();
    await flushPromises();

    expect(submitCustomRequest).toHaveBeenCalledTimes(1);

    const [, payload] = submitCustomRequest.mock.calls[0];
    expect(payload).toEqual({
      common: {
        endDate: dayjs('2076-01-01T10:00').local().format(),
        justification: 'Test justification',
        priority: 'high',
        grantId: 'app1',
        grantIdType: 'application',
        grantType: 'accountGrant',
        userId: 'user1',
      },
    });
  });

  it('should handle success response', async () => {
    submitCustomRequest.mockResolvedValue({});

    setup();

    wrapper.vm.newEndDate = '2026-01-01T10:00';
    wrapper.vm.justificationText = 'Test justification';

    await wrapper.vm.createExtendRequest();
    await flushPromises();

    expect(displayNotification).toHaveBeenCalledWith(
      'success',
      expect.any(String),
    );
  });

  it('should handle API error', async () => {
    submitCustomRequest.mockRejectedValue(new Error('API Error'));

    setup();

    wrapper.vm.newEndDate = '2026-01-01T10:00';
    wrapper.vm.justificationText = 'Test justification';

    await wrapper.vm.createExtendRequest();
    await flushPromises();

    expect(showErrorMessage).toHaveBeenCalled();
  });

  it('should toggle loading state correctly', async () => {
    let resolvePromise;
    submitCustomRequest.mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; }),
    );

    setup();

    wrapper.vm.newEndDate = '2026-01-01T10:00';
    wrapper.vm.justificationText = 'Test justification';

    const promise = wrapper.vm.createExtendRequest();

    // loading should be true while API pending
    expect(wrapper.vm.isLoading).toBe(true);

    resolvePromise({});
    await promise;
    await flushPromises();

    expect(wrapper.vm.isLoading).toBe(false);
  });
});
