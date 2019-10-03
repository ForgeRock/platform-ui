import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import Preferences from '@/components/profile/Preferences';
import i18n from '@/i18n';

Vue.use(Vuex);

describe('Preferences.vue', () => {
	let store;

	beforeEach(() => {
		store = new Vuex.Store({
			state: {
				UserStore: {
					userId: null,
					managedResource: null,
					roles: null,
					internalUser: false,
					adminUser: false,
					profile: {},
					schema: {
						order: [],
						properties: {
							preferences: {
								properties: {
									updates: {
										description: 'Send me news and updates',
										value: false,
									},
									marketing: {
										description: 'Send me special offers and services',
										value: true,
									},
								},
							},
						},
						required: [],
					},
					access: [],
					givenName: '',
					sn: '',
					email: '',
					userName: '',
				},
				ApplicationStore: {
					authHeaders: null,
					amDataEndpoints: null,
					loginRedirect: null,
					amBaseURL: 'https://default.iam.example.com/am',
					idmBaseURL: 'https://default.iam.example.com/openidm',
					loginURL: 'http://localhost:8083/#/service/login',
					theme: 'default',
					idmClientID: 'endUserUIClient',
					adminURL: 'http://localhost:8082',
				},
			},
		});
	});

	Vue.use(BootstrapVue);

	it('Preferences page loaded', () => {
		const wrapper = shallowMount(Preferences, {
			store,
			i18n,
		});

		expect(wrapper.name()).to.equal('Preferences');
	});

	describe('#loadData', () => {
		it('should load the preferences data', () => {
			const wrapper = shallowMount(Preferences, {
				store,
				i18n,
			});

			wrapper.vm.loadData();

			const { marketing, updates } = wrapper.vm.preferences;

			expect(marketing).to.have.property('description').that.equals('Send me special offers and services');
			expect(marketing).to.have.property('value').that.equals(true);
			expect(updates).to.have.property('description').that.equals('Send me news and updates');
			expect(updates).to.have.property('value').that.equals(false);
		});
	});

	describe('#generatePatch', () => {
		it('should generate a well formed patch payload', () => {
			const wrapper = shallowMount(Preferences, {
				store,
				i18n,
			});

			const patch = wrapper.vm.generatePatch('test preference', 'test value');

			expect(patch).to.be.an('Array').with.property('length').that.equals(1);
			expect(patch[0]).to.have.property('field').that.equals('/preferences/test preference');
			expect(patch[0]).to.have.property('value').that.equals('test value');
		});
	});

	describe('#savePreferences', () => {
		it('should emit "updateProfile" with a payload', () => {
			const wrapper = shallowMount(Preferences, {
				store,
				i18n,
			});

			wrapper.vm.savePreferences('test preference', 'test value');

			const patchEventList = wrapper.emitted().updateProfile;
			const firstPatchEvent = patchEventList[0];
			const payload = firstPatchEvent[0];

			expect(patchEventList).to.be.an('Array').with.property('length').that.equals(1);
			expect(payload[0]).to.deep.equal(wrapper.vm.generatePatch('test preference', 'test value')[0]);
		});
	});
});
