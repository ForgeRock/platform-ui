/* eslint no-unused-expressions: 0 */
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Sinon from 'sinon';
import VeeValidate from 'vee-validate';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import _ from 'lodash';
import i18n from '@/i18n';
import PolicyPasswordInput from '@/components/utils/PolicyPasswordInput';

PolicyPasswordInput.created = Sinon.stub();

describe('PasswordPolicyInput.vue', () => {
	Vue.use(BootstrapVue);
	Vue.use(VeeValidate, { inject: false, fastExit: false });

	const v = new VeeValidate.Validator();

	describe('proper render', () => {
		const wrapper = shallowMount(PolicyPasswordInput, {
			i18n,
			provide: () => ({
				$validator: v,
			}),
			propsData: { policyApi: 'reset' },
		});

		it('should load the page', () => {
			expect(wrapper.name()).to.equal('PolicyPasswordInput');
		});
	});

	describe('#isPasswordPolicyItem', () => {
		const wrapper = shallowMount(PolicyPasswordInput, {
			i18n,
			provide: () => ({
				$validator: v,
			}),
			propsData: { policyApi: 'reset' },
		});

		it('Should return true for items that match "password" and then items that do not match "password" ', () => {
			let policyDefinition = { name: '/user/password' };


			let policyFailureDefinition = { property: '/user/password' };

			expect(wrapper.vm.isPasswordPolicyItem('name', policyDefinition)).to.equal(true);
			expect(wrapper.vm.isPasswordPolicyItem('property', policyFailureDefinition)).to.equal(true);

			policyDefinition = { name: '/user/_id' };
			policyFailureDefinition = { property: '/user/_id' };

			expect(wrapper.vm.isPasswordPolicyItem('name', policyDefinition)).to.equal(false);
			expect(wrapper.vm.isPasswordPolicyItem('property', policyFailureDefinition)).to.equal(false);
		});
	});

	describe('#toSimplePolicyObject', () => {
		const wrapper = shallowMount(PolicyPasswordInput, {
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

			expect(simplePolicyObj).to.be.an('object');
			expect(simplePolicyObj).to.have.property('name').that.equals('AT_LEAST_X_NUMBERS');
			expect(simplePolicyObj).to.have.property('params').that.deep.equals({ numNums: 1 });
		});

		it('should return an empty list for not well defined policy definitions', () => {
			const policyDefinition = {
				policyId: 'at-least-X-numbers',
				params: { numNums: 1 },
			};


			const simplePolicyObj = wrapper.vm.toSimplePolicyObject(policyDefinition);

			expect(simplePolicyObj).to.be.an('object').that.is.empty;
		});
	});

	describe('#toPolicyNames', () => {
		const wrapper = shallowMount(PolicyPasswordInput, {
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

			expect(wrapper.vm.toPolicyNames(failedPolicySet)).to.deep.equal(['AT_LEAST_X_NUMBERS']);
			expect(wrapper.vm.toPolicyNames({})).to.deep.equal([]);
		});
	});

	describe('#makeExclusions', () => {
		const wrapper = shallowMount(PolicyPasswordInput, {
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

			expect(unexcludedPolicies).to.deep.equal([{ policyRequirements: ['MIN_LENGTH'] }]);
		});

		it('should remove policies specified as {name<String>, predicate<Function>} in "exclude" prop', () => {
			wrapper.setProps({
				exclude: [{
					name: 'REQUIRED',
					predicate: n => _.includes(n, 'MIN_LENGTH'),
				}],
			});

			const unexcludedPolicies = wrapper.vm.makeExclusions(policyRequirementSet).policies;

			expect(unexcludedPolicies).to.deep.equal([{ policyRequirements: ['MIN_LENGTH'] }]);
		});
	});
});
