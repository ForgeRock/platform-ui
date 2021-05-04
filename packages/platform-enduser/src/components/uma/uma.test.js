/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import Uma from '@/components/uma';

const localVue = createLocalVue();

let wrapper;

localVue.use(BootstrapVue);

describe('uma.vue', () => {
  beforeEach(() => {
    wrapper = shallowMount(Uma, {
      localVue,
      i18n,
      methods: {
        loadData: jest.fn(),
        getResources: jest.fn(() => {
          this.resources = [];
        }),
        getActivity: jest.fn(() => {
          this.activity = [];
        }),
        getRequests: jest.fn(() => {
          this.requests = [];
        }),
      },
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it('Sharing page loaded', () => {
    expect(wrapper.name()).toBe('Sharing');
  });

  it('Emits "renderShareModal" event', () => {
    wrapper.vm.$emit('renderShareModal');

    expect(wrapper.emitted().renderShareModal.length).toBe(1);

    wrapper.vm.renderShareModal();

    localVue.nextTick(() => {
      /* eslint no-underscore-dangle: ["error", { "allow": ["__emitted"] }] */
      expect(wrapper.vm.$root.__emitted['bv::show::modal'].length).toBe(1);
    });
  });

  it('Emits "renderUnshareModal" event', () => {
    wrapper.vm.$emit('renderUnshareModal');

    expect(wrapper.emitted().renderUnshareModal.length).toBe(1);

    wrapper.vm.renderUnshareModal();

    localVue.nextTick(() => {
      expect(wrapper.vm.$root.__emitted['bv::show::modal'].length).toBe(1);
    });
  });
});
