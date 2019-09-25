import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';
import KbaCreateCallback from '@/components/callbacks/KbaCreateCallback';
import i18n from '@/i18n';

describe('KbaCreateCallback.vue', () => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = Sinon.createSandbox();

    sandbox.stub(KbaCreateCallback, 'mounted').callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Load KbaCreateCallback component', () => {
    const wrapper = shallowMount(KbaCreateCallback, {
      i18n,
      stubs: {
        'router-link': true,
      },
    });

    expect(wrapper.name()).to.equal('KbaCreateCallback');
  });
});
