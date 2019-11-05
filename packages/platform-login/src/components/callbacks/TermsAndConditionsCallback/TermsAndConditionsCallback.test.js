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
