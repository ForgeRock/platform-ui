import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';
import i18n from '@/i18n';
import ToolbarNotification from '@/components/utils/ToolbarNotification';

describe('ToolbarNotification.vue', () => {
	let sandbox = null;

	Vue.use(BootstrapVue);

	beforeEach(() => {
		sandbox = Sinon.createSandbox();

		sandbox.stub(ToolbarNotification, 'mounted').callsFake(() => {});
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Toolbar Notification component loaded', () => {
		const wrapper = shallowMount(ToolbarNotification, {
			i18n,
		});

		wrapper.setData({
			notifications: [{
				createDate: '2018-06-04T16:20:04.795',
				message: 'Your profile has been updated',
				notificationSubtype: '',
				notificationType: '',
				receiverId: 'a7c9f2ab-52c4-47bb-9ec9-bfeb78f56898',
				_id: 'a4b8900c-d934-4a5f-962f-ee734728882c',
			}],
		});

		expect(wrapper.name()).to.equal('ToolbarNotification');
	});
});
