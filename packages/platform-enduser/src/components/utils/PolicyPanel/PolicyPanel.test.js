import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import PolicyPanel from '@/components/utils/PolicyPanel';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

let wrapper;

describe('PolicyPanel.vue', () => {
  wrapper = shallowMount(PolicyPanel, {
    localVue,
    i18n,
    propsData: {
      policies: [{ name: 'test', params: { args: 'test args' } }],
      policyFailures: ['test'],
    },
  });

  it('PolicyPanel component loaded', () => {
    expect(wrapper.name()).toBe('PolicyPanel');
    expect(wrapper).toMatchSnapshot();
  });

  describe('proper render', () => {
    wrapper = shallowMount(PolicyPanel, {
      localVue,
      i18n,
      propsData: {
        policies: [{ name: 'test', params: { args: 'test args' } }],
        policyFailures: ['test'],
      },
    });

    it('should not show anything when "policyFailures" is loading', () => {
      wrapper.setProps({ policyFailures: 'loading' });

      expect(wrapper.contains('ul')).toBe(true);
      expect(wrapper.contains('div.alert')).toBe(false);
    });

    it('should show policy ul when "policyFailures" is non empty array', () => {
      wrapper.setProps({ policyFailures: ['test'] });

      expect(wrapper.contains('ul')).toBe(true);
      expect(wrapper.contains('div.alert')).toBe(false);
    });

    it('should show success alert when "policyFailures" is an empty array', () => {
      wrapper.setProps({ policyFailures: [] });

      expect(wrapper.contains('ul')).toBe(true);
      expect(wrapper.contains('div.alert')).toBe(false);
    });
  });

  describe('#translate', () => {
    wrapper = shallowMount(PolicyPanel, {
      localVue,
      i18n,
      propsData: {
        policies: [{ name: 'test', params: { args: 'test args' } }],
        policyFailures: ['test'],
      },
    });

    it('should return a properly translated string', () => {
      const expectedString = 'Must be 1 characters long';

      expect(wrapper.vm.translate({ name: 'MIN_LENGTH', params: { minLength: 1 } })).toBe(expectedString);
    });
  });
});
