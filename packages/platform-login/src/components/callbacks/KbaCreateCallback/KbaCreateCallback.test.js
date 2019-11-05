import { shallowMount } from '@vue/test-utils';
import KbaCreateCallback from '@/components/callbacks/KbaCreateCallback';
import i18n from '@/i18n';

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
        callbackSubmitButton: HTMLButtonElement.prototype,
      },
    });
  });

  it('Load KbaCreateCallback component', () => {
    expect(wrapper.name()).toEqual('KbaCreateCallback');
  });
});
