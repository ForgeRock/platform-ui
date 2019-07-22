import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import HorizontalRule from '@/components/utils/HorizontalRule';

describe('HorizontalRule.vue', () => {
  Vue.use(BootstrapVue);

  it('Horizontal Rule component loaded', () => {
    const wrapper = shallowMount(HorizontalRule, {
      propsData: {
        insert: 'test',
      },
    });

    expect(wrapper.name()).to.equal('HorizontalRule');
  });

  it('Renders insert prop', () => {
    const wrapper = shallowMount(HorizontalRule, {
      propsData: {
        insert: 'test',
      },
    });

    expect(wrapper.find('.col-auto').text()).to.equal('test');
  });
});
