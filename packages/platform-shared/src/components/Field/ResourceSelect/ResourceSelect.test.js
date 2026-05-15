/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as managedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import FrMultiselectBase from '@forgerock/platform-shared/src/components/MultiselectBase/MultiselectBase';
import i18n from '@/i18n';
import ResourceSelect from './index';

const mockReturnValue = Promise.resolve({
  data: {
    result: [
      {
        givenName: 'first',
        sn: 'last',
        userName: 'userName',
      },
    ],
  },
});

describe('ResourceSelect', () => {
  const defaultProps = {
    resourcePath: 'alpha_user',
    fields: ['givenName', 'sn', 'userName'],
  };

  function mountComponent(props) {
    setupTestPinia();
    return mount(ResourceSelect, {
      global: {
        plugins: [i18n],
        mocks: {
          $store: {
            state: {
              SharedStore: { uiConfig: {}, managedObjectMinimumUIFilterLength: 3 },
            },
          },
        },
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
  }

  describe('@renders', () => {
    it('renders component', () => {
      managedResourceApi.getManagedResourceList = jest.fn().mockReturnValue(mockReturnValue);
      const wrapper = mountComponent();

      // ResourceSelect passes a #singleLabel slot, so inputHasComboboxRole=false and
      // role="combobox" is on the wrapper <div>, not the <input>
      const combobox = wrapper.find('[role="combobox"]');
      expect(combobox.attributes('aria-expanded')).toBe('false');
      expect(combobox.attributes('aria-labelledby')).toBe('floatingLabelInput5-label');
    });
  });

  describe('@actions', () => {
    it('when open, should have aria-expanded attribute', async () => {
      managedResourceApi.getManagedResourceList = jest.fn().mockReturnValue(mockReturnValue);
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper.find('.multiselect').trigger('click');
      await flushPromises();
      expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('true');
    });
  });

  it('ResourceSelect does not emit input if value is provided at init', async () => {
    managedResourceApi.getManagedResourceList = jest.fn().mockReturnValue(mockReturnValue);
    const wrapper = mountComponent({ value: { name: 'test' } });
    await flushPromises();

    expect(wrapper.emitted().input).toBeUndefined();
  });

  it('ResourceSelect emits input if value is not provided at init', async () => {
    managedResourceApi.getManagedResourceList = jest.fn().mockReturnValue(mockReturnValue);
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.emitted().input[0]).toEqual([{
      givenName: 'first',
      sn: 'last',
      userName: 'userName',
    }]);
  });

  it('searches when input is entered', async () => {
    jest.useFakeTimers();
    const wrapper = mountComponent();
    await flushPromises();

    const getListSpy = jest.spyOn(managedResourceApi, 'getManagedResourceList').mockReturnValue(mockReturnValue);

    // Emit search-change on the MultiselectBase component (not the input element)
    const multiselect = wrapper.findComponent(FrMultiselectBase);
    multiselect.vm.$emit('search-change', 'testFilter');
    jest.runAllTimers();

    expect(getListSpy).toHaveBeenCalledWith('alpha_user', {
      fields: 'givenName,sn,userName',
      pageSize: 10,
      queryFilter: '/givenName sw "testFilter" or /sn sw "testFilter" or /userName sw "testFilter"',
      sortKeys: 'givenName',
    });
    jest.useRealTimers();
  });
});
