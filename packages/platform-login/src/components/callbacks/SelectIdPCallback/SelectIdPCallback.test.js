import { shallowMount } from '@vue/test-utils';
import SelectIdPCallback from '@/components/callbacks/SelectIdPCallback';
import i18n from '@/i18n';

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
        callbackSubmitButton: HTMLButtonElement.prototype,
      },
    });
  });

  it('Load SelectIdPCallback component', () => {
    expect(wrapper.name()).toEqual('SelectIdPCallback');
  });
});
