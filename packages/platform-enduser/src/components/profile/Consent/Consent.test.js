import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import _ from 'lodash';
import Consent from '@/components/profile/Consent';
import i18n from '@/i18n';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

Consent.created = jest.fn();

describe('Profile Consent Component', () => {
	const date = new Date().toISOString();
	const consentableMappings = [
		{ name: 'test' },
		{ name: 'test2' },
	];

	let wrapper;

	beforeEach(() => {
		wrapper = shallowMount(Consent, {
			localVue,
			i18n,
			propsData: {
				consentedMappings: [{ mapping: 'test', consentDate: date }],
			},
		});
	});

	afterEach(() => {
		wrapper = undefined;
	});
	describe('Consent.vue', () => {
		it('Consent page loaded', () => {
			expect(wrapper.name()).toBe('Consent');
			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('computed#mappings', () => {
		it('should return the mappings that are populated with user data', () => {
			wrapper.setData({ consentableMappings });

			const { mappings } = wrapper.vm;
			const test = _.find(mappings, { name: 'test' });
			const test2 = _.find(mappings, { name: 'test2' });

			expect(Array.isArray(mappings)).toBe(true);
			expect(mappings.length).toBe(2);
			expect(test).toHaveProperty('consented');
			expect(test.consented).toBe(true);
			expect(test).toHaveProperty('consentDate');
			expect(test.consentDate).toBe(date);
			expect(test2).toHaveProperty('consented');
			expect(test2.consented).toBe(false);
			expect(test2).not.toHaveProperty('consentDate');
		});
	});

	describe('#toggleConsentAndHideModal', () => {
		it('should call #toggleConsent and #hideModal', () => {
			const hideSpy = jest.spyOn(wrapper.vm, 'hideModal');
			const toggleSpy = jest.spyOn(wrapper.vm, 'toggleConsent');

			wrapper.vm.$refs = { test: [{ hide: jest.fn() }] };
			wrapper.vm.toggleConsentAndHideModal({ name: 'test' });

			expect(hideSpy).toBeCalled();
			expect(toggleSpy).toBeCalled();
		});
	});

	describe('#generatePatch', () => {
		it('should generate an "add" patch given an unconsented mapping', () => {
			const mapping = {
				name: 'test',
				consented: false,
			};

			const patch = wrapper.vm.generatePatch(mapping);
			const addOp = _.first(patch);

			expect(typeof patch).toBe('object');
			expect(typeof addOp).toBe('object');
			expect(addOp).toHaveProperty('field');
			expect(addOp.field).toBe('/consentedMappings/-');
			expect(addOp).toHaveProperty('operation');
			expect(addOp.operation).toBe('add');
			expect(typeof addOp).toBe('object');
			expect(addOp.value).toHaveProperty('mapping');
			expect(addOp.value.mapping).toBe('test');
			expect(typeof addOp.value).toBe('object');
		});

		it('should generate a "remove" patch given a consented mapping', () => {
			const mapping = {
				name: 'test',
				consented: true,
				consentDate: new Date().toISOString(),
			};


			const patch = wrapper.vm.generatePatch(mapping);


			const addOp = _.first(patch);

			expect(typeof patch).toBe('object');
			expect(typeof addOp).toBe('object');
			expect(addOp).toHaveProperty('field');
			expect(addOp.field).toBe('/consentedMappings');
			expect(addOp).toHaveProperty('operation');
			expect(addOp.operation).toBe('remove');
			expect(typeof addOp).toBe('object');
			expect(addOp.value).toHaveProperty('mapping');
			expect(addOp.value.mapping).toBe('test');
			expect(typeof addOp.value).toBe('object');
			expect(addOp.value.consentDate).toBe(mapping.consentDate);
		});
	});

	describe('#toggleConsent', () => {
		it('should emit "updateProfile"', () => {
			wrapper.setMethods({ generatePatch: jest.fn() });
			wrapper.vm.toggleConsent();

			expect(wrapper.emitted().updateProfile.length).toBe(1);
		});
	});
});
