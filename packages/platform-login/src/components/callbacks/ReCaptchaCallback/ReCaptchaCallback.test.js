import { shallowMount } from '@vue/test-utils';
import ReCaptchaCallback from '@/components/callbacks/ReCaptchaCallback';
import i18n from '@/i18n';

describe('ReCaptchaCallback.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(ReCaptchaCallback, {
      i18n,
      stubs: {
        'router-link': true,
      },
      propsData: {
        callback: {
          getSiteKey: () => {},
        },
      },
    });
  });

  it('Load ReCaptchaCallback component', () => {
    expect(wrapper.name()).toEqual('ReCaptchaCallback');
  });
});
