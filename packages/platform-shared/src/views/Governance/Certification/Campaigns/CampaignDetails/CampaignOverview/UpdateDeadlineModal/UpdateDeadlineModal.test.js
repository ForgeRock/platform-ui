/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { findByTestId, findComponentByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount, flushPromises } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import UpdateDeadlineModal from './index';

const rules = mockValidation();

describe('UpdateDeadlineModal Component', () => {
  let wrapper;

  function setup() {
    wrapper = mount(UpdateDeadlineModal, {
      global: {
        mocks: {
          $t: (text) => text,
        },
      },
      props: {
        isTesting: true,
        loading: false,
      },
    });
  }

  it('Should not be valid to set a deadline in the past', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2077-01-01'));
    rules.extendRules({ is_after_date: jest.fn().mockReturnValue(false) });
    setup();

    const deadline = findComponentByTestId(wrapper, 'deadline');
    deadline.vm.$emit('input', '2023-01-01');

    await flushPromises();
    jest.runAllTimers();

    const saveButton = findByTestId(wrapper, 'save-button');
    await saveButton.trigger('click');

    expect(saveButton.attributes('disabled')).toBeDefined();
    jest.useRealTimers();
  });

  it('Should send a new deadline on save if set a future date', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2077-01-01'));
    rules.extendRules({ is_after_date: jest.fn().mockReturnValue(true) });
    setup();

    const deadline = findComponentByTestId(wrapper, 'deadline');
    deadline.vm.$emit('input', '2033-01-01');

    await flushPromises();
    jest.runAllTimers();

    const saveButton = findByTestId(wrapper, 'save-button');
    expect(saveButton.attributes().disabled).toBeUndefined();
    await saveButton.trigger('click');

    expect(wrapper.emitted('update-deadline')).toStrictEqual([['2033-01-01T00:00:00+00:00']]);
    jest.useRealTimers();
  });

  it('clean newDeadline on reset', () => {
    setup();
    wrapper.setData({
      newDeadline: '2022-12-29',
    });

    wrapper.vm.resetModal();

    expect(wrapper.vm.newDeadline).toBeNull();
  });
});
