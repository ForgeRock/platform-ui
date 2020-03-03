/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import KeyValueList from './index';

describe('KeyValueList', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(KeyValueList, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        schema: {
          properties: {},
        },
      },
    });
  });

  it('Key Value successfully loaded', () => {
    expect(wrapper.name()).toEqual('KeyValueList');
  });

  it('Saves new key value pair', () => {
    wrapper.setData({
      keyValues: {
        en: 'value',
      },
      currentKey: '',
    });

    wrapper.vm.saveKeyValue({ key: 'fr', value: 'frValue' });

    expect(wrapper.emitted()).toEqual({
      input: [
        [
          {
            en: 'value',
            fr: 'frValue',
          },
        ],
      ],
    });
  });

  it('Edits existing value when key is left the same', () => {
    wrapper.setData({
      keyValues: {
        en: 'value',
      },
      currentKey: 'en',
    });

    wrapper.vm.saveKeyValue({ key: 'en', value: 'enValue' });

    expect(wrapper.emitted()).toEqual({
      input: [
        [
          {
            en: 'enValue',
          },
        ],
      ],
    });
  });

  it('Edits existing key when key is changed', () => {
    wrapper.setData({
      keyValues: {
        en: 'value',
      },
      currentKey: 'en',
    });

    wrapper.vm.saveKeyValue({ key: 'fr', value: 'frValue' });

    expect(wrapper.emitted()).toEqual({
      input: [
        [
          {
            fr: 'frValue',
          },
        ],
      ],
    });
  });
});
