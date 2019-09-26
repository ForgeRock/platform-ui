import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import ListItem from '@/components/utils/ListItem';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('ListItem.vue', () => {
	it('List Group component loaded', () => {
		const wrapper = shallowMount(ListItem, { localVue });

		expect(wrapper.name()).toBe('ListItem');
		expect(wrapper).toMatchSnapshot();
	});
});
