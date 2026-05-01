/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ActivityLogDetails from './ActivityLogDetails';

const testLog = {
  actor_global_id: 'global-001',
  actor: {
    actor_id: 'u001',
    username: 'jdoe',
    email: 'jdoe@example.com',
  },
  environment: {
    geo: { city: 'Austin', region: 'TX', country: 'USA' },
    user_agent: 'Mozilla/5.0',
    device_id: 'dev-001',
    cloud_region: 'us-west-1',
  },
  result_context: {
    response_code: '200',
    risk_score: '5',
    bytes_in: '100',
    bytes_out: '200',
  },
};

function mountComponent(log = testLog) {
  return mount(ActivityLogDetails, {
    global: {
      mocks: { $t: (t) => t },
    },
    props: { log },
  });
}

describe('ActivityLogDetails', () => {
  it('renders all three section headers', () => {
    const wrapper = mountComponent();
    const headers = wrapper.findAll('.section-header');
    expect(headers).toHaveLength(4); // actor, environment, result, raw json
  });

  it('renders actor fields correctly', () => {
    const wrapper = mountComponent();
    const text = wrapper.text();
    expect(text).toContain('u001');
    expect(text).toContain('jdoe');
    expect(text).toContain('jdoe@example.com');
    expect(text).toContain('global-001');
  });

  it('formats geo into a single location string', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Austin, TX, USA');
  });

  it('renders environment fields correctly', () => {
    const wrapper = mountComponent();
    const text = wrapper.text();
    expect(text).toContain('Mozilla/5.0');
    expect(text).toContain('dev-001');
    expect(text).toContain('us-west-1');
  });

  it('renders result context fields correctly', () => {
    const wrapper = mountComponent();
    const text = wrapper.text();
    expect(text).toContain('200');
    expect(text).toContain('5');
  });

  it('formats bytes in/out as a combined value', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('100 / 200');
  });

  it('shows blank value indicator for missing bytes when only one side is null', () => {
    const wrapper = mountComponent({
      ...testLog,
      result_context: { ...testLog.result_context, bytes_out: null },
    });
    expect(wrapper.text()).toContain('100 / --');
  });

  it('shows blank value indicator when both bytes values are null', () => {
    const wrapper = mountComponent({
      ...testLog,
      result_context: { ...testLog.result_context, bytes_in: null, bytes_out: null },
    });
    expect(wrapper.text()).toContain('--');
  });

  it('shows blank value indicator for missing geo', () => {
    const wrapper = mountComponent({
      ...testLog,
      environment: { ...testLog.environment, geo: null },
    });
    expect(wrapper.text()).toContain('--');
  });

  it('renders the raw event JSON section', () => {
    const wrapper = mountComponent();
    const pre = wrapper.find('pre.raw-json');
    expect(pre.exists()).toBe(true);
    expect(pre.text()).toContain('"actor_global_id": "global-001"');
  });

  it('shows blank value indicator for missing actor fields', () => {
    const wrapper = mountComponent({
      ...testLog,
      actor: {},
      actor_global_id: null,
    });
    const text = wrapper.text();
    expect(text).toContain('--');
  });
});
