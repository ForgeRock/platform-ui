/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ActivityModal from './ActivityModal';

let wrapper;
function setup(props) {
  wrapper = shallowMount(ActivityModal, {
    global: {
      mocks: {
        $t: (t) => t,
      },
      renderStubDefaultSlot: true,
      stubs: {
        BModal: { name: 'BModal', template: '<div><slot /></div>' },
        BTable: {
          name: 'BTable',
          template: '<div><slot name="cell(icon)" :item="items[0]" /><slot name="cell(activity)" :item="items[0]" /></div>',
          props: ['fields', 'items'],
        },
        BMedia: { name: 'BMedia', template: '<div><slot /></div>' },
        BMediaBody: { name: 'BMediaBody', template: '<div><slot /></div>' },
      },
    },
    props: {
      taskListColumns: [],
      ...props,
    },
  });
  return wrapper;
}

describe('ActivityModal', () => {
  beforeEach(() => setup());

  it('updatePageSize method should update itemsPerPage', () => {
    wrapper.vm.updatePageSize(20);

    expect(wrapper.vm.itemsPerPage).toBe(20);
  });

  it('formatDate method should return date formatted', () => {
    const date = '2022-12-23';
    const expected = new Intl.DateTimeFormat(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    }).format(new Date(date));
    expect(wrapper.vm.formatDate(date)).toBe(expected);
  });

  it('currentGivenName method should return default name for system actions', () => {
    const user = { id: 'SYSTEM' };
    const givenName = wrapper.vm.currentGivenName(user);

    expect(givenName).toBe('SYSTEM');
  });

  it('currentGivenName method should return proper givenName for not system actions', () => {
    const user = {
      id: 'testId',
      givenName: 'Test User',
    };
    const givenName = wrapper.vm.currentGivenName(user);

    expect(givenName).toBe('Test User');
  });

  it('getIcon method should return proper icon by action', () => {
    const activity = [
      { action: 'approve' },
      { action: 'comment' },
      { action: 'exception' },
      { action: 'forward' },
      { action: 'reassign' },
      { action: 'remediation' },
      { action: 'remove' },
      { action: 'revoke' },
    ];

    const icons = [
      'check',
      'chat_bubble_outline',
      'schedule',
      'redo',
      'person_add',
      'redo',
      'person_remove',
      'block',
    ];

    activity.forEach((element, index) => {
      expect(wrapper.vm.getIcon(element.action))
        .toBe(icons[index]);
    });
  });

  it('should render default modalId', () => {
    expect(wrapper.find('#CertificationTaskActivityAccountModal').exists()).toBeTruthy();
  });

  it('should render prop modalId', () => {
    wrapper = shallowMount(ActivityModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        modalId: 'CertificationTaskActivityEntitlementModal',
      },
    });
    expect(wrapper.find('#CertificationTaskActivityEntitlementModal').exists()).toBeTruthy();
  });

  it('renders the user avatar as decorative image', () => {
    wrapper = setup({
      activity: [
        {
          user: {
            id: 'testId',
            givenName: 'Test',
            sn: 'User',
            userName: 'test.user',
            profileImage: 'https://openam-gov-v2-3.forgeblocks.com/platform/img/avatar.png',
          },
          action: 'comment',
          comment: 'Test comment',
          timeStamp: '2026-09-15T12:00:00Z',
        },
      ],
    });

    const img = wrapper.find('b-img-stub');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('https://openam-gov-v2-3.forgeblocks.com/platform/img/avatar.png');
    expect(img.attributes('alt')).toBe('');
  });
});
