import BootstrapVue from 'bootstrap-vue';
import { noop } from 'lodash';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import ValidationError from '@/components/utils/ValidationError';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('ValidationError.vue', () => {
	it('Validation Error component loaded', () => {
		const wrapper = shallowMount(ValidationError, {
			propsData: {
				localVue,
				validatorErrors: {
					has: noop,
					first: noop,
				},
				fieldName: 'test',
			},
		});

		expect(wrapper.name()).toEqual('ValidationError');
		expect(wrapper).toMatchSnapshot();
	});
});
