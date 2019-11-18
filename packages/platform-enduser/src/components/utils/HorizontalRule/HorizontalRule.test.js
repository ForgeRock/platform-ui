/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import HorizontalRule from '@/components/utils/HorizontalRule';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('HorizontalRule.vue', () => {
  it('Horizontal Rule component loaded', () => {
    const wrapper = shallowMount(HorizontalRule, {
      localVue,
      propsData: {
        insert: 'test',
      },
    });

    expect(wrapper.name()).toBe('HorizontalRule');
    expect(wrapper).toMatchSnapshot();
  });

  it('Renders insert prop', () => {
    const wrapper = shallowMount(HorizontalRule, {
      localVue,
      propsData: {
        insert: 'test',
      },
    });

    expect(wrapper.find('.col-auto').text()).toBe('test');
  });
});
