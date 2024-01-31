/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import i18n from '@forgerock/platform-shared/src/i18n';
import Accordion from './index';

function setup(props) {
  return mount(Accordion, {
    global: {
      plugins: [i18n],
    },
    slots: {
      header: '<template #header="slotData"><h1>{{slotData.headerTitle}}</h1></template>',
      body: '<template #header="slotData"><p>{{slotData.bodyContent}}</p></template>',
    },
    props: {
      ...props,
    },
    data() {
      return {
      };
    },
  });
}

/* eslint-disable import/prefer-default-export */
export function getAccordionItems(wrapper) {
  return wrapper.findAll('.accordion .card > div');
}

describe('Accordion Component', () => {
  it('Accordion successfully loaded', () => {
    const props = {
      accordionGroup: 'test-group',
      items: [
        { headerTitle: 'Test title 1', bodyContent: 'Test body 1', open$: false },
        { headerTitle: 'Test title 2', bodyContent: 'Test body 2', open$: false },
        { headerTitle: 'Test title 3', bodyContent: 'Test body 3', open$: false },
      ],
    };
    const wrapper = setup(props);
    expect(wrapper.vm.wasOpen).toEqual(false);
  });

  it('returns the correct amount of accordion items', () => {
    const props = {
      accordionGroup: 'test-group',
      items: [
        { headerTitle: 'Test title 1', bodyContent: 'Test body 1', open$: false },
        { headerTitle: 'Test title 2', bodyContent: 'Test body 2', open$: false },
        { headerTitle: 'Test title 3', bodyContent: 'Test body 3', open$: false },
      ],
    };
    const wrapper = setup(props);
    const accordionItemsWrapper = getAccordionItems(wrapper);
    expect(accordionItemsWrapper.length).toBe(props.items.length);
  });
});
