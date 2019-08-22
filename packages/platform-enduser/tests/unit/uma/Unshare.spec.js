import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import Unshare from '@/components/uma/Unshare';

describe('Unshare.vue', () => {
	Vue.use(BootstrapVue);

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
		const wrapper = mount(Unshare, {
			i18n,
			propsData,
		});

		expect(wrapper.name()).to.equal('Unshare');
	});

	it('Emits "unshareResource" event', () => {
		const wrapper = mount(Unshare, {
			i18n,
			propsData,
		});

		wrapper.vm.unshare('12345');

		Vue.nextTick(() => {
			expect(wrapper.emitted('unshareResource').length).to.equal(1);
		});
	});
});
