/**
 * Copyright 2024-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { findByTestId, findComponentByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as EventApi from '@forgerock/platform-shared/src/api/governance/EventApi';
import i18n from '@/i18n';
import EventWorkflow from './EventWorkflow';
import * as EventUtil from '@/views/Governance/utils/events';

mockRouter({
  params: { eventId: 'new' },
  query: { eventAction: 'workflow' },
});
mockValidation(['required']);

describe('EventWorkflow', () => {
  function mountComponent(props) {
    setupTestPinia();
    return mount(EventWorkflow, {
      global: {
        plugins: [i18n],
        stubs: ['ResourceSelect'],
      },
      props: {
        ...props,
      },
    });
  }

  it('should have event details, workflow details, and event summary components', async () => {
    const wrapper = mountComponent();

    expect(findByTestId(wrapper, 'event-details').exists()).toBeTruthy();
    expect(findByTestId(wrapper, 'workflow-details').exists()).toBeTruthy();
    expect(findByTestId(wrapper, 'event-summary').exists()).toBeTruthy();
  });

  it('should call to save a new event', async () => {
    jest.spyOn(EventUtil, 'buildEventWorkflowPayload').mockReturnValue({ test: 'test' });
    const saveSpy = jest.spyOn(EventApi, 'createEvent')
      .mockReturnValue(Promise.resolve({}));

    const router = await import('vue-router');
    router.useRoute.mockReturnValueOnce({
      params: { eventId: 'new' },
      query: { eventAction: 'workflow' },
    });

    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const formWizard = findComponentByTestId(wrapper, 'form-wizard');
    formWizard.vm.$emit('save');
    await wrapper.vm.$nextTick();

    expect(saveSpy).toHaveBeenCalledWith({ test: 'test' });
  });

  it('should call to update and existing event', async () => {
    jest.spyOn(EventUtil, 'buildEventWorkflowPayload').mockReturnValue({ test: 'test' });
    const saveSpy = jest.spyOn(EventApi, 'putEvent')
      .mockReturnValue(Promise.resolve({}));

    mockRouter({
      params: { eventId: '1234' },
      query: { eventAction: 'workflow' },
    });

    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const formWizard = findComponentByTestId(wrapper, 'form-wizard');
    formWizard.vm.$emit('save');
    await wrapper.vm.$nextTick();

    expect(saveSpy).toHaveBeenCalledWith('1234', { test: 'test' });
  });
});
