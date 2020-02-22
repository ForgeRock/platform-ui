/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import PolicyPanel from '@forgerock/platform-shared/src/components/PolicyPanel';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

let wrapper;

describe('PolicyPanel.vue', () => {
  beforeEach(() => {
    wrapper = shallowMount(PolicyPanel, {
      localVue,
      propsData: {
        policies: [{ name: 'test', params: { args: 'test args' } }],
        policyFailures: ['test'],
      },
      mocks: {
        $t: (path) => {
          if (path === 'common.policyValidationMessages.MIN_LENGTH') {
            return 'Must be 1 characters long';
          }
          return '';
        },
      },
    });
  });

  it('PolicyPanel component loaded', () => {
    expect(wrapper.name()).toBe('PolicyPanel');
    expect(wrapper).toMatchSnapshot();
  });

  describe('proper render', () => {
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
    it('should return a properly translated string', () => {
      const expectedString = 'Must be 1 characters long';

      expect(wrapper.vm.translate({ name: 'MIN_LENGTH', params: { minLength: 1 } })).toBe(expectedString);
    });
  });
});
