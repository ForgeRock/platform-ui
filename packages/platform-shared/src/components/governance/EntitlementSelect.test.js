/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as Notification from '@forgerock/platform-shared/src/utils/notification';
import EntitlementSelect from './EntitlementSelect';
import i18n from '@/i18n';

function getEntitlementsResult() {
  return {
    data: {
      result: [
        {
          descriptor: {
            idx: {
              '/entitlement': {
                displayName: 'Test Entitlement',
              },
            },
          },
          entitlement: {
            displayName: 'Test Entitlement',
            id: '12345',
          },
        },
        {
          descriptor: {
            idx: {
              '/entitlement': {
                displayName: 'Test Entitlement 2',
              },
            },
          },
          entitlement: {
            displayName: 'Test Entitlement 2',
            id: '67890',
          },
        },
      ],
      resultCount: 2,
      totalCount: 2,
    },
  };
}

function getEntitlementsResultMore() {
  return {
    data: {
      result: [
        {
          descriptor: {
            idx: {
              '/entitlement': {
                displayName: 'Test Entitlement',
              },
            },
          },
          entitlement: {
            displayName: 'Test Entitlement',
            id: '12345',
          },
        },
        {
          descriptor: {
            idx: {
              '/entitlement': {
                displayName: 'Test Entitlement 2',
              },
            },
          },
          entitlement: {
            displayName: 'Test Entitlement 2',
            id: '67890',
          },
        },
      ],
      resultCount: 2,
      totalCount: 20,
    },
  };
}

function getOneEntitlementsResult() {
  return {
    data: {
      result: [
        {
          descriptor: {
            idx: {
              '/entitlement': {
                displayName: 'Test Entitlement 3',
              },
            },
          },
          entitlement: {
            displayName: 'Test Entitlement 3',
            id: '88888',
          },
        },
      ],
      resultCount: 1,
      totalCount: 1,
    },
  };
}

describe('EntitlementSelect', () => {
  function setup(props = {}) {
    return mount(EntitlementSelect, {
      global: {
        plugins: [i18n],
      },
      props,
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load entitlements from API with current value empty', async () => {
    CommonsApi.searchGovernanceResource = jest.fn().mockReturnValue(Promise.resolve(getEntitlementsResult()));

    const wrapper = setup();
    await flushPromises();

    expect(wrapper.vm.selectOptions).toEqual([
      {
        text: 'Test Entitlement',
        value: 'Test Entitlement',
      },
      {
        text: 'Test Entitlement 2',
        value: 'Test Entitlement 2',
      },
    ]);
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.viewMore).toBe(false);
    expect(wrapper.vm.selectedValue).toBe('');
    expect(wrapper.vm.totalPagedResults).toBe(2);
  });

  it('should display error message if the api call fails', async () => {
    const error = new Error('ERROR');
    CommonsApi.searchGovernanceResource = jest.fn().mockReturnValue(Promise.reject(error));
    const showErrorMessageSpy = jest.spyOn(Notification, 'showErrorMessage');

    const wrapper = setup();
    await flushPromises();

    expect(wrapper.vm.selectOptions).toEqual([]);
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.viewMore).toBe(false);
    expect(wrapper.vm.selectedValue).toBe('');
    expect(wrapper.vm.totalPagedResults).toBe(0);
    expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'Failed to load entitlements');
  });

  it('should load entitlements from API with current not in the list', async () => {
    CommonsApi.searchGovernanceResource = jest.fn()
      .mockReturnValueOnce(Promise.resolve(getEntitlementsResultMore()))
      .mockReturnValueOnce(Promise.resolve(getOneEntitlementsResult()));

    const wrapper = setup({
      'model-value': 'Test Entitlement 3',
    });
    await flushPromises();

    expect(wrapper.vm.selectOptions).toEqual([
      {
        text: 'Test Entitlement 3',
        value: 'Test Entitlement 3',
      },
      {
        text: 'Test Entitlement',
        value: 'Test Entitlement',
      },
      {
        text: 'Test Entitlement 2',
        value: 'Test Entitlement 2',
      },
    ]);
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.viewMore).toBe(true);
    expect(wrapper.vm.selectedValue).toBe('Test Entitlement 3');
    expect(wrapper.vm.totalPagedResults).toBe(3);
  });

  it('should render properly the entitlements in the list', async () => {
    CommonsApi.searchGovernanceResource = jest.fn().mockReturnValue(Promise.resolve(getEntitlementsResult()));

    const wrapper = setup();
    await flushPromises();

    const elements = wrapper.findAll('.multiselect__element');
    expect(elements.length).toBe(2);
    const element1 = elements[0];
    expect(element1.text()).toBe('Test Entitlement');
    const element2 = elements[1];
    expect(element2.text()).toBe('Test Entitlement 2');
    const viewMoreButton = wrapper.find('button');
    expect(viewMoreButton.exists()).toBe(false);
  });

  it('should show more results when view more button is clisked', async () => {
    CommonsApi.searchGovernanceResource = jest.fn()
      .mockReturnValueOnce(Promise.resolve(getEntitlementsResultMore()))
      .mockReturnValueOnce(Promise.resolve({
        data: {
          result: [
            {
              descriptor: {
                idx: {
                  '/entitlement': {
                    displayName: 'Test Entitlement 3',
                  },
                },
              },
              entitlement: {
                displayName: 'Test Entitlement 3',
                id: '88888',
              },
            },
          ],
          resultCount: 18,
          totalCount: 20,
        },
      }));

    const wrapper = setup();
    await flushPromises();

    let viewMoreButton = wrapper.find('button');
    expect(viewMoreButton.exists()).toBe(true);

    await viewMoreButton.trigger('click');
    await flushPromises();

    const elements = wrapper.findAll('.multiselect__element');
    expect(elements.length).toBe(3);
    const element3 = elements[2];
    expect(element3.text()).toBe('Test Entitlement 3');
    viewMoreButton = wrapper.find('button');
    expect(viewMoreButton.exists()).toBe(false);
  });

  it('should emit selected value when selected', async () => {
    CommonsApi.searchGovernanceResource = jest.fn().mockReturnValue(Promise.resolve(getEntitlementsResult()));

    const wrapper = setup();
    await flushPromises();

    const element = wrapper.find('.multiselect__option');
    await element.trigger('click');
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Test Entitlement']);
  });

  it('should search entitlements when input is changed', async () => {
    jest.useFakeTimers();
    CommonsApi.searchGovernanceResource = jest.fn()
      .mockReturnValueOnce(Promise.resolve(getEntitlementsResult()))
      .mockReturnValueOnce(Promise.resolve(getOneEntitlementsResult()));

    const wrapper = setup();
    await flushPromises();

    const input = wrapper.find('input');
    await input.setValue('Test Entitlement 3');
    jest.runAllTimers();
    await flushPromises();

    expect(wrapper.vm.selectOptions).toEqual([
      {
        text: 'Test Entitlement 3',
        value: 'Test Entitlement 3',
      },
    ]);
    expect(wrapper.vm.isLoading).toBe(false);
    jest.useRealTimers();
  });

  it('should not add the entitlement to options if it is already fetched because is the current value', async () => {
    CommonsApi.searchGovernanceResource = jest.fn()
      .mockReturnValueOnce(Promise.resolve(getEntitlementsResultMore()))
      .mockReturnValueOnce(Promise.resolve(getOneEntitlementsResult()))
      .mockReturnValueOnce(Promise.resolve({
        data: {
          result: [
            {
              descriptor: {
                idx: {
                  '/entitlement': {
                    displayName: 'Test Entitlement 3',
                  },
                },
              },
              entitlement: {
                displayName: 'Test Entitlement 3',
                id: '88888',
              },
            },
            {
              descriptor: {
                idx: {
                  '/entitlement': {
                    displayName: 'Test Entitlement 4',
                  },
                },
              },
              entitlement: {
                displayName: 'Test Entitlement 4',
                id: '88888',
              },
            },
          ],
          resultCount: 2,
          totalCount: 20,
        },
      }));

    const wrapper = setup({
      'model-value': 'Test Entitlement 3',
    });
    await flushPromises();

    expect(wrapper.vm.selectOptions).toEqual([
      {
        text: 'Test Entitlement 3',
        value: 'Test Entitlement 3',
      },
      {
        text: 'Test Entitlement',
        value: 'Test Entitlement',
      },
      {
        text: 'Test Entitlement 2',
        value: 'Test Entitlement 2',
      },
    ]);
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('should load correctly when entitlements response is empty', async () => {
    CommonsApi.searchGovernanceResource = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        result: [],
        resultCount: 0,
        totalCount: 0,
      },
    }));

    const wrapper = setup();
    await flushPromises();

    expect(wrapper.vm.selectOptions).toEqual([]);
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.viewMore).toBe(false);
    expect(wrapper.vm.selectedValue).toBe('');
    expect(wrapper.vm.totalPagedResults).toBe(0);
    expect(CommonsApi.searchGovernanceResource).toHaveBeenCalledTimes(1);
  });

  it('should load correctly when entitlements response is empty and current value is selected, this could happen if the entitlement on the filter is deleted', async () => {
    CommonsApi.searchGovernanceResource = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        data: {
          result: [],
          resultCount: 0,
          totalCount: 0,
        },
      }))
      .mockReturnValueOnce(Promise.resolve({
        data: {
          result: [],
          resultCount: 0,
          totalCount: 0,
        },
      }));
    const showErrorMessageSpy = jest.spyOn(Notification, 'showErrorMessage');

    const wrapper = setup({
      'model-value': 'Entitlement name',
    });
    await flushPromises();

    expect(wrapper.vm.selectOptions).toEqual([]);
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.viewMore).toBe(false);
    expect(wrapper.vm.selectedValue).toBe('Entitlement name');
    expect(wrapper.vm.totalPagedResults).toBe(0);
    expect(CommonsApi.searchGovernanceResource).toHaveBeenCalledTimes(2);
    expect(showErrorMessageSpy).toHaveBeenCalledWith(null, 'Entitlement Entitlement name not found');
  });
});
