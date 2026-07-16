/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { findByTestId, findComponentByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as EventApi from '@forgerock/platform-shared/src/api/governance/EventApi';
import * as WorkflowApi from '@forgerock/platform-shared/src/api/governance/WorkflowApi';
import i18n from '@/i18n';
import EventWorkflow from './EventWorkflow';
import * as EventUtil from '@/views/Governance/utils/events';

// WorkflowDetails fetches the workflow list on mount; without this the
// console-error snapshotter bakes "Un-mocked call made to Axios" into the .snap
jest.spyOn(WorkflowApi, 'getWorkflowList').mockResolvedValue({ data: { result: [] } });

mockRouter({
  params: { eventId: 'new' },
  query: { entityType: 'user', mutationType: 'create', eventAction: 'orchestration' },
});
mockValidation(['required']);

const ACCOUNT_EVENT = {
  _id: '1234',
  name: 'Account Event',
  entityType: 'account',
  mutationType: 'create',
  action: { type: 'orchestration', name: 'testWorkflow', parameters: {} },
  owners: [{ id: 'managed/user/userId' }],
  condition: { version: 'v2', filter: {} },
  status: 'active',
};

describe('EventWorkflow', () => {
  function mountComponent(props) {
    setupTestPinia();
    return mount(EventWorkflow, {
      global: {
        plugins: [i18n],
        stubs: ['ResourceSelect'],
      },
      props: {
        entityType: 'user',
        mutationType: 'create',
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

  it('passes the entity context and trigger name props to the event details tab', async () => {
    const wrapper = mountComponent({
      entityType: 'account',
      mutationType: 'update',
      eventTriggerName: 'Account Updated',
    });

    const eventDetails = findComponentByTestId(wrapper, 'event-details');
    expect(eventDetails.props('entityType')).toBe('account');
    expect(eventDetails.props('mutationType')).toBe('update');
    expect(eventDetails.props('eventTriggerName')).toBe('Account Updated');
  });

  it('threads the manager schemaResource to the event details tab, falling back to the entity type', async () => {
    const managerResource = mountComponent({
      entityType: 'agent',
      mutationType: 'create',
      schemaResource: 'account',
    });

    const managerDetails = findComponentByTestId(managerResource, 'event-details');
    expect(managerDetails.props('schemaResource')).toBe('account');

    const fallback = mountComponent({ entityType: 'account', mutationType: 'create' });
    const fallbackDetails = findComponentByTestId(fallback, 'event-details');
    expect(fallbackDetails.props('schemaResource')).toBe('account');
  });

  it('derives the entity context from the loaded event when props are absent', async () => {
    const wrapper = mountComponent({ entityType: '', mutationType: '', event: ACCOUNT_EVENT });

    expect(wrapper.vm.entityContext).toEqual({ entityType: 'account', mutationType: 'create' });
  });

  it('should call to save a new event', async () => {
    const payloadSpy = jest.spyOn(EventUtil, 'buildEventWorkflowPayload').mockReturnValue({ test: 'test' });
    const saveSpy = jest.spyOn(EventApi, 'createEvent')
      .mockReturnValue(Promise.resolve({}));

    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const formWizard = findComponentByTestId(wrapper, 'form-wizard');
    formWizard.vm.$emit('save');
    await wrapper.vm.$nextTick();

    expect(saveSpy).toHaveBeenCalledWith({ test: 'test' });
    // the builder receives the context object derived from the props
    expect(payloadSpy).toHaveBeenCalledWith(
      expect.objectContaining({ eventDetails: expect.any(Object), workflowDetails: expect.any(Object) }),
      { entityType: 'user', mutationType: 'create' },
    );
  });

  it('should call to update and existing event', async () => {
    jest.spyOn(EventUtil, 'buildEventWorkflowPayload').mockReturnValue({ test: 'test' });
    const saveSpy = jest.spyOn(EventApi, 'putEvent')
      .mockReturnValue(Promise.resolve({}));

    mockRouter({
      params: { eventId: '1234' },
      query: { entityType: 'user', mutationType: 'create', eventAction: 'orchestration' },
    });

    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const formWizard = findComponentByTestId(wrapper, 'form-wizard');
    formWizard.vm.$emit('save');
    await wrapper.vm.$nextTick();

    expect(saveSpy).toHaveBeenCalledWith('1234', { test: 'test' });
  });

  it('sends the account entity context from the props in the save payload', async () => {
    const payloadSpy = jest.spyOn(EventUtil, 'buildEventWorkflowPayload').mockReturnValue({ test: 'test' });
    jest.spyOn(EventApi, 'createEvent').mockReturnValue(Promise.resolve({}));

    const router = await import('vue-router');
    router.useRoute.mockReturnValueOnce({
      params: { eventId: 'new' },
      query: { entityType: 'account', mutationType: 'create', eventAction: 'orchestration' },
    });

    const wrapper = mountComponent({ entityType: 'account', mutationType: 'create' });
    await wrapper.vm.$nextTick();

    const formWizard = findComponentByTestId(wrapper, 'form-wizard');
    formWizard.vm.$emit('save');
    await wrapper.vm.$nextTick();

    expect(payloadSpy).toHaveBeenCalledWith(expect.anything(), { entityType: 'account', mutationType: 'create' });
  });
});
