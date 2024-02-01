/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ActivityModal from './ActivityModal';

let wrapper;
function setup() {
  wrapper = shallowMount(ActivityModal, {
    global: {
      mocks: {
        $t: (t) => t,
      },
    },
    props: {
      taskListColumns: [],
    },
  });
}

describe('ActivityModal', () => {
  beforeEach(() => setup());

  it('updatePageSize method should update itemsPerPage', () => {
    wrapper.vm.updatePageSize(20);

    expect(wrapper.vm.itemsPerPage).toBe(20);
  });

  it('formatDate method should return date formatted', () => {
    const formatted = wrapper.vm.formatDate('2022-12-23');

    expect(formatted).toBe('Dec 23, 2022 12:00 AM');
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
});
