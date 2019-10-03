import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';
import Login from '@/views/Login';
import i18n from '@/i18n';

describe('Login.vue', () => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = Sinon.createSandbox();

    sandbox.stub(Login, 'mounted').callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Load login component', () => {
    const wrapper = shallowMount(Login, {
      i18n,
      stubs: {
        'router-link': true,
      },
    });

    expect(wrapper.name()).to.equal('Login');
  });
});
