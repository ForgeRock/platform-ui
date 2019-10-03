import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/i18n';
import App from '@/App';

Vue.use(Vuex);

describe('Base App', () => {
	Vue.use(BootstrapVue);

	const $route = {
		path: '/test',
		meta: {},
	};

	const store = new Vuex.Store({
		state: {
			UserStore: {
				userId: null,
				managedResource: null,
				roles: null,
				internalUser: false,
				adminUser: false,
				profile: {},
				schema: {},
				access: [],
				givenName: '',
				sn: '',
				email: '',
				userName: '',
			},
		},
	});

	it('Base App page loaded', () => {
		const wrapper = shallowMount(App, {
			i18n,
			stubs: ['router-link', 'router-view', 'notifications'],
			mocks: { $route },
			store,
		});

		expect(wrapper.name()).to.equal('App');
	});

	it('Side nav toggle', () => {
		const wrapper = shallowMount(App, {
			i18n,
			stubs: ['router-link', 'router-view', 'notifications'],
			mocks: { $route },
			store,
		});

		expect(wrapper.vm.toggled).to.equal(false);

		wrapper.vm.onToggle();

		expect(wrapper.vm.toggled).to.equal(true);
	});

	it('Access generated icons', () => {
		const wrapper = shallowMount(App, {
			i18n,
			stubs: ['router-link', 'router-view', 'notifications'],
			mocks: { $route },
			store,
		});

		expect(wrapper.vm.accessIcon('')).to.equal('fa fa-fw mr-3 fa-cube');
		expect(wrapper.vm.accessIcon('fa-test')).to.equal('fa fa-fw mr-3 fa-test');
	});
});
