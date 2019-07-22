import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import sinon from 'sinon';
import i18n from '@/i18n';
import Process from '@/components/dashboard/widgets/workflow/Process';

describe('Workflow Process Component', () => {
  Vue.use(BootstrapVue);

  describe('mount', () => {
    const wrapper = shallowMount(Process, {
      i18n,
      propsData: { processDefinition: { _id: 'test', name: 'Test process', formGenerationTemplate: '{name: "test", template: "<div>hello</div>"}' } },
    });

    it('should have the correct name', () => {
      expect(wrapper.name()).to.equal('WorkflowProcess');
    });

    it('should have the correct initial data', () => {
      expect(wrapper.vm.startForm).to.be.an('object').and.to.have.property('name').that.equals('test');
    });
  });

  describe('#cancel', () => {
    const wrapper = shallowMount(Process, {
      i18n,
      propsData: { processDefinition: { _id: 'test', name: 'Test process', formGenerationTemplate: '{name: "test", template: "<div>hello</div>"}' } },
    });

    const resetSpy = sinon.spy();

    wrapper.setMethods({ reset: resetSpy });
    wrapper.vm.cancel();

    it('should call #reset', () => {
      expect(resetSpy.called).to.equal(true);
    });

    it('should emit "cancel" with the process id', () => {
            expect(wrapper.emitted().cancel).to.be.ok; // eslint-disable-line
      expect(wrapper.emitted().cancel[0]).to.deep.equal(['test']);
    });
  });

  describe('#submit', () => {
    const wrapper = shallowMount(Process, {
      i18n,
      propsData: { processDefinition: { _id: 'test', name: 'Test process', formGenerationTemplate: '{name: "test", template: "<div>hello</div>"}' } },
    });

    wrapper.vm.submit({ test: 'test' });

    it('should emit "startProcess" with the passed payload', () => {
            expect(wrapper.emitted().startProcess).to.be.ok; // eslint-disable-line
      expect(wrapper.emitted().startProcess[0]).to.deep.equal([{ test: 'test' }]);
    });
  });

  describe('#restForm', () => {
    const wrapper = shallowMount(Process, {
      i18n,
      propsData: {
        processDefinition: { _id: 'test', name: 'Test process', formGenerationTemplate: '{name: "test", template: "<div>hello</div>"}' },
      },
    });


    const childResetFormSpy = sinon.spy();

    wrapper.vm.$refs.startFormComponent = { resetForm: childResetFormSpy };
    wrapper.vm.reset();

    it('should call #resetForm on child component', () => {
            expect(childResetFormSpy.called).to.be.ok // eslint-disable-line
    });
  });
});
