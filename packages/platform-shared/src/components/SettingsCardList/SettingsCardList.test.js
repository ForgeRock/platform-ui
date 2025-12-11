/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import SettingsCardList from './SettingsCardList';

describe('SettingsCardList', () => {
  let wrapper;

  const setup = (propsOverride) => mount(SettingsCardList, {
    global: {
      mocks: {
        $t: () => {},
      },
    },
    props: {
      enabled: false,
      ...propsOverride,
    },
  });

  beforeEach(() => {
    wrapper = setup();
  });

  it('Row click emits event when clickable', async () => {
    wrapper = setup({
      enabled: false,
      clickable: true,
      listItems: {
        example: {
          title: 'Example',
          value: true,
        },
      },
    });
    const rowElement = wrapper.find('.row');
    await rowElement.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().change).toBeTruthy();
    expect(wrapper.emitted().change[0][0].key).toBe('example');
    expect(wrapper.emitted().change[0][0].value).toBe(true);
  });

  it('Single event emitted when button clicked in clickable row', async () => {
    wrapper = setup({
      enabled: false,
      clickable: true,
      listItems: {
        example: {
          title: 'Example',
          value: true,
          route: 'test',
        },
      },
    });
    const button = wrapper.find('button');
    await button.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().change.length).toBe(1);
  });

  it('Emits change event with new value', () => {
    wrapper.vm.changeState('key', true, '/test');
    expect(wrapper.emitted().change).toBeTruthy();
    expect(wrapper.emitted().change[0][0].key).toBe('key');
    expect(wrapper.emitted().change[0][0].value).toBe(true);
    expect(wrapper.emitted().change[0][0].route).toBe('/test');
  });

  it('Does not include route value if not provided', () => {
    wrapper.vm.changeState('key', true);
    expect(wrapper.emitted().change).toBeTruthy();
    expect(wrapper.emitted().change[0][0].key).toBe('key');
    expect(wrapper.emitted().change[0][0].value).toBe(true);
    expect(wrapper.emitted().change[0][0].route).toBe(undefined);
  });
});
