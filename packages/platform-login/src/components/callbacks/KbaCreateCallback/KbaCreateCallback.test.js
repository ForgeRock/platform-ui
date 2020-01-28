/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import KbaCreateCallback from '@/components/callbacks/KbaCreateCallback';
import i18n from '@/i18n';

KbaCreateCallback.mounted = jest.fn();

describe('KbaCreateCallback.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(KbaCreateCallback, {
      i18n,
      stubs: {
        'router-link': true,
        mounted: true,
      },
      propsData: {
        callback: {
          getPredefinedQuestions: () => {},
          getPrompt: () => {},
        },
        // Does not currently work
        callbackSubmitButton: document.createElement('button'),
      },
    });
  });

  it('Load KbaCreateCallback component', () => {
    expect(wrapper.name()).toEqual('KbaCreateCallback');
  });
});
