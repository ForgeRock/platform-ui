/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, shallowMount } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import GovResourceMultiselect from './GovResourceMultiselect';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

describe('GovResourceMultiselect', () => {
  let wrapper;
  function mountComponent(props) {
    return shallowMount(GovResourceMultiselect, {
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
      props: {
        description: 'testDescription',
        label: 'testLabel',
        name: 'testName',
        ...props,
      },
    });
  }

  // Simulate the API response for initial values
  const initialData = [
    { name: 'App 1', id: 'app1' },
    { name: 'App 2', id: 'app2' },
  ];
  CommonsApi.getResource.mockImplementation((arg1, arg2) => {
    let returnValue = initialData;
    if (arg2.queryString === 'app3') returnValue = [{ name: 'App 3', id: 'app3' }];
    return Promise.resolve({ data: { result: returnValue } });
  });

  it('emits the input event when the value changes', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const input = wrapper.findComponent('[name="testName"]');

    await input.vm.$emit('input', ['app1']);
    await flushPromises();

    expect(wrapper.emitted('input')).toBeTruthy();
    expect(wrapper.emitted('input')[0][0]).toEqual(['app1']);
  });

  it('fetches initial values when props.value is not empty', async () => {
    wrapper = mountComponent({ value: ['app3'] });
    await flushPromises();

    const options = wrapper.vm.selectOptions;
    expect(options).toEqual([
      { text: 'App 3', value: 'app3' },
      { text: 'App 1', value: 'app1' },
      { text: 'App 2', value: 'app2' },
    ]);
  });

  it('uses preloadedOptions to skip getInitialValues when all refs are pre-resolved', async () => {
    const preloaded = [
      { text: 'App 1', value: 'app1' },
      { text: 'App 2', value: 'app2' },
    ];
    const resourceSpy = jest.spyOn(CommonsApi, 'getResource');
    const callCountBefore = resourceSpy.mock.calls.length;

    wrapper = mountComponent({
      value: ['app1', 'app2'],
      preloadedOptions: preloaded,
    });
    await flushPromises();

    // Only the search-options call should have fired, not one per pre-existing ref
    const searchOnlyCalls = resourceSpy.mock.calls.slice(callCountBefore);
    expect(searchOnlyCalls.length).toBe(1);
    expect(wrapper.vm.selectOptions).toEqual(expect.arrayContaining(preloaded));
  });

  it('falls back to getInitialValues when preloadedOptions is empty', async () => {
    wrapper = mountComponent({ value: ['app3'], preloadedOptions: [] });
    await flushPromises();

    const options = wrapper.vm.selectOptions;
    expect(options).toEqual(expect.arrayContaining([{ text: 'App 3', value: 'app3' }]));
  });

  it('retrieves options when the customQuery changes', async () => {
    const resourceSpy = jest.spyOn(CommonsApi, 'getResource');
    wrapper = mountComponent({
      queryParamFunction: (query, resource, bool, customQuery) => `queryFilter=${customQuery}`,
    });
    await flushPromises();
    expect(resourceSpy).toHaveBeenCalledWith('application', 'queryFilter=');
    expect(resourceSpy).not.toHaveBeenCalledWith('application', 'queryFilter=a basic filter');

    wrapper.setProps({ customQuery: 'a basic filter' });
    await flushPromises();
    expect(resourceSpy).toHaveBeenCalledWith('application', 'queryFilter=a basic filter');
  });
});
