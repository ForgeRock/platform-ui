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
