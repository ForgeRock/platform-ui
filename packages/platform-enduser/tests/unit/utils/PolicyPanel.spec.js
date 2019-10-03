import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import PolicyPanel from '@/components/utils/PolicyPanel';

describe('PolicyPanel.vue', () => {
	Vue.use(BootstrapVue);

	describe('proper render', () => {
		const wrapper = shallowMount(PolicyPanel, {
			i18n,
			propsData: {
				policies: [{ name: 'test', params: { args: 'test args' } }],
				policyFailures: ['test'],
			},
		});

		it('should not show anything when "policyFailures" is loading', () => {
			wrapper.setProps({ policyFailures: 'loading' });

			expect(wrapper.contains('ul')).to.equal(true);
			expect(wrapper.contains('div.alert')).to.equal(false);
		});

		it('should show policy ul when "policyFailures" is non empty array', () => {
			wrapper.setProps({ policyFailures: ['test'] });

			expect(wrapper.contains('ul')).to.equal(true);
			expect(wrapper.contains('div.alert')).to.equal(false);
		});

		it('should show success alert when "policyFailures" is an empty array', () => {
			wrapper.setProps({ policyFailures: [] });

			expect(wrapper.contains('ul')).to.equal(true);
			expect(wrapper.contains('div.alert')).to.equal(false);
		});
	});

	describe('#translate', () => {
		const wrapper = shallowMount(PolicyPanel, {
			i18n,
			propsData: {
				policies: [{ name: 'test', params: { args: 'test args' } }],
				policyFailures: ['test'],
			},
		});

		it('should return a properly translated string', () => {
			const expectedString = 'Must be 1 characters long';

			expect(wrapper.vm.translate({ name: 'MIN_LENGTH', params: { minLength: 1 } })).to.equal(expectedString);
		});
	});
});
