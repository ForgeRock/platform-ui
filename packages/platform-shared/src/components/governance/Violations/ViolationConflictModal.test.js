/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ViolationConflictModal from './ViolationConflictModal';
import i18n from '@/i18n';

describe('Violation Conflict Modal', () => {
  const violation = {
    decision: {
      compositeIds: [
        ['id1', 'id2'],
        ['id3'],
      ],
    },
    violatingAccess: [
      {
        compositeId: 'id1',
        assignment: {
          name: 'name1',
          description: 'description1',
        },
        application: {
          name: 'appName1',
        },
      },
      {
        compositeId: 'id2',
        assignment: {
          name: 'name2',
          description: 'description2',
        },
        application: {
          name: 'appName2',
        },
      },
      {
        compositeId: 'id3',
        assignment: {
          name: 'name3',
          description: 'description3',
        },
        application: {
          name: 'appName3',
        },
      },
    ],
  };
  const props = {
    isTesting: true,
    violation,
  };
  function mountComponent() {
    const wrapper = mount(ViolationConflictModal, {
      global: {
        plugins: [i18n],
      },
      props,
    });
    return wrapper;
  }

  it('has one column for the first set of entitlements', () => {
    const wrapper = mountComponent();

    const firstColumn = wrapper.find('.col-lg-6');

    const items = firstColumn.findAll('.list-group-item');
    const item1 = items[0];
    expect(item1.text()).toMatch('appName1');
    expect(item1.text()).toMatch('description1');
    expect(item1.text()).toMatch('name1');
    const item2 = items[1];
    expect(item2.text()).toMatch('appName2');
    expect(item2.text()).toMatch('description2');
    expect(item2.text()).toMatch('name2');
  });

  it('has one column for the second set of entitlements', () => {
    const wrapper = mountComponent();

    const secondColumn = wrapper.findAll('.col-lg-6')[1];
    const item = secondColumn.find('.list-group-item');
    expect(item.text()).toMatch('appName3');
    expect(item.text()).toMatch('description3');
    expect(item.text()).toMatch('name3');
  });
});
