/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { toHaveNoViolations } from 'jest-axe';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import AuditLogDetails from './AuditLogDetails';

expect.extend(toHaveNoViolations);

const testLog = {
  id: 'record-1',
  actor: 'system',
  eventType: 'grant-entitlement',
  objectId: 'entitlementGrant',
  displayName: 'Request Type',
  objectType: 'Grant Entitlement',
  action: 'CREATE',
  timestamp: '2026-06-03T13:20:22.893Z',
  objectDisplayName: '/requestType/iga',
  systemExecuted: 'false',
  changes: [
    { field_name: '"displayName"', before_value: '"Old Name"', after_value: '"Grant Entitlement"' },
    { field_name: '"id"', before_value: null, after_value: '"entitlementGrant"' },
  ],
  metadata: { createdDate: '2026-06-03T13:22:10.000Z' },
};

function mountComponent(log = testLog) {
  return mount(AuditLogDetails, {
    global: {
      mocks: { $t: (t) => t },
    },
    props: { log },
  });
}

describe('AuditLogDetails', () => {
  describe('event fields', () => {
    it('renders the displayName', () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain('Request Type');
    });

    it('renders the objectId', () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain('entitlementGrant');
    });

    it('renders the actor', () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain('system');
    });

    it('renders systemExecuted', () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain('false');
    });

    it('does not render the timestamp in the event card', () => {
      const wrapper = mountComponent();
      const eventCard = wrapper.findAllComponents({ name: 'BCard' })[0];
      expect(eventCard.text()).not.toContain('2026-06-03T13:20:22.893Z');
    });

    it('lays out event fields in a 2x2 grid with label left and value right', () => {
      const wrapper = mountComponent();
      const eventCard = wrapper.findAllComponents({ name: 'BCard' })[0];
      const fields = eventCard.findAll('.event-field');
      expect(fields).toHaveLength(4);
      fields.forEach((f) => {
        expect(f.classes()).toContain('justify-content-between');
        expect(f.find('.event-field__value').exists()).toBe(true);
      });
    });
  });

  describe('changes card', () => {
    it('renders a single header row with Field, Before, After columns', () => {
      const wrapper = mountComponent();
      const changesCard = wrapper.findAllComponents({ name: 'BCard' })[1];
      expect(changesCard.text()).toContain('governance.audit.details.fields.field');
      expect(changesCard.text()).toContain('governance.audit.details.fields.before');
      expect(changesCard.text()).toContain('governance.audit.details.fields.after');
    });

    it('renders change field names without surrounding quotes', () => {
      const wrapper = mountComponent();
      const fieldCols = wrapper.findAll('.change-value-col--field');
      expect(fieldCols[0].text()).toBe('displayName');
    });

    it('renders before values', () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain('"Old Name"');
    });

    it('renders after values', () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain('"Grant Entitlement"');
    });

    it('shows blank indicator for null before_value', () => {
      const wrapper = mountComponent();
      const beforeCols = wrapper.findAll('.change-value-col--before');
      const nullBefore = beforeCols.find((c) => c.text() === '--');
      expect(nullBefore).toBeTruthy();
    });

    it('shows blank indicator when changes array is empty', () => {
      const wrapper = mountComponent({ ...testLog, changes: [] });
      const changesCard = wrapper.findAllComponents({ name: 'BCard' })[1];
      expect(changesCard.find('.text-muted').exists()).toBe(true);
    });

    it('renders event and changes inside BCards', () => {
      const wrapper = mountComponent();
      expect(wrapper.findAllComponents({ name: 'BCard' })).toHaveLength(2);
    });

    it('both cards are full width (no lg-4 / lg-8 split)', () => {
      const wrapper = mountComponent();
      expect(wrapper.findAll('[class*="col-lg-4"]')).toHaveLength(0);
      expect(wrapper.findAll('[class*="col-lg-8"]')).toHaveLength(0);
    });
  });

  describe('raw JSON', () => {
    it('renders the full log as pretty-printed JSON', () => {
      const wrapper = mountComponent();
      const pre = wrapper.find('pre.raw-json');
      expect(pre.exists()).toBe(true);
      expect(pre.text()).toContain('"id": "record-1"');
    });
  });

  describe('long values', () => {
    it('renders long after_value in full without truncation', () => {
      const longValue = 'x'.repeat(200);
      const wrapper = mountComponent({ ...testLog, changes: [{ field_name: 'f', before_value: null, after_value: longValue }] });
      const afterCols = wrapper.findAll('.change-value-col--after');
      const afterText = afterCols[0]?.text() ?? '';
      expect(afterText).toBe(longValue);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });
});
