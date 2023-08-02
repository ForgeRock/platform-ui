/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import PrivilegesTab from './index';
import * as SchemaApi from '@/api/SchemaApi';

describe('PrivilegesTab', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(PrivilegesTab, {
      mocks: {
        $t: () => {},
        $store: {
          state: {
            UserStore: {
              adminUser: true,
            },
          },
        },
      },
      propsData: {
        privilegesField: {
          value: [{
            name: 'testValue',
            filter: '',
          }],
        },
        resourceName: 'resourceName',
      },
    });

    jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve({
      data: {
        result: [{
          resourceCollection: 'test',
          properties: {
            test: 'testProperties',
          },
          _id: 'testId',
        }],
        order: [
          'test',
          'test2',
        ],
        title: 'testTitle',
        properties: {
          test: {
            value: 'test',
            viewable: true,
            type: 'object',
            title: 'testTitle',
            propName: 'testPropName',
            order: [
              'innerTest',
            ],
            properties: {
              innerTest: {},
            },
            isTemporalConstraint: true,
          },
          test2: {
            value: 'test2',
            type: 'string',
            title: 'test2Title',
            propName: 'test2PropName',
            viewable: true,
            isTemporalConstraint: false,
            isConditional: true,
          },
        },
      },
    }));
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        patch: () => Promise.resolve({
          data: {
            DELETE: {
              allowed: true,
              properties: [
                'test',
              ],
            },
            VIEW: {
              allowed: true,
              properties: [
                'test',
              ],
            },
            UPDATE: {
              allowed: true,
              properties: [
              ],
            },
          },
        }),
        post: () => Promise.resolve({
          data: [{
            privilegePath: 'test',
          }],
        }),
      }
    ));
    wrapper.setData({
      privilegeToEdit: {
        filter: 'testFilter',
        accessFlags: [],
      },
      newPrivileges: [{
        filter: 'testNewFilter',
        accessFlags: [],
        name: 'testNewName',
      }],
    });

    wrapper.vm.$refs = {
      addPrivilegesModal: {
        hide: () => {},
      },
      editPrivilegeModal: {
        hide: () => {},
        show: () => {},
      },
      removePrivilege: {
        hide: () => {},
        show: () => {},
      },
    };
  });

  it('updates privilege', () => {
    expect(wrapper.vm.privilegeToEdit).toStrictEqual({
      accessFlags: [],
      filter: 'testFilter',
    });
    wrapper.vm.updatePrivilege('testValue');
    expect(wrapper.vm.privilegeToEdit).toBe('testValue');
  });

  it('saves privilege', async () => {
    const notificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
    const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
    jest.spyOn(wrapper.vm.$refs.editPrivilegeModal, 'hide');
    await wrapper.vm.savePrivilege();
    expect(showErrorMessageSpy).toHaveBeenCalled();
    wrapper.setData({
      privilegeToEdit: {
        filter: 'testFilter',
        accessFlags: ['test'],
        name: 'testName',
      },
    });
    await wrapper.vm.savePrivilege();
    expect(notificationSpy).toHaveBeenCalled();
    expect(wrapper.vm.newPrivileges).toStrictEqual([]);
    expect(wrapper.vm.privileges[0]).toEqual({ name: 'testValue' });
  });

  it('saves new privileges', async () => {
    const notificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
    const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
    await wrapper.vm.saveNewPrivileges();
    expect(showErrorMessageSpy).toHaveBeenCalled();
    wrapper.vm.newPrivileges.accessFlags = ['test'];
    await wrapper.vm.saveNewPrivileges();
    expect(notificationSpy).toHaveBeenCalled();
    expect(wrapper.vm.newPrivileges[0]).toStrictEqual({
      accessFlags: [],
      filter: 'testNewFilter',
      name: 'testNewName',
    });
    expect(wrapper.vm.privileges[0]).toEqual({
      filter: '',
      name: 'testValue',
    });

    wrapper.setProps({
      privilegesField: {
        value: null,
      },
    });
    await wrapper.vm.saveNewPrivileges();
    expect(wrapper.vm.clonedPrivilegesField.value).toStrictEqual([]);
  });

  it('shows error when failing to get schema', async () => {
    wrapper = shallowMount(PrivilegesTab, {
      mocks: {
        $t: () => {},
        $store: {
          state: {
            UserStore: {
              adminUser: false,
            },
          },
        },
      },
      propsData: {
        privilegesField: {
          value: [{
            name: 'testValue',
            filter: '',
          }],
        },
        resourceName: 'resourceName',
      },
    });
  });

  it('sets edit names', () => {
    expect(wrapper.vm.editNames).toStrictEqual(['testValue']);
    wrapper.vm.editIndex = 0;
    expect(wrapper.vm.editNames).toStrictEqual(['']);
  });

  it('shows edit & confirm remove modal', () => {
    const showEditPrivilegeSpy = jest.spyOn(wrapper.vm.$refs.editPrivilegeModal, 'show');
    const showRemovePrivilegeSpy = jest.spyOn(wrapper.vm.$refs.removePrivilege, 'show');
    wrapper.vm.showEditModal({}, 1);
    expect(wrapper.vm.editIndex).toBe(1);
    expect(showEditPrivilegeSpy).toHaveBeenCalled();

    wrapper.vm.confirmRemovePrivilege(2);
    expect(wrapper.vm.editIndex).toBe(2);
    expect(showRemovePrivilegeSpy).toHaveBeenCalled();
  });

  it('hides confirm remove modal', () => {
    const hideRemovePrivilegeSpy = jest.spyOn(wrapper.vm.$refs.removePrivilege, 'hide');

    wrapper.vm.removePrivilege();
    expect(hideRemovePrivilegeSpy).toHaveBeenCalled();
  });

  it('capitalizes permissions', () => {
    expect(wrapper.vm.capitalizePermission('permission')).toBe('Permission');
  });
});
