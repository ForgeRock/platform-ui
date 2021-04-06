/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ConsentContainer from '@/components/callbacks/ConsentMappingCallback';
import i18n from '@/i18n';

describe('ConsentMappingCallback', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(ConsentContainer, {
      i18n,
      propsData: {
        callbacks: [{
          getOutputByName: (type) => {
            switch (type) {
              case 'isRequired':
                return true;
              case 'message':
                return 'Message';
              default:
                return '';
            }
          },
          payload: {
            type: 'ConsentMappingCallback',
          },
          setInputValue: jest.fn(),
        }],
        index: 0,
      },
    });
  });

  it('Loads ConsentMappingCallback component', () => {
    expect(wrapper.name()).toEqual('ConsentContainer');
  });

  it('Sets options data and emits "disable-next-button"', () => {
    expect(wrapper.vm.$data.isRequired).toBe(true);
    expect(wrapper.vm.$data.checked).toBe(false);
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([true, 0]);
  });

  it('Responds to consent click', async () => {
    const consentItemsCheckbox = wrapper.find('[data-testid=consent-mapping-checkbox]');

    consentItemsCheckbox.trigger('click');

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$data.checked).toBe(true);
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([false, 0]);
    expect(wrapper.emitted()['did-consent'].pop()).toEqual([true]);
  });
});
