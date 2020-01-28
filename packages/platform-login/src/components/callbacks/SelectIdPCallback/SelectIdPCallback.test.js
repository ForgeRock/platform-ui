/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import SelectIdPCallback from '@/components/callbacks/SelectIdPCallback';
import i18n from '@/i18n';

SelectIdPCallback.mounted = jest.fn();

describe('SelectIdPCallback.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(SelectIdPCallback, {
      i18n,
      stubs: {
        'router-link': true,
      },
      propsData: {
        callback: {
          getOutputByName: () => {},
        },
        // Does not currently work
        callbackSubmitButton: document.createElement('button'),
      },
    });
  });

  it('Load SelectIdPCallback component', () => {
    expect(wrapper.name()).toEqual('SelectIdPCallback');
  });
});
