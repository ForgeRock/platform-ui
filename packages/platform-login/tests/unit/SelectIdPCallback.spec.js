import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';
import SelectIdPCallback from '@/components/callbacks/SelectIdPCallback';
import i18n from '@/i18n';

describe('SelectIdPCallback.vue', () => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = Sinon.createSandbox();
    sandbox.stub(SelectIdPCallback, 'mounted').callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Load SelectIdPCallback component', () => {
    const wrapper = shallowMount(SelectIdPCallback, {
      i18n,
      stubs: {
        'router-link': true,
      },
    });

    expect(wrapper.name()).to.equal('SelectIdPCallback');
  });
});
