/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import { findByRole, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as EventApi from '@forgerock/platform-shared/src/api/governance/EventApi';
import { useGovernanceStore } from '@forgerock/platform-shared/src/stores/governance';
import i18n from '@/i18n';
import NewEvent from './NewEvent';

jest.mock('vue-router');

const { useRouter } = require('vue-router');

const MVP_CONFIG = {
  entityTypes: [
    {
      name: 'user',
      displayName: 'User',
      actionTypes: ['certification', 'orchestration'],
      mutationTypes: ['create', 'update', 'delete'],
    },
    {
      name: 'account',
      displayName: 'Account',
      actionTypes: ['orchestration'],
      mutationTypes: ['create', 'update'],
    },
  ],
};

const BModalSlotsStub = {
  template: '<div><slot /><slot name="modal-footer" /></div>',
};

/**
 * Mounts the modal with a testing pinia instance.
 * @param {Object} options
 * @param {Object} options.initialState governance-store initial state, e.g.
 *   `{ eventConfig: ... }` to seed the cached config
 * @param {Boolean} options.stubActions pass false for a live store whose
 *   `setEventConfig` actually runs (for config-fetch tests)
 * @param {Function} options.routerPush optional custom router.push spy
 */
function mountModal({ initialState = {}, stubActions = true, routerPush } = {}) {
  setupTestPinia({ governance: initialState }, stubActions);
  const store = useGovernanceStore();
  const routerPushSpy = routerPush || jest.fn();
  useRouter.mockReturnValue({ push: routerPushSpy });
  const wrapper = mount(NewEvent, {
    global: {
      plugins: [i18n],
      stubs: { BModal: BModalSlotsStub },
    },
  });
  return { wrapper, store, routerPushSpy };
}

/** Shows the modal and waits for the config fetch to resolve. */
async function showModal(wrapper) {
  await wrapper.vm.onShow();
  await flushPromises();
}

describe('NewEventModal', () => {
  let notification;

  // Restore only this spy: a blanket restoreAllMocks would kill the
  // console-snapshot setup's console.error spy.
  afterEach(() => {
    if (jest.isMockFunction(EventApi.getEventConfig)) {
      EventApi.getEventConfig.mockRestore();
    }
  });

  beforeEach(() => {
    notification = mockNotification();
    // the platform-shared jest i18n instance has no `governance.events`
    // subtree; merge the admin-runtime keys so the composition path is live
    i18n.global.mergeLocaleMessage('en', {
      governance: {
        events: {
          listView: {
            create: 'created',
            update: 'updated',
            delete: 'deleted',
            certification: 'Certification',
            orchestration: 'Workflow',
          },
          newEventModal: {
            eventTrigger: 'Event Trigger',
            eventAction: 'Event Action',
            entityTrigger: 'Trigger an action when {entity} is {action}.',
            triggerCertification: 'Trigger a certification campaign when an event occurs.',
            triggerWorkflow: 'Trigger a workflow when an event occurs.',
            actionFallback: 'Trigger this action when an event occurs.',
          },
          errors: {
            getConfigError: 'There was an error retrieving the event configuration',
          },
        },
      },
    });
  });

  describe('@renders', () => {
    it('correctly sets initial component data', async () => {
      const { wrapper } = mountModal();
      await showModal(wrapper);

      expect(wrapper.vm.currentStep).toBe(0);
      expect(wrapper.vm.selectedAction).toBeNull();
      expect(wrapper.vm.selectedEvent).toBeNull();
      expect(wrapper.vm.nextDisabled).toBe(true);
    });

    it('renders one card per (entity, mutation) pair from the config', async () => {
      const { wrapper } = mountModal({ initialState: { eventConfig: MVP_CONFIG } });
      await showModal(wrapper);

      expect(wrapper.vm.currentOptions).toHaveLength(5);
      expect(wrapper.vm.currentOptions.map((option) => option.name)).toEqual([
        'User Created', 'User Updated', 'User Deleted', 'Account Created', 'Account Updated',
      ]);
      expect(wrapper.vm.currentOptions.map((option) => option.value)).toEqual([
        'user:create', 'user:update', 'user:delete', 'account:create', 'account:update',
      ]);
    });

    it('renders cards with parameterized descriptions and no raw i18n keys', async () => {
      const { wrapper } = mountModal({ initialState: { eventConfig: MVP_CONFIG } });
      await showModal(wrapper);

      expect(wrapper.vm.currentOptions[0].description).toBe('Trigger an action when User is created.');
      expect(wrapper.vm.currentOptions[3].description).toBe('Trigger an action when Account is created.');

      wrapper.vm.currentOptions.forEach((option) => {
        expect(option.name).not.toContain('governance.events');
        expect(option.description).not.toContain('governance.events');
      });
    });

    it('renders the account trigger card with the account meta icon', async () => {
      const { wrapper } = mountModal({ initialState: { eventConfig: MVP_CONFIG } });
      await showModal(wrapper);

      const accountCard = wrapper.vm.currentOptions.find((option) => option.value === 'account:create');
      expect(accountCard.icon).toBe('web_asset');
      expect(accountCard.iconClasses).toBe('color-blue bg-lightblue');
    });

    it('renders a generic card for an entity missing from the meta map', async () => {
      const { wrapper } = mountModal({
        initialState: {
          eventConfig: {
            entityTypes: [...MVP_CONFIG.entityTypes, {
              name: 'device',
              displayName: 'Device',
              actionTypes: ['orchestration'],
              mutationTypes: ['register'],
            }],
          },
        },
      });
      await showModal(wrapper);

      const deviceCard = wrapper.vm.currentOptions.find((option) => option.value === 'device:register');
      expect(deviceCard).toBeDefined();
      expect(deviceCard.icon).toBe('event');
      expect(deviceCard.iconClasses).toBe('text-muted bg-light');
      expect(deviceCard.name).toBe('Device Register');
      expect(deviceCard.description).toBe('Trigger an action when Device is register.');
    });

    it('renders the generic action meta for an unknown action type', async () => {
      const { wrapper } = mountModal({
        initialState: {
          eventConfig: {
            entityTypes: [{
              name: 'user',
              displayName: 'User',
              actionTypes: ['notify'],
              mutationTypes: ['create'],
            }],
          },
        },
      });
      await showModal(wrapper);

      wrapper.vm.selectedEvent = 'user:create';
      const [notifyAction] = wrapper.vm.actionOptions;
      expect(notifyAction.name).toBe('Notify');
      expect(notifyAction.icon).toBe('event');
      expect(notifyAction.iconClasses).toBe('text-muted bg-light');
      expect(notifyAction.description).toBe('Trigger this action when an event occurs.');
    });
  });

  describe('@actions', () => {
    it('disables Next until a trigger is selected, then enables it', async () => {
      const { wrapper } = mountModal({ initialState: { eventConfig: MVP_CONFIG } });
      await showModal(wrapper);

      expect(wrapper.vm.nextDisabled).toBe(true);
      wrapper.vm.selectedEvent = 'user:create';
      expect(wrapper.vm.nextDisabled).toBe(false);
    });

    it('disables Next on the action step until an action is selected', async () => {
      const { wrapper } = mountModal({ initialState: { eventConfig: MVP_CONFIG } });
      await showModal(wrapper);

      wrapper.vm.selectedEvent = 'user:create';
      await wrapper.vm.nextStep();
      expect(wrapper.vm.currentStep).toBe(1);
      expect(wrapper.vm.nextDisabled).toBe(true);

      wrapper.vm.selectedAction = 'certification';
      expect(wrapper.vm.nextDisabled).toBe(false);
    });

    it('parses the composite card value and navigates with the query params', async () => {
      const routerPush = jest.fn();
      const { wrapper } = mountModal({ initialState: { eventConfig: MVP_CONFIG }, routerPush });
      await showModal(wrapper);

      wrapper.vm.selectedEvent = 'account:create';
      await wrapper.vm.nextStep();
      expect(wrapper.vm.currentStep).toBe(1);

      wrapper.vm.selectedAction = 'orchestration';
      await wrapper.vm.nextStep();

      expect(routerPush).toHaveBeenCalledWith({
        name: 'GovernanceEventEdit',
        params: { eventId: 'new' },
        query: { entityType: 'account', mutationType: 'create', eventAction: 'orchestration' },
      });
    });

    it('does not emit the legacy eventTrigger query param', async () => {
      const routerPush = jest.fn();
      const { wrapper } = mountModal({ initialState: { eventConfig: MVP_CONFIG }, routerPush });
      await showModal(wrapper);

      wrapper.vm.selectedEvent = 'user:create';
      await wrapper.vm.nextStep();
      wrapper.vm.selectedAction = 'certification';
      await wrapper.vm.nextStep();

      expect(routerPush).toHaveBeenCalledTimes(1);
      const pushArg = routerPush.mock.calls[0][0];
      expect(pushArg.query).not.toHaveProperty('eventTrigger');
    });

    it('shows only the selected entity action types (account has workflow only)', async () => {
      const { wrapper } = mountModal({ initialState: { eventConfig: MVP_CONFIG } });
      await showModal(wrapper);

      wrapper.vm.selectedEvent = 'account:create';
      expect(wrapper.vm.actionOptions.map((option) => option.value)).toEqual(['orchestration']);
      expect(wrapper.vm.actionOptions.map((option) => option.name)).toEqual(['Workflow']);

      wrapper.vm.selectedEvent = 'user:create';
      expect(wrapper.vm.actionOptions.map((option) => option.value)).toEqual(['certification', 'orchestration']);
    });

    it('clears the selected action when the trigger changes', async () => {
      const { wrapper } = mountModal({ initialState: { eventConfig: MVP_CONFIG } });
      await showModal(wrapper);

      wrapper.vm.selectedEvent = 'user:create';
      wrapper.vm.selectedAction = 'certification';
      expect(wrapper.vm.selectedAction).toBe('certification');

      wrapper.vm.selectedEvent = 'account:create';
      await flushPromises();
      expect(wrapper.vm.selectedAction).toBeNull();
    });

    it('steps back, keeping the trigger selection', async () => {
      const { wrapper } = mountModal({ initialState: { eventConfig: MVP_CONFIG } });
      await showModal(wrapper);

      wrapper.vm.selectedEvent = 'user:update';
      await wrapper.vm.nextStep();
      expect(wrapper.vm.currentStep).toBe(1);
      expect(wrapper.vm.selectedAction).toBeNull();

      await wrapper.vm.previousStep();
      expect(wrapper.vm.currentStep).toBe(0);
      expect(wrapper.vm.selectedEvent).toBe('user:update');
      expect(wrapper.vm.nextDisabled).toBe(false);
    });

    it('resets all state on hide', async () => {
      const { wrapper } = mountModal({ initialState: { eventConfig: MVP_CONFIG } });
      await showModal(wrapper);

      wrapper.vm.selectedEvent = 'user:create';
      await wrapper.vm.nextStep();
      wrapper.vm.selectedAction = 'certification';

      await wrapper.vm.onHide();

      expect(wrapper.vm.currentStep).toBe(0);
      expect(wrapper.vm.selectedEvent).toBeNull();
      expect(wrapper.vm.selectedAction).toBeNull();
      expect(wrapper.vm.nextDisabled).toBe(true);
    });

    it('resets the config error state on hide', async () => {
      const { wrapper } = mountModal();
      wrapper.vm.configError = true;
      wrapper.vm.configLoading = true;

      await wrapper.vm.onHide();

      expect(wrapper.vm.configError).toBe(false);
      expect(wrapper.vm.configLoading).toBe(false);
    });
  });

  describe('config fetching', () => {
    it('shows the spinner while the config fetch is pending', async () => {
      const getEventConfigSpy = jest.spyOn(EventApi, 'getEventConfig').mockImplementation(() => new Promise(() => {}));
      const { wrapper, store } = mountModal({ stubActions: false });

      wrapper.vm.onShow();
      await flushPromises();

      expect(wrapper.vm.configLoading).toBe(true);
      expect(store.eventConfig).toBeNull();
      expect(wrapper.vm.currentOptions).toHaveLength(0);
      expect(wrapper.vm.nextDisabled).toBe(true);
      expect(wrapper.findComponent({ name: 'Spinner' }).exists()).toBe(true);

      // restore the spy so the leaked promise does not hang the suite teardown
      getEventConfigSpy.mockRestore();
      wrapper.unmount();
    });

    it('caches a successful config and skips the fetch on a second show', async () => {
      const getEventConfigSpy = jest.spyOn(EventApi, 'getEventConfig').mockResolvedValue({ data: MVP_CONFIG });
      const { wrapper, store } = mountModal({ stubActions: false });

      await wrapper.vm.onShow();
      await flushPromises();
      expect(store.eventConfig).toEqual(MVP_CONFIG);
      expect(getEventConfigSpy).toHaveBeenCalledTimes(1);

      await wrapper.vm.onShow();
      await flushPromises();
      expect(getEventConfigSpy).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.configError).toBe(false);
    });

    it('shows the error state, disables Next, and notifies on a failed fetch', async () => {
      jest.spyOn(EventApi, 'getEventConfig').mockRejectedValue(new Error('config fetch failed'));
      const { wrapper, store } = mountModal({ stubActions: false });

      await wrapper.vm.onShow();
      await flushPromises();

      expect(store.eventConfig).toBeNull();
      expect(wrapper.vm.configError).toBe(true);
      expect(wrapper.vm.nextDisabled).toBe(true);
      expect(wrapper.vm.currentOptions).toHaveLength(0);
      expect(findByRole(wrapper, 'alert').exists()).toBe(true);
      expect(notification.showErrorMessage).toHaveBeenCalled();
    });

    it('retries the fetch on a later show after a failure', async () => {
      const getEventConfigSpy = jest.spyOn(EventApi, 'getEventConfig')
        .mockRejectedValueOnce(new Error('config fetch failed'))
        .mockResolvedValueOnce({ data: MVP_CONFIG });
      const { wrapper, store } = mountModal({ stubActions: false });

      await wrapper.vm.onShow();
      await flushPromises();
      expect(store.eventConfig).toBeNull();
      expect(wrapper.vm.configError).toBe(true);

      await wrapper.vm.onShow();
      await flushPromises();

      expect(store.eventConfig).toEqual(MVP_CONFIG);
      expect(getEventConfigSpy).toHaveBeenCalledTimes(2);
      expect(wrapper.vm.configError).toBe(false);
    });

    it('renders no cards and disables Next for an empty entityTypes response', async () => {
      const { wrapper } = mountModal({ initialState: { eventConfig: { entityTypes: [] } } });
      await showModal(wrapper);

      expect(wrapper.vm.currentOptions).toHaveLength(0);
      expect(wrapper.vm.nextDisabled).toBe(true);
    });
  });

  describe('@a11y', () => {
    it('step 1 has no accessibility violations', async () => {
      const { wrapper } = mountModal({ initialState: { eventConfig: MVP_CONFIG } });
      await showModal(wrapper);

      await runA11yTest(wrapper);
    });

    it('step 2 has no accessibility violations', async () => {
      const { wrapper } = mountModal({ initialState: { eventConfig: MVP_CONFIG } });
      await showModal(wrapper);

      wrapper.vm.selectedEvent = 'user:create';
      await wrapper.vm.nextStep();
      await flushPromises();

      await runA11yTest(wrapper);
    });

    it('loading state has no accessibility violations', async () => {
      const getEventConfigSpy = jest.spyOn(EventApi, 'getEventConfig').mockImplementation(() => new Promise(() => {}));
      const { wrapper } = mountModal({ stubActions: false });

      wrapper.vm.onShow();
      await flushPromises();

      expect(wrapper.vm.configLoading).toBe(true);
      await runA11yTest(wrapper);

      // restore the spy so the leaked promise does not hang the suite teardown
      getEventConfigSpy.mockRestore();
      wrapper.unmount();
    });

    it('error state has no accessibility violations', async () => {
      jest.spyOn(EventApi, 'getEventConfig').mockRejectedValue(new Error('config fetch failed'));
      const { wrapper } = mountModal({ stubActions: false });

      await wrapper.vm.onShow();
      await flushPromises();

      await runA11yTest(wrapper);
    });
  });
});
