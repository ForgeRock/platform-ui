import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';
import i18n from '@/i18n';
import OAuthReturn from '@/components/OAuthReturn';

describe('OAuthReturn.vue', () => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = Sinon.createSandbox();
    sandbox.stub(OAuthReturn, 'created').callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('OAuth Return loaded', () => {
    const wrapper = shallowMount(OAuthReturn, {
      i18n,
    });

    expect(wrapper.name()).to.equal('OAuthReturn');
  });
});
