import { createLocalVue, shallowMount } from '@vue/test-utils';
import AuthorizedApplications from '@/components/profile/AuthorizedApplications';
import i18n from '@/i18n';

const localVue = createLocalVue();

describe('AuthorizedApplications.vue', () => {
	beforeEach(() => {
		jest.spyOn(AuthorizedApplications, 'mounted')
			.mockImplementation(() => { });
	});

	it('Authorized Applications loads', () => {
		const wrapper = shallowMount(AuthorizedApplications, {
			localVue,
			i18n,
			stubs: {
				BListGroupItem: true,
				BModal: true,
				BBtn: true,
			},
		});

		expect(wrapper.name()).toBe('AuthorizedApplications');
		expect(wrapper).toMatchSnapshot();
	});
});
