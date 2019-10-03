import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';
import i18n from '@/i18n';
import AccountSecurity from '@/components/profile/AccountSecurity';

describe('AccountSecurity.vue', () => {
	let sandbox = null;

	Vue.use(BootstrapVue);

	beforeEach(() => {
		sandbox = Sinon.createSandbox();

		sandbox.stub(AccountSecurity, 'mounted').callsFake(() => {
			this.isOnKBA = true;
			this.kbaData = {};
		});
	});

	afterEach(() => {
		sandbox.restore();
	});

	it.skip('AccountSecurity page loaded', () => {
		const userStore = {
			state: {
				internalUser: true,
			},
		};

		const applicationStore = {
			state: {
				platformMode: false,
			},
		};

		const wrapper = shallowMount(AccountSecurity, {
			i18n,
			mocks: {
				userStore,
				applicationStore,
			},
		});

		expect(wrapper.name()).to.equal('AccountSecurity');
	});

	describe('#sendUpdateProfile', () => {
		it.skip('should emit an "updateProfile" event with the payload and config', () => {
			const userStore = {
				state: {
					internalUser: true,
				},
			};


			const applicationStore = {
				state: {
					platformMode: false,
				},
			};


			const wrapper = shallowMount(AccountSecurity, {
				i18n,
				mocks: {
					userStore,
					applicationStore,
				},
			});

			wrapper.vm.sendUpdateProfile('test payload', 'test config');
			expect(wrapper.emitted().updateProfile.length).to.equal(1);

			const [payload, config] = wrapper.emitted().updateProfile[0];

			expect(payload).to.equal('test payload');
			expect(config).to.equal('test config');
		});
	});
});
