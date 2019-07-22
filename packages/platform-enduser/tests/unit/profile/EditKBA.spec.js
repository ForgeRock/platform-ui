import _ from 'lodash';
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';
import EditKBA from '@/components/profile/EditKBA';
import i18n from '@/i18n';

describe('EditKBA.vue', () => {
  let sandbox = null;

  Vue.use(BootstrapVue);

  beforeEach(() => {
    sandbox = Sinon.createSandbox();

    sandbox.stub(EditKBA, 'mounted').callsFake(() => {
      _.noop();
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('AccountSecurity page loaded', () => {
    const wrapper = shallowMount(EditKBA, {
      i18n,
    });

    expect(wrapper.name()).to.equal('EditKBA');
  });

  describe('#generatePatch', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(EditKBA, {
        i18n,
      });
    });

    it('should correctly generate patches for custom questions', () => {
      wrapper.setData({ selected: [{ custom: 'test', answer: 'test answer' }] });

      const patch = wrapper.vm.generatePatch();

      expect(patch).to.be.an('Array');
      expect(patch.length).to.equal(1);
      expect(_.first(patch)).to.be.an('Object').with.property('value').that.deep.equals([{ answer: 'test answer', customQuestion: 'test' }]);
    });

    it('should correctly generate patches for provided questions', () => {
      wrapper.setData({ selected: [{ selected: 'test', answer: 'test answer' }] });

      const patch = wrapper.vm.generatePatch();

      expect(patch).to.be.an('Array');
      expect(patch.length).to.equal(1);
      expect(_.first(patch)).to.be.an('Object').with.property('value').that.deep.equals([{ answer: 'test answer', questionId: 'test' }]);
    });
  });
});
