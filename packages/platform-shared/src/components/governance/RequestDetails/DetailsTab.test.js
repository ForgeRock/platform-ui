/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import i18n from '@/i18n';
import DetailsTab from './DetailsTab';

jest.mock('dayjs', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    format: jest.fn().mockReturnValue('Jan 1, 2021 12:00 AM'),
  })),
}));

describe('DetailsTab', () => {
  const setup = (propsData = {}) => {
    const props = {
      item: {
        details: {
          id: 'id test',
          name: 'name test',
          description: 'test description',
          priority: 'priority test',
          date: '2021-01-01T00:00:00Z',
          type: 'type',
          icon: 'user_icon.png',
          requestedFor: {
            profileImage: 'path/to/profile.jpg',
            givenName: 'test',
            sn: 'name',
            userName: 'test',
          },
          requestedBy: {
            profileImage: 'path/to/profile.jpg',
            givenName: 'requested by',
            sn: 'requested by',
            userName: 'requested by name',
          },
        },
        rawData: {
          decision: {
            decision: 'approved',
          },
          request: {
            common: {
              justification: 'justification.',
            },
          },
          requestType: 'requestType test',
        },
      },
      ...propsData,
    };

    return mount(DetailsTab, {
      global: {
        plugins: [i18n],
      },
      props,
    });
  };

  it('initializes with the correct default data structure based on props', async () => {
    const wrapper = setup();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.details.requested.name).toBe('name test');
    expect(wrapper.vm.details.status.name).toContain('Approved');
    expect(wrapper.vm.details.requestDate).toBe('Jan 1, 2021 12:00 AM');
  });

  it('handles when the request is submitted by the system', async () => {
    const wrapper = setup({
      item: {
        details: {
          requestedBy: {
            id: 'SYSTEM',
          },
        },
        rawData: {},
      },
    });
    await flushPromises();
    const requestedBy = wrapper.find('.row');
    expect(requestedBy.text()).toBe('Requested BySystem');
  });

  it('shows requested, requested for, and requested by if present', async () => {
    const wrapper = setup({
      item: {
        details: {
          name: 'name test',
          icon: 'icon test',
          description: 'description test',
          requestedBy: {
            givenName: 'test',
            sn: 'name',
            userName: 'test',
          },
          requestedFor: {
            givenName: 'test',
            sn: 'name',
            userName: 'test',
          },
        },
        rawData: {
          requestType: 'requestType test',
        },
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Requested By');
    expect(wrapper.text()).toContain('Requested For');
    expect(wrapper.text()).toContain('Requested');
  });

  it('hides requested, requested for, and requested by if is not present', async () => {
    const wrapper = setup({
      item: {
        details: {},
        rawData: {},
      },
    });
    await flushPromises();
    expect(wrapper.text()).not.toContain('Requested By');
    expect(wrapper.text()).not.toContain('Requested For');
    expect(wrapper.text()).not.toContain('Requested');
  });
});
