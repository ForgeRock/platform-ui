import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import Resources from '@/components/uma/Resources';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Sharing.vue', () => {
  it('Resources page loaded', () => {
    const wrapper = shallowMount(Resources, {
      localVue,
      i18n,
    });

    expect(wrapper.name()).toBe('Resources');
    expect(wrapper).toMatchSnapshot();
  });

  it('Emits "renderShareModal" event', () => {
    const wrapper = shallowMount(Resources, {
      localVue,
      i18n,
    });

    wrapper.vm.renderShareModal();

    localVue.nextTick(() => {
      expect(wrapper.emitted('renderShareModal').length).toBe(1);
    });
  });

  it('Emits "renderUnshareModal" event', () => {
    const wrapper = shallowMount(Resources, {
      localVue,
      i18n,
    });

    wrapper.vm.renderUnshareModal();

    localVue.nextTick(() => {
      expect(wrapper.emitted('renderUnshareModal').length).toBe(1);
    });
  });

  it('Toggles grid view', () => {
    const wrapper = shallowMount(Resources, {
      localVue,
      i18n,
      propsData: {
        viewgrid: false,
      },
    });
    expect(wrapper.vm.viewgrid).toBe(false);

    wrapper.vm.toggleGrid();

    localVue.nextTick(() => {
      expect(wrapper.vm.viewgrid).toBe(true);
    });
  });
});
