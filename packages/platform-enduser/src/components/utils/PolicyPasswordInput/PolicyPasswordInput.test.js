/* eslint no-unused-expressions: 0 */
import BootstrapVue from 'bootstrap-vue';
import VeeValidate from 'vee-validate';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import _ from 'lodash';
import i18n from '@/i18n';
import PolicyPasswordInput from '@/components/utils/PolicyPasswordInput';

PolicyPasswordInput.created = jest.fn();

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(VeeValidate, { inject: false, fastExit: false });

describe('PasswordPolicyInput.vue', () => {
	const v = new VeeValidate.Validator();

	describe('proper render', () => {
		const wrapper = shallowMount(PolicyPasswordInput, {
			localVue,
			sync: false,
			i18n,
			provide: () => ({
				$validator: v,
			}),
			propsData: { policyApi: 'reset' },
		});

		it('should load the page', () => {
			expect(wrapper.name()).toBe('PolicyPasswordInput');
			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('#isPasswordPolicyItem', () => {
		const wrapper = shallowMount(PolicyPasswordInput, {
			localVue,
			sync: false,
			i18n,
			provide: () => ({
				$validator: v,
			}),
			propsData: { policyApi: 'reset' },
		});

		it('Should return true for items that match "password" and then items that do not match "password" ', () => {
			let policyDefinition = { name: '/user/password' };


			let policyFailureDefinition = { property: '/user/password' };

			expect(wrapper.vm.isPasswordPolicyItem('name', policyDefinition)).toEqual(true);
			expect(wrapper.vm.isPasswordPolicyItem('property', policyFailureDefinition)).toEqual(true);

			policyDefinition = { name: '/user/_id' };
			policyFailureDefinition = { property: '/user/_id' };

			expect(wrapper.vm.isPasswordPolicyItem('name', policyDefinition)).toEqual(false);
			expect(wrapper.vm.isPasswordPolicyItem('property', policyFailureDefinition)).toEqual(false);
		});
	});

	describe('#toSimplePolicyObject', () => {
		const wrapper = shallowMount(PolicyPasswordInput, {
			localVue,
			sync: false,
			i18n,
			provide: () => ({
				$validator: v,
			}),
			propsData: { policyApi: 'reset' },
		});

		it('should turn Policy Definition objcets into an object {name<String>, params<Object>}', () => {
			const policyDefinition = {
				policyId: 'at-least-X-numbers',
				params: { numNums: 1 },
				policyRequirements: ['AT_LEAST_X_NUMBERS'],
			};


			const simplePolicyObj = wrapper.vm.toSimplePolicyObject(policyDefinition);

			expect(simplePolicyObj).toHaveProperty('name');
			expect(simplePolicyObj.name).toEqual('AT_LEAST_X_NUMBERS');
			expect(simplePolicyObj).toHaveProperty('params');
			expect(simplePolicyObj.params).toEqual({ numNums: 1 });
		});

		it('should return an empty list for not well defined policy definitions', () => {
			const policyDefinition = {
				policyId: 'at-least-X-numbers',
				params: { numNums: 1 },
			};


			const simplePolicyObj = wrapper.vm.toSimplePolicyObject(policyDefinition);

			expect(simplePolicyObj).toEqual({});
		});
	});

	describe('#toPolicyNames', () => {
		const wrapper = shallowMount(PolicyPasswordInput, {
			localVue,
			sync: false,
			i18n,
			provide: () => ({
				$validator: v,
			}),
			propsData: { policyApi: 'reset' },
		});

		it('should only return the name of a failed password property and fail on badly formed input', () => {
			const failedPolicySet = {
				failedPolicyRequirements: [
					{
						policyRequirements: [{
							params: { numNums: 1 },
							policyRequirement: 'AT_LEAST_X_NUMBERS',
						}],
						property: '/user/password',
					},
					{
						policyRequirements: [{
							policyRequirement: 'REQUIRED',
						}],
						property: '/user/mail',
					},
				],
			};

			expect(wrapper.vm.toPolicyNames(failedPolicySet)).toEqual(['AT_LEAST_X_NUMBERS']);
			expect(wrapper.vm.toPolicyNames({})).toEqual([]);
		});
	});

	describe('#makeExclusions', () => {
		const wrapper = shallowMount(PolicyPasswordInput, {
			localVue,
			sync: false,
			i18n,
			provide: () => ({
				$validator: v,
			}),
			propsData: { policyApi: 'reset' },
		});


		const policyRequirementSet = {
			policyRequirements: [
				'REQUIRED',
				'MIN_LENGTH',
			],
			policies: [
				{
					policyRequirements: [
						'REQUIRED',
					],
				},
				{
					policyRequirements: [
						'MIN_LENGTH',
					],
				},
			],
		};

		it('should remove policies with strings specified in "exclude" prop', () => {
			wrapper.setProps({ exclude: ['REQUIRED'] });
			const unexcludedPolicies = wrapper.vm.makeExclusions(policyRequirementSet).policies;

			expect(unexcludedPolicies).toEqual([{ policyRequirements: ['MIN_LENGTH'] }]);
		});

		it('should remove policies specified as {name<String>, predicate<Function>} in "exclude" prop', () => {
			wrapper.setProps({
				exclude: [{
					name: 'REQUIRED',
					predicate: n => _.includes(n, 'MIN_LENGTH'),
				}],
			});

			const unexcludedPolicies = wrapper.vm.makeExclusions(policyRequirementSet).policies;

			expect(unexcludedPolicies).toEqual([{ policyRequirements: ['MIN_LENGTH'] }]);
		});
	});
});
