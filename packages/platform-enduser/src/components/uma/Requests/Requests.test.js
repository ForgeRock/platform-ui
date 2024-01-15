/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import Requests from '@/components/uma/Requests';

Requests.components['fr-fallback-image'] = jest.fn();

const requests = [
  {
    _id: 'be4cb21e-74a1-4498-aabd-310b6b5bb3415',
    user: 'phil',
    resource: 'Ultrasound',
    when: 1529937902420,
    allowed: false,
    decision: false,
    permissions: [
      'download',
    ],
  },
  {
    _id: '7de54a3b-1446-4ada-a8a5-3cd00739180613',
    user: 'steve',
    resource: 'Ultrasound',
    when: 1529937934625,
    allowed: false,
    decision: false,
    permissions: [
      'download',
    ],
  },
];

describe('UMA Requests Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Requests, {
      global: {
        plugins: [i18n],
      },
      props: {
        requests,
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should use actual time for events on previous days', () => {
    const eventDifferentDay = new Date();
    eventDifferentDay.setDate(eventDifferentDay.getDate() - 2);
    const formattedTime = wrapper.vm.formatTime(eventDifferentDay);

    expect(formattedTime.match(/\d{1,2}:\d{1,2} [AP]M/)).toBeTruthy();
  });

  it('should emit "finalize-resource-access" event', () => {
    wrapper.vm.finalizeAccess({ _id: '12345', permissions: [] }, 0, 'approve');

    expect(wrapper.emitted('finalize-resource-access').length).toBe(1);
  });
});
