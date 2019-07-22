import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import ListItem from '@/components/utils/ListItem';

describe('ListItem.vue', () => {
  Vue.use(BootstrapVue);

  it('List Group component loaded', () => {
    const wrapper = shallowMount(ListItem);

    expect(wrapper.name()).to.equal('ListItem');
  });
});
