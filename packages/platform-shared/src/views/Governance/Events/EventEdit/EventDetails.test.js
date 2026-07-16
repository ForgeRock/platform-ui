/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { findByTestId, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import i18n from '@/i18n';
import EventDetails from './EventDetails';

mockValidation(['required']);

describe('EventDetails', () => {
  let wrapper;

  beforeAll(() => {
    // Shared jest i18n lacks governance.events; merge the admin-runtime keys.
    i18n.global.mergeLocaleMessage('en', {
      governance: {
        events: {
          edit: {
            allEntityTypes: 'All {entityTypes}',
            subsetEntityTypes: 'A subset of {entityTypes}',
            eventDetails: 'Event Details',
            eventName: 'Event Name',
            eventDescription: 'Event Description',
            eventOwners: 'Event Owners',
            triggerFor: 'Trigger for',
            filterTriggerPrefix: 'Trigger workflow if',
          },
          newEventModal: {
            eventTrigger: 'Event Trigger',
          },
        },
      },
      common: {
        optionalFieldTitle: '{fieldTitle} (optional)',
        userFullName: '{givenName} {sn}',
      },
    });
  });

  // a pre-selected subset filter so the filter builder (inside the
  // userFilterSelection === 1 collapse) renders
  const SUBSET_VALUE = {
    eventName: 'testName',
    filter: { or: [{ equals: { right: { literal: 'name' }, left: 'user.after.sn' } }] },
  };

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

  describe('entity rendering', () => {
    it('renders user defaults when no entity props are passed (EditTemplate path)', async () => {
      const wrapperLocal = mountComponent({});
      await flushPromises();

      // default radio labels use the user plural
      expect(wrapperLocal.text()).toContain('All users');
      expect(wrapperLocal.text()).toContain('A subset of users');

      // trigger panel icon comes from the user meta with the base create icon
      const iconCircle = wrapperLocal.find('.rounded-circle');
      expect(iconCircle.classes()).toContain('bg-lightgreen');
      expect(iconCircle.classes()).toContain('text-success');
      expect(iconCircle.find('.material-icons-outlined').text()).toBe('person_add_alt');

      // filter builder resource defaults to user
      expect(wrapperLocal.vm.entityType).toBe('user');
    });

    it('renders account props for an account event', async () => {
      const wrapperLocal = mountComponent({ entityType: 'account', mutationType: 'create' });
      await flushPromises();

      expect(wrapperLocal.text()).toContain('All accounts');
      expect(wrapperLocal.text()).toContain('A subset of accounts');

      const iconCircle = wrapperLocal.find('.rounded-circle');
      expect(iconCircle.classes()).toContain('bg-lightblue');
      expect(iconCircle.classes()).toContain('color-blue');
      expect(iconCircle.find('.material-icons-outlined').text()).toBe('web_asset');
    });

    it('hides the temporal filter options when mutationType is not update', async () => {
      const wrapperLocal = mountComponent({ entityType: 'user', mutationType: 'create', value: SUBSET_VALUE });
      await flushPromises();

      expect(wrapperLocal.vm.showTemporalValueField).toBe(false);
      expect(wrapperLocal.findComponent({ name: 'FilterBuilderGroup' }).exists()).toBe(true);
      expect(findByTestId(wrapperLocal, 'fr-field-temporalValue_selectPropOptions_user_1').exists()).toBe(false);
    });

    it('shows the temporal filter options when mutationType is update', async () => {
      const wrapperLocal = mountComponent({ entityType: 'user', mutationType: 'update', value: SUBSET_VALUE });
      await flushPromises();

      expect(wrapperLocal.vm.showTemporalValueField).toBe(true);
      expect(findByTestId(wrapperLocal, 'fr-field-temporalValue_selectPropOptions_user_1').exists()).toBe(true);
    });

    it('shows the temporal field for a dotted-path account update event', async () => {
      const wrapperLocal = mountComponent({
        entityType: 'account',
        mutationType: 'update',
        value: {
          eventName: 'testName',
          filter: { or: [{ equals: { right: { literal: 'name' }, left: 'account.after.descriptor.displayName' } }] },
        },
      });
      await flushPromises();

      expect(wrapperLocal.vm.showTemporalValueField).toBe(true);
      expect(findByTestId(wrapperLocal, 'fr-field-temporalValue_selectPropOptions_account_1').exists()).toBe(true);
    });

    it('keeps the owner select resource on alpha_user in all configurations', async () => {
      const noPropsWrapper = mountComponent({});
      await flushPromises();
      expect(noPropsWrapper.html()).toContain('alpha_user');

      const accountWrapper = mountComponent({ entityType: 'account', mutationType: 'update' });
      await flushPromises();
      expect(accountWrapper.html()).toContain('alpha_user');
    });

    it('sends the schema resource (not the entity type) to the filter builder', async () => {
      // agent events are served account's condition schema, so the builder
      // must rebuild field paths with the account prefix
      const agentWrapper = mountComponent({
        entityType: 'agent',
        schemaResource: 'account',
        value: SUBSET_VALUE,
      });
      await flushPromises();
      expect(agentWrapper.vm.resolvedSchemaResource).toBe('account');
      expect(agentWrapper.findComponent({ name: 'GovernanceFilterBuilder' })
        .props('resourceName')).toBe('account');

      // without the prop the entity type remains the resource
      const accountWrapper = mountComponent({
        entityType: 'account',
        mutationType: 'create',
        value: { ...SUBSET_VALUE, filter: { or: [{ equals: { right: { literal: 'name' }, left: 'account.after.sn' } }] } },
      });
      await flushPromises();
      expect(accountWrapper.vm.resolvedSchemaResource).toBe('account');
    });

    it('falls back to the user rendering when an empty entityType is passed', async () => {
      // a wizard mounted with no entity context passes '' explicitly, which
      // would otherwise degrade the radio text to "All s"
      const wrapperLocal = mountComponent({ entityType: '' });
      await flushPromises();

      expect(wrapperLocal.text()).toContain('All users');
      expect(wrapperLocal.text()).toContain('A subset of users');
      expect(wrapperLocal.find('.rounded-circle .material-icons-outlined').text()).toBe('person_add_alt');
    });
  });

  describe('@a11y', () => {
    it('default (user) configuration has no accessibility violations', async () => {
      const wrapperLocal = mountComponent({ eventTriggerName: 'User Created' });
      await flushPromises();

      await runA11yTest(wrapperLocal);
    });

    it('account update configuration has no accessibility violations', async () => {
      const wrapperLocal = mountComponent({
        eventTriggerName: 'Account Updated',
        entityType: 'account',
        mutationType: 'update',
      });
      await flushPromises();

      await runA11yTest(wrapperLocal);
    });
  });
});
