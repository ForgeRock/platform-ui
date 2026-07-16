/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import i18n from '@/i18n';
import {
  buildEventWorkflowPayload,
  buildEventWorkflowForm,
  buildEventCertificationPayload,
  buildEventCertificationForm,
  getEventEntityMeta,
  getEventTriggerName,
} from './events';

const testWorkflowForm = {
  eventDetails: {
    eventDescription: 'testDescription',
    eventName: 'testName',
    eventOwners: [{
      _id: 'userId',
      givenName: undefined,
      profileImage: null,
      sn: undefined,
      userName: undefined,
    }],
    filter: {},
  },
  workflowDetails: {
    workflow: 'testWorkflow',
    workflowVariables: [],
  },
  status: 'active',
};

const testWorkflowEvent = {
  action: { type: 'orchestration', name: 'testWorkflow', parameters: {} },
  name: 'testName',
  condition: { version: 'v2', filter: {} },
  description: 'testDescription',
  entityType: 'user',
  mutationType: 'create',
  owners: [{ id: 'managed/user/userId' }],
  status: 'active',
};

const testCertificationForm = {
  eventDescription: 'testDescription',
  eventName: 'testName',
  eventOwners: [{
    _id: 'userId',
    givenName: undefined,
    profileImage: null,
    sn: undefined,
    userName: undefined,
  }],
  filter: {},
  status: 'active',
};

const testCertificationEvent = {
  action: {
    type: 'certification',
    template: { certDetails: 'true', id: 'testId' },
  },
  name: 'testName',
  condition: { version: 'v2', filter: {} },
  description: 'testDescription',
  entityType: 'user',
  mutationType: 'create',
  owners: [{ id: 'managed/user/userId' }],
  status: 'active',
};

describe('events', () => {
  it('buildEventWorkflowPayload creates event payload from form values', () => {
    const event = buildEventWorkflowPayload(testWorkflowForm, { entityType: 'user', mutationType: 'create' });

    expect(event).toEqual(testWorkflowEvent);
  });

  it('buildEventWorkflowForm gets form values from event payload', () => {
    const form = buildEventWorkflowForm(testWorkflowEvent);
    testWorkflowForm.workflowDetails.workflowVariables = [{ variable: '', value: '' }];
    expect(form).toEqual(testWorkflowForm);
  });

  it('buildEventCertificationPayload creates event payload from from values', () => {
    const event = buildEventCertificationPayload(testCertificationForm, { certDetails: 'true' }, 'testId', { entityType: 'user', mutationType: 'create' });
    expect(event).toEqual(testCertificationEvent);
  });

  it('buildEventCertificationForm gets form values from event payload', () => {
    const form = buildEventCertificationForm(testCertificationEvent);
    let expectedResult = cloneDeep(testCertificationForm);
    delete expectedResult.status;
    expectedResult = { FrEventDetails: expectedResult };
    expect(form).toEqual(expectedResult);
  });

  describe('context-object entity handling', () => {
    it('buildEventWorkflowPayload echoes an account context and keeps the payload shape', () => {
      const event = buildEventWorkflowPayload(testWorkflowForm, { entityType: 'account', mutationType: 'create' });

      expect(event.entityType).toBe('account');
      expect(event.mutationType).toBe('create');
      expect(event.action.type).toBe('orchestration');
      expect(event.condition.version).toBe('v2');
      expect(event.name).toBe('testName');
    });

    it('buildEventWorkflowPayload echoes an unknown entity context verbatim', () => {
      const event = buildEventWorkflowPayload(testWorkflowForm, { entityType: 'device', mutationType: 'register' });

      expect(event.entityType).toBe('device');
      expect(event.mutationType).toBe('register');
      expect(event.action.type).toBe('orchestration');
    });

    it('buildEventCertificationPayload echoes an account context verbatim', () => {
      const event = buildEventCertificationPayload(testCertificationForm, { certDetails: 'true' }, 'testId', { entityType: 'account', mutationType: 'update' });

      expect(event.entityType).toBe('account');
      expect(event.mutationType).toBe('update');
      expect(event.action.type).toBe('certification');
      expect(event.action.template).toEqual({ certDetails: 'true', id: 'testId' });
    });

    it('buildEventCertificationPayload omits the template id when no certId is passed', () => {
      const event = buildEventCertificationPayload(testCertificationForm, { certDetails: 'true' }, null, { entityType: 'account', mutationType: 'create' });

      expect(event.action.template).toEqual({ certDetails: 'true' });
    });
  });

  describe('getEventTriggerName', () => {
    beforeAll(() => {
      // the platform-shared jest i18n instance has no `governance.events`
      // subtree; merge the admin-runtime keys so the composition path is live
      i18n.global.mergeLocaleMessage('en', {
        governance: {
          events: {
            listView: {
              create: 'created',
              update: 'updated',
            },
          },
        },
      });
    });

    it('composes the display name with the capitalized i18n mutation label', () => {
      expect(getEventTriggerName('User', 'update')).toBe('User Updated');
      expect(getEventTriggerName('Account', 'create')).toBe('Account Created');
    });

    it('falls back to the capitalized raw mutation when the i18n key is missing', () => {
      expect(getEventTriggerName('Account', 'archive')).toBe('Account Archive');
    });

    it('never renders a raw i18n key path', () => {
      const name = getEventTriggerName('Device', 'unknownMutation');
      expect(name).not.toContain('governance.events');
      expect(name).toBe('Device Unknownmutation');
    });
  });

  describe('getEventEntityMeta', () => {
    it('returns the user meta with the base create icon', () => {
      expect(getEventEntityMeta('user')).toEqual({
        icon: 'person_add_alt',
        iconClasses: 'text-success bg-lightgreen',
        plural: 'users',
      });
    });

    it('returns the user update icon override for the update mutation', () => {
      expect(getEventEntityMeta('user', 'update').icon).toBe('manage_accounts');
      expect(getEventEntityMeta('user', 'update').iconClasses).toBe('text-success bg-lightgreen');
    });

    it('returns the account meta', () => {
      expect(getEventEntityMeta('account')).toEqual({
        icon: 'web_asset',
        iconClasses: 'color-blue bg-lightblue',
        plural: 'accounts',
      });
    });

    it('returns the account meta for each mutation without an icon override', () => {
      expect(getEventEntityMeta('account', 'create').icon).toBe('web_asset');
      expect(getEventEntityMeta('account', 'delete').icon).toBe('web_asset');
    });

    it('returns the agent meta', () => {
      expect(getEventEntityMeta('agent')).toEqual({
        icon: 'smart_toy',
        iconClasses: 'color-purple bg-lightpurple',
        plural: 'agents',
      });
    });

    it('returns the agent meta for each mutation without an icon override', () => {
      expect(getEventEntityMeta('agent', 'create').icon).toBe('smart_toy');
      expect(getEventEntityMeta('agent', 'delete').icon).toBe('smart_toy');
    });

    it('returns the generic default for an unknown entity', () => {
      expect(getEventEntityMeta('device')).toEqual({
        icon: 'event',
        iconClasses: 'text-muted bg-light',
        plural: 'devices',
      });
    });

    it('returns the generic default plural for an unknown entity with a mutation', () => {
      const meta = getEventEntityMeta('device', 'update');
      expect(meta.plural).toBe('devices');
      expect(meta.icon).toBe('event');
    });
  });
});
