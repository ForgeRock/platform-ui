import BootstrapVue from 'bootstrap-vue';
import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import ToolbarNotification from '@/components/utils/ToolbarNotification';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(Vuex);

const store = new Vuex.Store({});

describe('ToolbarNotification.vue', () => {
	it('Toolbar Notification component loaded', async () => {
		const wrapper = shallowMount(ToolbarNotification, {
			localVue,
			i18n,
			store,
			methods: { loadData: jest.fn() },
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

		expect(wrapper.name()).toEqual('ToolbarNotification');
		expect(wrapper).toMatchSnapshot();
	});
});
