import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';
import ReCaptchaCallback from '@/components/callbacks/ReCaptchaCallback';
import i18n from '@/i18n';

describe('ReCaptchaCallback.vue', () => {
	let sandbox = null;

	beforeEach(() => {
		sandbox = Sinon.createSandbox();
		sandbox.stub(ReCaptchaCallback, 'mounted').callsFake(() => {});
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Load ReCaptchaCallback component', () => {
		const wrapper = shallowMount(ReCaptchaCallback, {
			i18n,
			stubs: {
				'router-link': true,
			},
		});

		expect(wrapper.name()).to.equal('ReCaptchaCallback');
	});
});
