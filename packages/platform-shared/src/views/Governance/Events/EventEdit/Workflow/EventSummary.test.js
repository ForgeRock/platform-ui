/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import i18n from '@/i18n';
import EventSummary from './EventSummary';

describe('EventSummary', () => {
  let wrapper;

  const summaryTest = {
    eventName: 'testName',
    description: 'testDescription',
    workflow: 'testWorkflow',
  };

  function mountComponent(props) {
    return mount(EventSummary, {
      global: {
        plugins: [
          i18n,
        ],
      },
      props: {
        ...props,
      },
    });
  }

  it('shows blank value when no summary', () => {
    wrapper = mountComponent();
    expect(findByTestId(wrapper, 'eventName').text()).toBe(blankValueIndicator);
    expect(findByTestId(wrapper, 'description').text()).toBe(blankValueIndicator);
    expect(findByTestId(wrapper, 'workflow').text()).toBe('');
  });

  it('shows summary values when provided via prop', () => {
    wrapper = mountComponent({ summary: summaryTest });
    expect(findByTestId(wrapper, 'eventName').text()).toBe(summaryTest.eventName);
    expect(findByTestId(wrapper, 'description').text()).toBe(summaryTest.description);
    expect(findByTestId(wrapper, 'workflow').text()).toBe(summaryTest.workflow);
  });

  it('shows blank value when no eventTriggerName', () => {
    wrapper = mountComponent();
    expect(findByTestId(wrapper, 'eventTriggerName').text()).toBe(blankValueIndicator);
  });

  it('shows eventTriggerName when provided via prop', () => {
    wrapper = mountComponent({ eventTriggerName: 'testTrigger' });
    expect(findByTestId(wrapper, 'eventTriggerName').text()).toBe('testTrigger');
  });
});
