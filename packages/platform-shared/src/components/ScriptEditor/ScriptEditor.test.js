/**
 * Copyright (c) 2020-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, mount } from '@vue/test-utils';
import { defineRule, Form as VeeForm } from 'vee-validate';
import { required } from '@vee-validate/rules';
import { PrismEditor as VuePrismEditor } from 'vue-prism-editor';
import { findByName, findByText, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';

import ScriptEditor from './index';

defineRule('required', () => required);

describe('ScriptEditor Component', () => {
  describe('@a11y', () => {
    it('ScriptEditor should be accessible in its default state', async () => {
      const wrapper = mount(ScriptEditor, {
        global: {
          mocks: {
            $t: (msg) => msg,
            $store: {
              state: {
                isFraas: false,
              },
            },
          },
          stubs: {
            VeeForm,
          },
        },
        props: {
          closeModal: () => {},
          // Added props for accessibility test
          switchLabel: 'Switch Label',
        },
      });
      jest.runAllTimersAsync();
      // Add label for accessibility test
      const label = document.createElement('label');
      label.setAttribute('id', 'floatingLabelInput5-label');
      label.textContent = 'Script Editor';
      wrapper.element.appendChild(label);
      await runA11yTest(wrapper);
    });
  });

  describe('Component tests', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(ScriptEditor, {
        global: {
          mocks: {
            $t: () => {},
            $store: {
              state: {
                isFraas: false,
              },
            },
          },
          stubs: {
            VeeForm,
          },
        },
        props: {
          closeModal: () => {},
        },
        mounted: () => {},
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('script editor sets values given as props into component', async () => {
      expect(wrapper.vm.scriptType.value).toEqual('text/javascript');
      expect(wrapper.vm.value.globals).toEqual({});
      expect(wrapper.vm.value.source).toEqual('');
      expect(wrapper.vm.code).toEqual(undefined);
      expect(wrapper.vm.value.file).toEqual(undefined);

      await wrapper.setProps({
        value: {
          type: 'groovy',
          globals: {
            string_test: 'test',
            array_test: ['array1', { second: ['array2'], third: 'array3' }],
            object_test: { second: ['object1', 'object2'], third: 'object3' },
            boolean_test: true,
            number_test: 3,
          },
          file: '/file/path.js',
        },
      });

      wrapper.vm.setPropValues(wrapper.vm.value);
      expect(wrapper.vm.scriptType.value).toEqual('groovy');
      expect(wrapper.vm.selectedVariables[0].name).toEqual('string_test');
      expect(wrapper.vm.selectedVariables[0].value.value).toEqual('test');
      expect(wrapper.vm.selectedVariables[2].value.value).toEqual({ second: ['object1', 'object2'], third: 'object3' });
      expect(wrapper.vm.value.file).toEqual('/file/path.js');
    });

    it('adds variables where specified', () => {
      expect(wrapper.vm.value.globals).toEqual({});

      wrapper.vm.addVariable('newName1', 'newValue1', 0);
      expect(wrapper.vm.selectedVariables[0].name).toEqual('newName1');
      wrapper.vm.addVariable('newName2', 'newValue2', 0);
      expect(wrapper.vm.selectedVariables[0].name).toEqual('newName2');
      wrapper.vm.addVariable('newName3', 'newValue3', 2);
      expect(wrapper.vm.selectedVariables[2].name).toEqual('newName3');
    });

    it('removes variables where specified', () => {
      expect(wrapper.vm.value.globals).toEqual({});

      wrapper.vm.addVariable('newName1', 'newValue1', 0);
      wrapper.vm.addVariable('newName2', 'newValue2', 1);
      wrapper.vm.removeVariable(0);
      expect(wrapper.vm.selectedVariables[0].name).toEqual('newName2');
    });

    it('removes file and sets source and script type', async () => {
      expect(wrapper.vm.value.file).toEqual(undefined);

      await wrapper.setProps({
        value: {
          type: 'groovy',
          globals: {
            string_test: 'test',
            array_test: ['array1', { second: ['array2'], third: 'array3' }],
            object_test: { second: ['object1', 'object2'], third: 'object3' },
            boolean_test: true,
            number_test: 3,
          },
          file: '/file/path.js',
        },
      });
      wrapper.vm.setPropValues(wrapper.vm.value);
      expect(wrapper.vm.scriptType.value).toEqual('groovy');
      expect(wrapper.vm.value.file).toEqual('/file/path.js');
      const file = new File(['text'], 'test.js');
      expect(wrapper.vm.fileChanged).toEqual(false);
      wrapper.vm.onFileChange({
        target: {
          files: [
            file,
          ],
        },
      });

      expect(wrapper.vm.scriptType.value).toEqual('text/javascript');
      expect(wrapper.vm.fileChanged).toEqual(true);
    });

    it('removes variables container when showVariables is false', async () => {
      await wrapper.setProps({ showVariables: false });
      expect(wrapper.find('.fr-script-editor-vars').exists()).toBe(false);
    });
  });

  describe('ScriptEditor Emits correct events', () => {
    let wrapper;
    jest.useFakeTimers();
    beforeEach(() => {
      wrapper = mount(ScriptEditor, {
        global: {
          plugins: [i18n],
          mocks: {
            $t: () => {},
            $store: { state: { isFraas: false } },
          },
        },
        props: { closeModal: () => {} },
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });

    async function setupEditor() {
      const addButton = findByText(wrapper, 'button', 'add');
      expect(addButton.exists()).toBe(true);
      await addButton.trigger('click');

      await wrapper.vm.$nextTick();

      const nameField = findByName(wrapper, 'Name-0');
      const valueField = findByName(wrapper, 'Value-0');

      expect(nameField.exists()).toBe(true);
      expect(valueField.exists()).toBe(true);

      await nameField.setValue('var1');
      await valueField.setValue('11');
      await wrapper.vm.$nextTick();
    }

    it('emits correct script object when user adds variables', async () => {
      await setupEditor();
      jest.runAllTimers();
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('input')).toBeTruthy();

      const emitted = wrapper.emitted('input').at(-1)[0];
      expect(emitted.type).toBe('text/javascript');

      expect(emitted.globals).toEqual({ var1: 11 });
    });

    it('emits disableSave true when invalid JSON is entered in the JSON editor', async () => {
      await setupEditor();

      // Toggle JSON editor ON via UI
      const toggle = findByName(wrapper, 'JSON');
      await toggle.setChecked(true);
      await wrapper.vm.$nextTick();

      const editors = wrapper.findAllComponents(VuePrismEditor);
      const jsonEditor = editors[1]; // get the JSON editor
      expect(jsonEditor.exists()).toBe(true);

      const textarea = jsonEditor.find('textarea');
      await textarea.setValue('{"invalid": }');
      await wrapper.vm.$nextTick();

      jest.runAllTimers();
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('disableSave')).toBeTruthy();
      const emitted = wrapper.emitted('disableSave').at(-1)[0];
      expect(emitted).toBe(true);
    });

    it('emits disableSave false when valid JSON is entered in the JSON editor', async () => {
      await setupEditor();

      // Toggle JSON editor ON via UI
      const toggle = findByName(wrapper, 'JSON');
      await toggle.setChecked(true);
      await wrapper.vm.$nextTick();

      const editors = wrapper.findAllComponents(VuePrismEditor);
      const jsonEditor = editors[1]; // get the JSON editor
      expect(jsonEditor.exists()).toBe(true);

      const textarea = jsonEditor.find('textarea');
      await textarea.setValue('{"valid": "11" }');
      await wrapper.vm.$nextTick();

      jest.runAllTimers();

      expect(wrapper.emitted('disableSave')).toBeTruthy();
      const emitted = wrapper.emitted('disableSave').at(-1)[0];
      expect(emitted).toBe(false);
    });

    it('emits disableSave false when user provides code snippet in the code editor', async () => {
      await setupEditor();

      const editors = wrapper.findAllComponents(VuePrismEditor);
      const codeEditor = editors[0]; // get the Code editor
      expect(codeEditor.exists()).toBe(true);

      const textarea = codeEditor.find('textarea');
      await textarea.setValue('console.log("Hello, World!");');
      await wrapper.vm.$nextTick();

      jest.runAllTimers();

      expect(wrapper.emitted('disableSave')).toBeTruthy();
      const emitted = wrapper.emitted('disableSave').at(-1)[0];
      expect(emitted).toBe(false);
    });
  });
});
