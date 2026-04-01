/**
 * Copyright 2024-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import i18n from '@/i18n';
import EventDetails from './EventDetails';

mockValidation(['required']);

describe('EventDetails', () => {
  let wrapper;
  function mountComponent(props) {
    return mount(EventDetails, {
      global: {
        plugins: [
          i18n,
        ],
        stubs: ['ResourceSelect'],
      },
      props: { ...props },
    });
  }

  it('displays eventTriggerName', async () => {
    wrapper = mountComponent({ eventTriggerName: 'test' });
    await flushPromises();

    expect(findByTestId(wrapper, 'eventTriggerName').text()).toBe('test');
  });

  it('initializes form values on value prop', async () => {
    wrapper = mountComponent({
      value: {
        eventName: 'testName',
        eventDescription: 'testDescription',
      },
    });
    await flushPromises();

    expect(findByTestId(wrapper, 'eventName').attributes('value')).toBe('testName');
    expect(findByTestId(wrapper, 'eventDescription').attributes('value')).toBe('testDescription');
  });
});
