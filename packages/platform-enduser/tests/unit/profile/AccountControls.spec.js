import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import AccountControls from '@/components/profile/AccountControls';
import i18n from '@/i18n';

describe('Preferences.vue', () => {
	Vue.use(BootstrapVue);

	it('Account Controls page loaded', () => {
		const wrapper = shallowMount(AccountControls, {
			i18n,
		});

		expect(wrapper.name()).to.equal('AccountControls');
	});
});
