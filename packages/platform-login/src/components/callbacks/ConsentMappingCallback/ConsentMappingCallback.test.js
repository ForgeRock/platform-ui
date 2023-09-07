/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import ConsentContainer from '@/components/callbacks/ConsentMappingCallback';
import i18n from '@/i18n';

describe('ConsentMappingCallback', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(ConsentContainer, {
      global: {
        plugins: [i18n],
      },
      props: {
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
        index: 1,
      },
    });
  });

  it('Sets options data and emits "disable-next-button"', () => {
    expect(wrapper.vm.$data.isRequired).toBe(true);
    expect(wrapper.vm.$data.checked).toBe(false);
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([true]);
  });

  it('Responds to consent click', async () => {
    const consentItemsCheckbox = wrapper.find('[data-testid=consent-mapping-checkbox]');

    consentItemsCheckbox.setChecked(true);

    await flushPromises();

    expect(wrapper.vm.checked).toBe(true);
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([false]);
    expect(wrapper.emitted()['did-consent'].pop()).toEqual([true]);
  });
});
