import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import Unshare from '@/components/uma/Unshare';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Unshare.vue', () => {
	const propsData = {
		resource: {
			_id: '12345',
			name: 'test resource',
			resourceOwnerId: 'alice',
			scopes: ['view', 'comment', 'download'],
			policy: {
				permissions: [{
					subject: 'bob',
					scopes: ['download'],
				}],
			},
		},
		newScopes: {},
		newShare: false,
	};

	it('Resources page loaded', () => {
		const wrapper = shallowMount(Unshare, {
			localVue,
			i18n,
			propsData,
		});

		expect(wrapper.name()).toBe('Unshare');
		expect(wrapper).toMatchSnapshot();
	});

	it('Emits "unshareResource" event', () => {
		const wrapper = shallowMount(Unshare, {
			localVue,
			i18n,
			propsData,
		});

		wrapper.vm.$refs.fsModal.hide = jest.fn();
		wrapper.vm.unshare('12345');

		localVue.nextTick(() => {
			expect(wrapper.emitted('unshareResource').length).toBe(1);
		});
	});
});
