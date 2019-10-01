import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import CenterCard from './index';
import i18n from '@/i18n';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('CenterCard.vue', () => {
  it('Center Card component loaded without header images', () => {
    const wrapper = shallowMount(CenterCard, {
      localVue,
      i18n,
    });

    expect(wrapper.name()).toBe('CenterCard');
    expect(wrapper.contains('.fr-logo')).toBe(false);
    expect(wrapper).toMatchSnapshot();
  });

  it('Center Card component loaded with header images', () => {
    const wrapper = shallowMount(CenterCard, {
      localVue,
      i18n,
      propsData: {
        showLogo: true,
      },
    });

    expect(wrapper.contains('.fr-logo')).toBe(true);
  });
});
