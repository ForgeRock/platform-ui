/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, shallowMount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import * as EventApi from '@forgerock/platform-shared/src/api/governance/EventApi';
import i18n from '@/i18n';
import EventEditManager from './EventEditManager';

jest.mock('@forgerock/platform-shared/src/api/governance/EventApi');

const getEventSpy = jest.fn();
const getFilterPropertiesSpy = jest.fn();

EventApi.getEvent.mockImplementation(getEventSpy);
EventApi.getFilterProperties.mockImplementation(getFilterPropertiesSpy);
EventApi.createEvent.mockResolvedValue({ data: {} });
EventApi.putEvent.mockResolvedValue({ data: {} });
EventApi.deleteEvent.mockResolvedValue({ data: {} });
EventApi.updateEvent.mockResolvedValue({ data: {} });
EventApi.getEventList.mockResolvedValue({ data: { result: [], totalCount: 0 } });
EventApi.getEventConfig.mockResolvedValue({ data: {} });

const ACCOUNT_SCHEMA = {
  schema: {
    'account.before.descriptor.displayName': { displayName: 'Display Name', type: 'string' },
    'account.after.descriptor.displayName': { type: 'string' },
    'account.before.descriptor.applicationName': { displayName: 'Application Name', type: 'string' },
    'account.before.item.type': { displayName: 'Object Type', type: 'string' },
    'account.before.item.references': { type: 'array' },
  },
};

const USER_SCHEMA = {
  schema: {
    'user.before.sn': { displayName: 'Last Name', type: 'string' },
    'user.before.givenName': { displayName: 'First Name', type: 'string' },
    'user.after.givenName': { type: 'string' },
  },
};

const TEST_EVENT = {
  _id: '1234',
  name: 'Test Event',
  entityType: 'account',
  mutationType: 'create',
  action: { type: 'orchestration', name: 'testWorkflow', parameters: {} },
};

describe('EventEditManager', () => {
  let notification;

  beforeAll(() => {
    // Shared jest i18n lacks governance.events; merge the admin-runtime keys.
    i18n.global.mergeLocaleMessage('en', {
      governance: {
        events: {
          listView: {
            create: 'created',
            update: 'updated',
            delete: 'deleted',
          },
          errors: {
            getEventError: 'There was an error retrieving event',
            getPropertiesError: 'There was an error retrieving properties',
            unsupportedActionType: 'Unsupported event action type.',
          },
        },
      },
    });
  });

  afterEach(() => {
    getEventSpy.mockClear();
    getFilterPropertiesSpy.mockClear();
  });

  function mountComponent(routeOptions) {
    notification = mockNotification();
    setupTestPinia({ governance: { eventConfig: null } });
    mockRouter(routeOptions);
    return shallowMount(EventEditManager, {
      global: {
        plugins: [i18n],
      },
    });
  }

  it('uses the workflow component when eventAction is orchestration', async () => {
    mockRouter({
      params: { eventId: 'new' },
      query: { entityType: 'account', mutationType: 'create', eventAction: 'orchestration' },
    });
    getFilterPropertiesSpy.mockResolvedValue({ data: ACCOUNT_SCHEMA });

    const wrapper = mountComponent({
      params: { eventId: 'new' },
      query: { entityType: 'account', mutationType: 'create', eventAction: 'orchestration' },
    });
    await flushPromises();

    expect(findByTestId(wrapper, 'event-orchestration').exists()).toBeTruthy();
    expect(getFilterPropertiesSpy).toHaveBeenCalledWith('account');
  });

  it('uses the workflow component for the legacy workflow alias', async () => {
    getFilterPropertiesSpy.mockResolvedValue({ data: USER_SCHEMA });

    const wrapper = mountComponent({
      params: { eventId: 'new' },
      query: { eventAction: 'workflow', entityType: 'user', mutationType: 'create' },
    });
    await flushPromises();

    expect(findByTestId(wrapper, 'event-workflow').exists()).toBeTruthy();
    expect(getFilterPropertiesSpy).toHaveBeenCalledWith('user');
  });

  it('uses the certification component when eventAction is certification', async () => {
    getFilterPropertiesSpy.mockResolvedValue({ data: USER_SCHEMA });

    const wrapper = mountComponent({
      params: { eventId: 'new' },
      query: { entityType: 'user', mutationType: 'create', eventAction: 'certification' },
    });
    await flushPromises();

    expect(findByTestId(wrapper, 'event-certification').exists()).toBeTruthy();
    expect(getFilterPropertiesSpy).toHaveBeenCalledWith('user');
  });

  it('renders nothing and shows an error for an unsupported action type', async () => {
    const wrapper = mountComponent({
      params: { eventId: 'new' },
      query: { entityType: 'user', mutationType: 'create', eventAction: 'teleport' },
    });
    await flushPromises();

    expect(findByTestId(wrapper, 'event-teleport').exists()).toBe(false);
    expect(findByTestId(wrapper, 'event-workflow').exists()).toBe(false);
    expect(findByTestId(wrapper, 'event-certification').exists()).toBe(false);
    expect(notification.showErrorMessage).toHaveBeenCalledWith(
      null,
      'Unsupported event action type.',
    );
  });

  it('gets event data when event id is not "new"', async () => {
    getEventSpy.mockResolvedValue({ data: TEST_EVENT });
    getFilterPropertiesSpy.mockResolvedValue({ data: ACCOUNT_SCHEMA });

    const wrapper = mountComponent({
      params: { eventId: '1234' },
      query: {},
    });
    await flushPromises();

    expect(getEventSpy).toHaveBeenCalledWith('1234');
    // edit flow derives the entity context from the loaded event
    expect(getFilterPropertiesSpy).toHaveBeenCalledWith('account');
    expect(findByTestId(wrapper, 'event-orchestration').exists()).toBeTruthy();
  });

  it('derives the trigger name from the loaded event when config is unavailable', async () => {
    getEventSpy.mockResolvedValue({ data: TEST_EVENT });
    getFilterPropertiesSpy.mockResolvedValue({ data: ACCOUNT_SCHEMA });

    const wrapper = mountComponent({
      params: { eventId: '1234' },
      query: {},
    });
    await flushPromises();

    expect(wrapper.vm.eventTriggerName).toBe('Account Created');
  });

  it('derives the trigger name from the config displayName when available', async () => {
    setupTestPinia({
      governance: {
        eventConfig: {
          entityTypes: [
            {
              name: 'account',
              displayName: 'Account',
              actionTypes: ['orchestration'],
              mutationTypes: ['create', 'update'],
            },
          ],
        },
      },
    });
    getEventSpy.mockResolvedValue({ data: TEST_EVENT });
    getFilterPropertiesSpy.mockResolvedValue({ data: ACCOUNT_SCHEMA });
    mockRouter({
      params: { eventId: '1234' },
      query: {},
    });
    notification = mockNotification();

    const wrapper = shallowMount(EventEditManager, {
      global: { plugins: [i18n] },
    });
    await flushPromises();

    expect(wrapper.vm.eventTriggerName).toBe('Account Created');
  });

  it('composes a capitalized mutation fallback for an unknown mutation', async () => {
    getEventSpy.mockResolvedValue({ data: { ...TEST_EVENT, mutationType: 'archive' } });
    getFilterPropertiesSpy.mockResolvedValue({ data: ACCOUNT_SCHEMA });

    const wrapper = mountComponent({
      params: { eventId: '1234' },
      query: {},
    });
    await flushPromises();

    expect(wrapper.vm.eventTriggerName).toBe('Account Archive');
  });

  it('parses 4-segment account schema keys into full dotted property values', async () => {
    getFilterPropertiesSpy.mockResolvedValue({ data: ACCOUNT_SCHEMA });

    const wrapper = mountComponent({
      params: { eventId: 'new' },
      query: { entityType: 'account', mutationType: 'create', eventAction: 'orchestration' },
    });
    await flushPromises();

    const values = wrapper.vm.filterProperties.map((property) => property.value);
    // `descriptor.displayName` appears once even though both before/after keys exist
    expect(values).toContain('descriptor.displayName');
    expect(values).toContain('descriptor.applicationName');
    expect(values).toContain('item.type');
    // array-typed properties are excluded
    expect(values).not.toContain('item.references');
    // only account schema keys are served for the account entity
    expect(values).not.toContain('sn');
    expect(values).not.toContain('user');

    const displayNameProperty = wrapper.vm.filterProperties.find((property) => property.value === 'descriptor.displayName');
    expect(displayNameProperty.label).toBe('Display Name');
    expect(displayNameProperty.type).toBe('string');

    const applicationNameProperty = wrapper.vm.filterProperties.find((property) => property.value === 'descriptor.applicationName');
    expect(applicationNameProperty.label).toBe('Application Name');
  });

  it('renders no wizard and skips the property fetch when no action type resolves', async () => {
    getFilterPropertiesSpy.mockResolvedValue({ data: {} });

    const wrapper = mountComponent({
      params: { eventId: 'new' },
      query: {},
    });
    await flushPromises();

    // the unsupported-action early return also skips the pointless fetches
    expect(getFilterPropertiesSpy).not.toHaveBeenCalled();
    expect(findByTestId(wrapper, 'event-workflow').exists()).toBe(false);
    expect(findByTestId(wrapper, 'event-certification').exists()).toBe(false);
  });

  it('shows only the fetch error when the event fails to load (no unsupported-action toast)', async () => {
    getEventSpy.mockRejectedValue(new Error('network down'));

    const wrapper = mountComponent({
      params: { eventId: '1234' },
      query: {},
    });
    await flushPromises();

    expect(notification.showErrorMessage).toHaveBeenCalledTimes(1);
    expect(notification.showErrorMessage).toHaveBeenCalledWith(
      expect.any(Error),
      'There was an error retrieving event',
    );
    // Without the event there is no entity context: no user-flavored wizard
    // renders over the error, and the property fetch is skipped.
    expect(getFilterPropertiesSpy).not.toHaveBeenCalled();
    expect(findByTestId(wrapper, 'event-workflow').exists()).toBe(false);
    expect(findByTestId(wrapper, 'event-certification').exists()).toBe(false);
  });

  it('still renders the wizard when the fetch fails but the route supplies the entity context', async () => {
    getEventSpy.mockRejectedValue(new Error('network down'));
    getFilterPropertiesSpy.mockResolvedValue({ data: USER_SCHEMA });

    const wrapper = mountComponent({
      params: { eventId: '1234' },
      query: { entityType: 'user', mutationType: 'create', eventAction: 'orchestration' },
    });
    await flushPromises();

    expect(notification.showErrorMessage).toHaveBeenCalledTimes(1);
    // the create-flow context from the query keeps the wizard usable
    expect(getFilterPropertiesSpy).toHaveBeenCalledWith('user');
    expect(findByTestId(wrapper, 'event-orchestration').exists()).toBeTruthy();
  });

  it('falls back to the user entity when a valid action has no entity context', async () => {
    getFilterPropertiesSpy.mockResolvedValue({ data: USER_SCHEMA });

    const wrapper = mountComponent({
      params: { eventId: 'new' },
      query: { eventAction: 'orchestration' },
    });
    await flushPromises();

    expect(getFilterPropertiesSpy).toHaveBeenCalledWith('user');
    expect(findByTestId(wrapper, 'event-orchestration').exists()).toBeTruthy();
  });

  it('resolves the agent schema resource to account (agent events are served the account schema)', async () => {
    getFilterPropertiesSpy.mockResolvedValue({ data: ACCOUNT_SCHEMA });

    const wrapper = mountComponent({
      params: { eventId: 'new' },
      query: { entityType: 'agent', mutationType: 'create', eventAction: 'orchestration' },
    });
    await flushPromises();

    // the schema is still fetched under the agent entity name
    expect(getFilterPropertiesSpy).toHaveBeenCalledWith('agent');
    expect(wrapper.vm.schemaResource).toBe('account');
    expect(wrapper.vm.eventTriggerName).toBe('Agent Created');
  });

  it('keeps the entity type as the schema resource for account and user events', async () => {
    getFilterPropertiesSpy.mockResolvedValue({ data: ACCOUNT_SCHEMA });

    const accountWrapper = mountComponent({
      params: { eventId: 'new' },
      query: { entityType: 'account', mutationType: 'create', eventAction: 'orchestration' },
    });
    await flushPromises();
    expect(accountWrapper.vm.schemaResource).toBe('account');

    getFilterPropertiesSpy.mockResolvedValue({ data: USER_SCHEMA });
    const userWrapper = mountComponent({
      params: { eventId: 'new' },
      query: { entityType: 'user', mutationType: 'create', eventAction: 'orchestration' },
    });
    await flushPromises();
    expect(userWrapper.vm.schemaResource).toBe('user');
  });
});
