import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import ListGroup from '@/components/utils/ListGroup';

describe('ListGroup.vue', () => {
  Vue.use(BootstrapVue);

  it('List Group component loaded', () => {
    const wrapper = shallowMount(ListGroup);

    expect(wrapper.name()).to.equal('ListGroup');
  });
});
