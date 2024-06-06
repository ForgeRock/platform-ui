/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import AddPrivileges from './index';

describe('AddPrivileges.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(AddPrivileges, {
      global: {
        mocks: {
          $t: (key) => key,
          $store: {
            state: {
              realm: 'test',
            },
          },
        },
      },
      props: {
        schemaMap: {
          schema1: {
            title: 'schema1Title',
            'mat-icon': 'hand',
          },
        },
      },
    });
  });
  afterEach(() => {
    wrapper.unmount();
  });

  it('adds new privilege', () => {
    wrapper.vm.identityObjectField.value = 'schema1';
    wrapper.vm.addNewPrivilege();
    expect(wrapper.vm.newPrivileges).toStrictEqual([{
      path: 'schema1',
      name: 'schema1Titles',
      actions: [],
      filter: '',
      permissions: ['VIEW'],
      accessFlags: [],
    }]);
  });

  it('removes new privilege', () => {
    wrapper.vm.identityObjectField.value = 'schema1';
    wrapper.vm.addNewPrivilege();
    wrapper.vm.removeNewPrivilege(0);
    expect(wrapper.vm.newPrivileges).toStrictEqual([]);
  });
});
