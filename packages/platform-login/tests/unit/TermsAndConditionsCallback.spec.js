import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';
import TermsAndConditionsCallback from '@/components/callbacks/TermsAndConditionsCallback';
import i18n from '@/i18n';

describe('TermsAndConditionsCallback.vue', () => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = Sinon.createSandbox();

    sandbox.stub(TermsAndConditionsCallback, 'mounted').callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Load Terms and Conditions component', () => {
    const wrapper = shallowMount(TermsAndConditionsCallback, {
      i18n,
      stubs: {
        'router-link': true,
      },
    });

    expect(wrapper.name()).to.equal('TermsAndConditions');
  });
});
