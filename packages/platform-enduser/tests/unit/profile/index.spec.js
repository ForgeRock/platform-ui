import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import Sinon from 'sinon';
import Vuex from 'vuex';
import i18n from '@/i18n';
import Profile from '@/components/profile';

Vue.use(Vuex);

Profile.components['fr-consent'] = Sinon.stub();
Profile.components['fr-edit-personal-info'] = Sinon.stub();
Profile.components['fr-account-controls'] = Sinon.stub();
Profile.components['fr-account-security'] = Sinon.stub();

describe('Profile.vue', () => {
	Vue.use(BootstrapVue);

	it('Profile page loaded', () => {
		const store = new Vuex.Store({
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

		const wrapper = mount(Profile, {
			i18n,
			store,
		});

		expect(wrapper.name()).to.equal('Profile');
	});
});
