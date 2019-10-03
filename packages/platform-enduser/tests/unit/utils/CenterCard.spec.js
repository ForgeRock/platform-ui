import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import FloatingLabelInput from '@/components/utils/CenterCard';

describe('CenterCard.vue', () => {
	Vue.use(BootstrapVue);

	it('Center Card component loaded without header images', () => {
		const wrapper = shallowMount(FloatingLabelInput, { i18n });

		expect(wrapper.name()).to.equal('CenterCard');
		expect(wrapper.contains('.fr-logo')).to.equal(false);
	});

	it('Center Card component loaded with header images', () => {
		const wrapper = shallowMount(FloatingLabelInput, {
			i18n,
			propsData: {
				showLogo: true,
			},
		});

		expect(wrapper.contains('.fr-logo')).to.equal(true);
	});
});
