import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import FloatingLabelInput from '@/components/utils/FloatingLabelInput';
import ValidationError from '@/components/utils/ValidationError';

const localVue = createLocalVue();
localVue.use(VeeValidate);
localVue.use(ValidationError);
localVue.use(BootstrapVue);

describe('FloatingLabelInput.vue', () => {
	it('Floating Label Input component loaded', () => {
		const v = new VeeValidate.Validator();

		const wrapper = shallowMount(FloatingLabelInput, {
			localVue,
			provide: () => ({
				$validator: v,
			}),
			propsData: {
				label: '',
				type: '',
				autofocus: '',
				fieldName: 'test',
			},
		});

		expect(wrapper.name()).toBe('FloatingLabelInput');
		expect(wrapper).toMatchSnapshot();
	});

	it('Floating Label Input emits a change on value change', () => {
		const v = new VeeValidate.Validator();

		const wrapper = shallowMount(FloatingLabelInput, {
			localVue,
			provide: () => ({
				$validator: v,
			}),
			propsData: {
				label: '',
				type: '',
				autofocus: '',
				fieldName: 'test',
			},
		});

		wrapper.vm.inputValue = 'test';
		expect(wrapper.emitted().input.length).toBe(1);
	});

	it('Floating Label password reveal', () => {
		const v = new VeeValidate.Validator();

		const wrapper = mount(FloatingLabelInput, {
			localVue,
			provide: () => ({
				$validator: v,
			}),
			propsData: {
				label: '',
				type: 'password',
				autofocus: '',
				fieldName: 'test',
				reveal: true,
			},
		});

		wrapper.setData({ show: true });

		expect(wrapper.findAll('.fa-eye').length).toBe(1);

		wrapper.vm.revealText();

		expect(wrapper.findAll('.fa-eye-slash').length).toBe(1);

		wrapper.vm.revealText();

		expect(wrapper.findAll('.fa-eye').length).toBe(1);
	});
});
