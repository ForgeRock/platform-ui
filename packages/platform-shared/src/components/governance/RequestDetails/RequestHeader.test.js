/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import { mount } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import RequestHeader from './RequestHeader';
import i18n from '@/i18n';

describe('RequestHeader', () => {
  let wrapper;

  function setup(props) {
    return mount(RequestHeader, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  const item = {
    details: {
      requestedBy: 'test name',
      requestedFor: 'test2 name2',
      date: 'Aug 13, 2024',
    },
    rawData: {
      requestType: 'test',
    },
  };

  it('shows correct header text when all item details are present', () => {
    wrapper = setup({ item });

    expect(wrapper.text()).toBe('test namesubmitted this requestfor test2 name2on Aug 13, 2024');
  });

  it('shows correct header text when requested for is missing', () => {
    const itemCopy = cloneDeep(item);
    delete itemCopy.details.requestedFor;
    wrapper = setup({ item: itemCopy });

    expect(wrapper.text()).toBe('test namesubmitted this requeston Aug 13, 2024');
  });

  it('handles when the requester has id of SYSTEM', () => {
    const itemCopy = cloneDeep(item);
    itemCopy.details.requestedBy = 'System';
    wrapper = setup({ item: itemCopy });

    expect(wrapper.text()).toBe('Systemsubmitted this requestfor test2 name2on Aug 13, 2024');
  });

  describe('@a11y', () => {
    it('renders the request type before the request name in DOM order', () => {
      const itemWithName = cloneDeep(item);
      itemWithName.details.name = 'Avanto';
      itemWithName.details.type = 'Grant Entitlement';
      wrapper = setup({ item: itemWithName });

      // Reading order must match visual order: the type label first (a plain
      // p, not a heading — it is request metadata, not a document section),
      // then the name as the h1. The visual order used to be produced with
      // flex-column-reverse, which inverted it for screen reader users
      // (WCAG 1.3.2).
      const typeLabel = wrapper.find('p.h5.text-muted.mb-1');
      expect(typeLabel.exists()).toBe(true);
      expect(typeLabel.text()).toBe('Grant Entitlement');
      const h1 = wrapper.find('h1');
      expect(h1.text()).toBe('Avanto');
      expect(typeLabel.element.nextSibling).toBe(h1.element);
    });

    it('renders exactly one heading (the h1) so heading navigation starts at the page title', () => {
      const itemWithName = cloneDeep(item);
      itemWithName.details.name = 'Avanto';
      itemWithName.details.type = 'Grant Entitlement';
      wrapper = setup({ item: itemWithName });

      const headings = wrapper.findAll('h1, h2, h3, h4, h5, h6');
      expect(headings).toHaveLength(1);
      expect(headings[0].element.tagName).toBe('H1');
      expect(headings[0].text()).toBe('Avanto');
    });

    it('falls back to the request type as the h1 when no name is present', () => {
      const itemWithType = cloneDeep(item);
      itemWithType.details.type = 'Grant Entitlement';
      wrapper = setup({ item: itemWithType });

      expect(wrapper.find('p.h5.text-muted.mb-1').exists()).toBe(false);
      const h1 = wrapper.find('h1');
      expect(h1.text()).toBe('Grant Entitlement');
      expect(h1.classes()).toContain('h5');
      expect(h1.classes()).toContain('text-muted');
    });

    it('has no accessibility violations', async () => {
      const itemWithName = cloneDeep(item);
      itemWithName.details.name = 'Avanto';
      itemWithName.details.type = 'Grant Entitlement';
      wrapper = setup({ item: itemWithName });

      await runA11yTest(wrapper);
    });
  });
});
