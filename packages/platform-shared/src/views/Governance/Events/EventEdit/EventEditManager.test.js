/**
 * Copyright 2024-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { flushPromises, shallowMount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as EventApi from '@forgerock/platform-shared/src/api/governance/EventApi';
import i18n from '@/i18n';
import EventEditManager from './EventEditManager';

describe('EventEditManager', () => {
  const getEventSpy = jest.spyOn(EventApi, 'getEvent').mockImplementation(() => Promise.resolve({ data: {} }));
  EventApi.getFilterProperties = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));
  let wrapper;
  function mountComponent() {
    return shallowMount(EventEditManager, {
      global: {
        plugins: [i18n],
      },
    });
  }

  it('uses event workflow component when eventTrigger is workflow', async () => {
    mockRouter({
      params: { eventId: 'new' },
      query: { eventAction: 'workflow' },
    });

    wrapper = mountComponent();
    await flushPromises();

    expect(findByTestId(wrapper, 'event-workflow').exists()).toBeTruthy();
  });

  it('uses event certification component when eventTrigger is certification', async () => {
    mockRouter({
      params: { eventId: 'new' },
      query: { eventAction: 'certification' },
    });

    wrapper = mountComponent();
    await flushPromises();
    expect(findByTestId(wrapper, 'event-certification').exists()).toBeTruthy();
  });

  it('gets event data when event id is not "new"', async () => {
    mockRouter({
      params: { eventId: '1234' },
      query: { eventAction: 'workflow' },
    });

    wrapper = mountComponent();
    await flushPromises();

    expect(getEventSpy).toHaveBeenCalled();
  });
});
