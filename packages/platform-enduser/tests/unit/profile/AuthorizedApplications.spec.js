import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';
import AuthorizedApplications from '@/components/profile/AuthorizedApplications';
import i18n from '@/i18n';

describe('AuthorizedApplications.vue', () => {
	let sandbox = null;

	beforeEach(() => {
		sandbox = Sinon.createSandbox();
		sandbox.stub(AuthorizedApplications, 'mounted').callsFake(() => {});
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Authorized Applications loads', () => {
		const wrapper = shallowMount(AuthorizedApplications, {
			i18n,
		});

		expect(wrapper.name()).to.equal('AuthorizedApplications');
	});

	it('showConfirmationModal sets correct application values and shows modal', () => {
		const spy = Sinon.spy();
		const wrapper = shallowMount(AuthorizedApplications, {
			i18n,
		});
		wrapper.vm.$refs = { fsModal: { show: spy } };
		wrapper.vm.showConfirmationModal({ _id: '12345' });

		expect(wrapper.vm.confirmApplication.id).to.equal('12345');
		expect(spy.called).to.equal(true);
	});
});
