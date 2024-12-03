/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { Form as VeeForm } from 'vee-validate';
import ScriptEditor from './index';

describe('ScriptEditor', () => {
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
