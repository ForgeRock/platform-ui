/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ScriptEditor from './index';

describe('ScriptEditor', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(ScriptEditor, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        closeModal: () => {},
      },
      mounted: () => {},
    });

    wrapper.vm.$refs = {
      validationObserver: {
        validate: () => {},
      },
    };
  });

  it('script editor sets values given as props into component', () => {
    expect(wrapper.name()).toEqual('ScriptEditor');

    expect(wrapper.vm.scriptType.value).toEqual('javascript');
    expect(wrapper.vm.value.globals).toEqual({});
    expect(wrapper.vm.value.source).toEqual('');
    expect(wrapper.vm.code).toEqual('');
    expect(wrapper.vm.value.file).toEqual(undefined);

    wrapper.setData({
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
    expect(wrapper.vm.selectedVariables[0].value.value).toEqual('"test"');
    expect(wrapper.vm.selectedVariables[2].value.value).toEqual('{\n  "second": [\n    "object1",\n    "object2"\n  ],\n  "third": "object3"\n}');
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

  it('removes file and sets source and script type', () => {
    expect(wrapper.vm.value.file).toEqual(undefined);

    wrapper.setData({
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
    wrapper.vm.onFileChange({
      target: {
        files: [
          file,
        ],
      },
    });

    expect(wrapper.vm.scriptType.value).toEqual('javascript');
    expect(wrapper.vm.value.file).toEqual(undefined);
  });
});
