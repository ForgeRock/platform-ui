/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ListOrganizer from './index';

describe('ListOrganizer Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(ListOrganizer, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        value: [
          {
            key: 1,
            label: 1,
            enabled: true,
          },
          {
            key: 2,
            label: 2,
            enabled: true,
          },
          {
            key: 3,
            label: 3,
            enabled: true,
          },
        ],
      },
    });
  });

  it('has a list of fields for each element in value prop', () => {
    const wrapperArray = wrapper.findAll('frfield-stub');

    expect(wrapperArray.at(0).attributes('label')).toBe('1');
    expect(wrapperArray.at(1).attributes('label')).toBe('2');
    expect(wrapperArray.at(2).attributes('label')).toBe('3');
  });

  it('has checkboxes checked for fields that are enabled', () => {
    const wrapperArray = wrapper.findAll('frfield-stub');

    expect(wrapperArray.at(0).attributes('value')).toBe('true');
    expect(wrapperArray.at(1).attributes('value')).toBe('true');
    expect(wrapperArray.at(2).attributes('value')).toBe('true');
  });

  it('has checkboxes unchecked for fields that are disabled', async () => {
    await wrapper.setProps({
      value: [
        {
          key: 1,
          label: 1,
          enabled: true,
        },
        {
          key: 2,
          label: 2,
          enabled: false,
        },
        {
          key: 3,
          label: 3,
          enabled: true,
        },
      ],
    });
    const wrapperArray = wrapper.findAll('frfield-stub');

    expect(wrapperArray.at(0).attributes('value')).toBe('true');
    expect(wrapperArray.at(1).attributes('value')).toBe(undefined);
    expect(wrapperArray.at(2).attributes('value')).toBe('true');
  });

  it('resetList() reverts list to orignal prop value', () => {
    expect(wrapper.vm.list[0].enabled).toBe(true);
    expect(wrapper.vm.list[1].enabled).toBe(true);
    expect(wrapper.vm.list[1].enabled).toBe(true);

    wrapper.vm.list = [
      {
        key: 1,
        label: 1,
        enabled: false,
      },
      {
        key: 2,
        label: 2,
        enabled: false,
      },
      {
        key: 3,
        label: 3,
        enabled: false,
      },
    ];

    expect(wrapper.vm.list[0].enabled).toBe(false);
    expect(wrapper.vm.list[1].enabled).toBe(false);
    expect(wrapper.vm.list[1].enabled).toBe(false);

    wrapper.vm.resetList();

    expect(wrapper.vm.list[0].enabled).toBe(true);
    expect(wrapper.vm.list[1].enabled).toBe(true);
    expect(wrapper.vm.list[1].enabled).toBe(true);
  });

  it('applyChanges() emits an input event with the current list values', () => {
    wrapper.vm.applyChanges();

    expect(wrapper.emitted()['list-reordered'][0]).toEqual([[
      {
        key: 1,
        label: 1,
        enabled: true,
      },
      {
        key: 2,
        label: 2,
        enabled: true,
      },
      {
        key: 3,
        label: 3,
        enabled: true,
      },
    ]]);

    wrapper.vm.list = [
      {
        key: 1,
        label: 1,
        enabled: false,
      },
      {
        key: 2,
        label: 2,
        enabled: false,
      },
      {
        key: 3,
        label: 3,
        enabled: false,
      },
    ];

    wrapper.vm.applyChanges();

    expect(wrapper.emitted()['list-reordered'][1]).toEqual([[
      {
        key: 1,
        label: 1,
        enabled: false,
      },
      {
        key: 2,
        label: 2,
        enabled: false,
      },
      {
        key: 3,
        label: 3,
        enabled: false,
      },
    ]]);
  });
});
