/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import TermsAndConditionsCallback from '@/components/callbacks/TermsAndConditionsCallback';
import i18n from '@/i18n';

describe('TermsAndConditionsCallback.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(TermsAndConditionsCallback, {
      i18n,
      stubs: {
        'router-link': true,
      },
      propsData: {
        callback: {
          getTerms: () => {},
          setInputValue: () => {},
        },
      },
    });
  });

  it('Load Terms and Conditions component', () => {
    expect(wrapper.name()).toEqual('TermsAndConditions');
  });
});
