import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, RouterLinkStub, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import NotFound from '@/components/NotFound';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('NotFound.vue', () => {
  it('Not found page loaded', () => {
    const wrapper = shallowMount(NotFound, {
      localVue,
      i18n,
      stubs: {
        RouterLink: RouterLinkStub,
      },
    });

    expect(wrapper.name()).toBe('NotFound');
    expect(wrapper).toMatchSnapshot();
  });
});
