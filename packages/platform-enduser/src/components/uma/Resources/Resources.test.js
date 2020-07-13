/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import Resources from '@/components/uma/Resources';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Sharing.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Resources, {
      localVue,
      i18n,
      propsData: {
        viewgrid: false,
      },
    });
  });

  afterEach(() => {
    wrapper = undefined;
  });

  it('Resources page loaded', () => {
    expect(wrapper.name()).toBe('Resources');
    expect(wrapper).toMatchSnapshot();
  });

  it('Emits "renderShareModal" event', () => {
    wrapper.vm.renderShareModal();

    localVue.nextTick(() => {
      expect(wrapper.emitted('renderShareModal').length).toBe(1);
    });
  });

  it('Emits "renderUnshareModal" event', () => {
    wrapper.vm.renderUnshareModal();

    localVue.nextTick(() => {
      expect(wrapper.emitted('renderUnshareModal').length).toBe(1);
    });
  });

  it('Toggles grid view', () => {
    expect(wrapper.vm.viewgrid).toBe(false);

    wrapper.vm.toggleGrid();

    localVue.nextTick(() => {
      expect(wrapper.vm.viewgrid).toBe(true);
    });
  });
});
