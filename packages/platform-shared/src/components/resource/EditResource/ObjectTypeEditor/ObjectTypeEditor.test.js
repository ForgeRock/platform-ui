/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ObjectTypeEditor from './index';

describe('ObjectTypeEditor', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(ObjectTypeEditor, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        displayProperties: [
          {
            title: '',
            description: 'description',
            value: 'initialValue',
            key: 'testKey',
          },
        ],
        formFields: {
          testKey: '',
        },
        subPropertyName: 'subPropertyName',
      },
    });
  });

  afterEach(() => {
    wrapper = null;
  });

  it('Object Type Editor successfully loaded', () => {
    expect(wrapper.name()).toEqual('ObjectTypeEditor');
  });

  it('loads data', () => {
    expect(wrapper.vm.clonedDisplayProperties[0].title).toEqual('description');

    wrapper.setProps({
      displayProperties: [
        {
          title: '',
          description: '',
          key: 'testKey',
        },
      ],
    });
    expect(wrapper.vm.clonedDisplayProperties[0].title).toEqual('Test Key');
  });

  it('sets singleton relationship value', () => {
    const field = {
      value: 'initial',
    };
    wrapper.vm.setSingletonRelationshipValue('final', field);
    expect(field.value).toEqual('final');
  });

  it('saves resource', async () => {
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        patch: () => Promise.resolve(),
      }
    ));
    wrapper.vm.$refs = {
      observer: {
        reset: () => {},
        validate: () => true,
        setErrors: () => {},
      },
    };
    await wrapper.vm.saveResource();
    expect(wrapper.vm.oldFormFields.testKey).toBe('initialValue');

    const error400 = { response: { status: 400 } };
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        patch: () => Promise.reject(error400),
      }
    ));
    const resetSpy = jest.spyOn(wrapper.vm.$refs.observer, 'reset');
    const setErrorsSpy = jest.spyOn(wrapper.vm.$refs.observer, 'setErrors');
    jest.spyOn(wrapper.vm, 'findPolicyError').mockImplementation(() => ([
      {
        exists: true,
        field: 'field',
        msg: 'errorMessage',
      },
    ]));
    await wrapper.vm.saveResource();
    expect(resetSpy).toHaveBeenCalled();
    expect(setErrorsSpy).toHaveBeenCalledWith({ field: ['errorMessage'] });
  });

  it('updates field', () => {
    const index = 0;
    const newValue = 'newValue';
    expect(wrapper.vm.clonedDisplayProperties[0].value).toEqual('initialValue');
    wrapper.vm.updateField(index, newValue);
    expect(wrapper.vm.clonedDisplayProperties[0].value).toEqual('newValue');
  });
});
