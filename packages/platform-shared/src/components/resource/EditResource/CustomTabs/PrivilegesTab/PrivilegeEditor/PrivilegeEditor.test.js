/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import PrivilegeEditor from './index';

describe('PrivilegeEditor.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(PrivilegeEditor, {
      global: {
        mocks: {
          $t: (key) => key,
          $store: {
            state: {
              realm: 'test',
            },
          },
        },
        plugins: [Notifications],
      },
      props: {
        privilege: {
          accessFlags: [],
          permissions: ['CREATE'],
          filter: 'privilegeFilter',
          attribute: 'testPropertyName',
        },
        identityObjectSchema: {
          properties: {
            accountStatus: {
              default: 'active',
              description: 'Status',
              isPersonal: false,
              searchable: true,
              title: 'Status',
              type: 'string',
              usageDescription: '',
              userEditable: false,
            },
          },
          order: [
            'accountStatus',
          ],
        },
      },
    });

    wrapper.setData({
      uniqueNames: ['one', 'two'],
      privilegeName: 'three',
    });
  });
  afterEach(() => {
    wrapper.unmount();
  });

  it('checks for unique names', () => {
    expect(wrapper.vm.error).toBe(false);

    wrapper.setData({
      uniqueNames: ['one', 'two'],
      privilegeName: 'two',
    });
    expect(wrapper.vm.error).toBe(true);
  });

  it('sets permissions based on privileges', () => {
    expect(wrapper.vm.permissions).toStrictEqual([{
      view: false,
      create: true,
      update: false,
      delete: false,
      _showDetails: true,
    }]);
  });

  it('sets up privilege name validation', () => {
    expect(wrapper.vm.privilegeNameValidation).toStrictEqual(
      { required: true, unique: ['one', 'two'] },
    );
  });

  it('toggles filter', () => {
    expect(wrapper.vm.privilege.filter).toBe('privilegeFilter');
    wrapper.vm.toggleFilter(true);
    expect(wrapper.vm.filterOn).toBeTruthy();
    wrapper.vm.toggleFilter(false);
    expect(wrapper.vm.privilege.filter).toBe(undefined);
    expect(wrapper.vm.filterOn).toBeFalsy();
  });

  it('toggles permission', () => {
    wrapper.setProps({
      privilege: {
        accessFlags: [{
          attribute: 'accountStatus',
          readOnly: false,
        }],
        permissions: ['CREATE'],
        filter: 'privilegeFilter',
      },
    });
    wrapper.vm.togglePermission('create');
    expect(wrapper.vm.privilege.permissions).toStrictEqual([]);
  });

  it('changes query filter', () => {
    expect(wrapper.vm.privilege.filter).toBe('privilegeFilter');
    wrapper.vm.queryFilterChange('queryFilterString');
    expect(wrapper.vm.privilege.filter).toBe('queryFilterString');
  });

  it('removes access flags', () => {
    expect(wrapper.vm.privilege.accessFlags).toStrictEqual([{
      attribute: 'accountStatus',
      readOnly: true,
    }]);
    wrapper.vm.removeAccessFlag('accountStatus');
    expect(wrapper.vm.privilege.accessFlags).toStrictEqual([]);

    wrapper.setProps({
      privilege: {
        accessFlags: [{
          attribute: 'accountStatus',
          readOnly: false,
        }],
        permissions: ['CREATE'],
        filter: 'privilegeFilter',
      },
    });
    wrapper.vm.removeAllAccessFlags();
    expect(wrapper.vm.privilege.accessFlags).toStrictEqual([]);
  });
});
