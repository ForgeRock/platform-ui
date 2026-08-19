/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ViolationConflictModal from './ViolationConflictModal';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

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
        application: {
          name: 'appName1',
        },
        'descriptor.idx./entitlement.displayName': 'name1',
        'glossary.idx./entitlement.description': 'description1',
      },
      {
        compositeId: 'id2',
        application: {
          name: 'appName2',
        },
        'descriptor.idx./entitlement.displayName': 'name2',
        'glossary.idx./entitlement.description': 'description2',
      },
      {
        compositeId: 'id3',
        application: {
          name: 'appName3',
        },
        'descriptor.idx./entitlement.displayName': 'name3',
        'glossary.idx./entitlement.description': 'description3',
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

  it('uses the expected heading hierarchy', () => {
    const wrapper = mountComponent();

    const modal = wrapper.findComponent({ name: 'BModal' });
    expect(modal.props('titleTag')).toBe('h2');
    expect(modal.props('titleClass')).toBe('h5');
    expect(wrapper.findAll('h3')).toHaveLength(2);
    expect(wrapper.findAll('h4')).toHaveLength(3);
    expect(wrapper.findAll('h5')).toHaveLength(3);

    wrapper.findAll('.list-group-item').forEach((item) => {
      const headings = item.findAll('h4, h5');
      expect(headings[0].element.tagName).toBe('H4');
      expect(headings[1].element.tagName).toBe('H5');
    });
  });

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
