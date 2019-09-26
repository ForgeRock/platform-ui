import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import LoadingButton from '@/components/utils/LoadingButton';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('ListItem.vue', () => {
	it('List Group component loaded', () => {
		const wrapper = shallowMount(LoadingButton, { localVue });

		expect(wrapper.name()).toBe('LoadingButton');
		expect(wrapper).toMatchSnapshot();
	});
});
