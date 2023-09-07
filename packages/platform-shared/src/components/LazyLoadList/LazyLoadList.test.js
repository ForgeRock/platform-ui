/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@forgerock/platform-shared/src/i18n';
import LazyLoadList from './index';

describe('LazyLoadList', () => {
  function mountComponent(propsData, overrideData = {}) {
    const wrapper = mount(LazyLoadList, {
      global: {
        plugins: [i18n],
      },
      props: {
        additionalItemsAvailable: false,
        listItems: [],
        ...propsData,
      },
    });
    wrapper.setData(overrideData);
    return wrapper;
  }

  it('does not load additional items if none are available', async () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.spinner-small').exists()).toBeFalsy();
    await flushPromises();
    expect(wrapper.find('.spinner-small').exists()).toBeFalsy();
  });

  it('displays spinner while loading', async () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.spinner-small').exists()).toBeFalsy();
    await wrapper.setProps({
      listItems: [],
      additionalItemsAvailable: true,
    });
    await flushPromises();
    expect(wrapper.find('.spinner-small').exists()).toBeTruthy();
  });

  it('displays items after loading', async () => {
    const wrapper = mountComponent();
    await wrapper.setProps({
      listItems: [{
        _id: 'id',
      }],
      additionalItemsAvailable: true,
    });

    expect(wrapper.find('.list-group-item').exists()).toBeTruthy();
  });

  it('emits request to lazy load list', async () => {
    const wrapper = mountComponent({
      additionalItemsAvailable: true,
    });

    expect(wrapper.emitted('query-additional-items')).toBeTruthy();
  });
});
