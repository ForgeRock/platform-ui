/**
 * Copyright (c) 2019-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import * as SessionsApi from '@/api/SessionsApi';
import * as SchemaApi from '@/api/SchemaApi';
import EditResource from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('EditResource.vue', () => {
  const $route = {
    path: '/test',
    meta: {
      listRoute: 'test',
    },
    params: {
      resourceName: 'resourceName',
      resourceType: 'resourceType',
      resourceId: 'resourceId',
    },
  };

  let wrapper;
  beforeEach(() => {
    jest.spyOn(EditResource, 'mounted')
      .mockImplementation(() => { });

    wrapper = shallowMount(EditResource, {
      localVue,
      stubs: {
        'router-link': true,
      },
      mocks: {
        $route,
        $t: () => {},
        $store: {
          state: {
            userId: 'foo',
            UserStore: {
              adminUser: true,
            },
          },
        },
        $router: {
          push: jest.fn(),
        },
      },
      propsData: {
        canClearSessions: true,
      },
    });
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        get: () => Promise.resolve({
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
        delete: () => Promise.resolve({}),
      }
    ));
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

    wrapper.setData({
      id: 'id',
      resourceName: 'resourceName',
      resourceType: 'resourceType',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('EditResource page loaded', () => {
    expect(wrapper.name()).toBe('EditResource');
  });

  it('Format display data', () => {
    wrapper.vm.resourceSchema = {
      icon: 'fa-test',
      order: ['country', 'userName', 'sn', 'email', 'contractor', 'manager'],
      required: ['userName'],
      properties: {
        userName: {
          type: 'string',
          title: 'Username',
          viewable: true,
        },
        sn: {
          type: 'string',
          title: 'Last Name',
          viewable: true,
        },
        email: {
          type: 'string',
          title: 'Email',
          viewable: true,
        },
        contractor: {
          type: 'boolean',
          title: 'Contractor',
          viewable: true,
        },
        country: {
          type: 'string',
          title: 'Country',
          viewable: true,
        },
        manager: {
          type: 'relationship',
          title: 'Manager',
          viewable: true,
        },
      },
    };

    wrapper.vm.resourcePrivilege = {
      UPDATE: {
        allowed: true,
        properties: ['userName', 'contractor', 'sn', 'email', 'manager'],
      },
      DELETE: {
        allowed: true,
      },
      VIEW: {
        allowed: true,
        properties: ['userName', 'country', 'sn', 'email'],
      },
    };

    wrapper.vm.resourceDetails = {
      userName: 'test',
      email: 'test@test.com',
    };

    wrapper.vm.generateDisplay();

    expect(wrapper.vm.icon).toBe('check_box_outline_blank');
    expect(wrapper.vm.formFields.contractor).toBe(false);
    // make sure the view and update properties are merged together and in the correct order
    expect(wrapper.vm.displayProperties.length).toBe(6);
    expect(wrapper.vm.displayProperties[0].key).toBe('country');
    // set relationshipProperties
    wrapper.vm.relationshipProperties = wrapper.vm.getRelationshipProperties(wrapper.vm.resourceSchema, wrapper.vm.resourcePrivilege);
    expect(wrapper.vm.relationshipProperties).toEqual({
      manager: {
        type: 'relationship',
        title: 'Manager',
        key: 'manager',
        propName: 'manager',
        readOnly: false,
        disabled: false,
        value: '',
        viewable: true,
      },
    });
    expect(wrapper.vm.buildResourceUrl()).toEqual('resourceType/resourceName/id?_fields=*,manager/*');
  });

  describe('clearing sessions', () => {
    it('calls the API clearSessions method and displays a notification when clearing sessions is successful', async () => {
      const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
      const clearSpy = jest.spyOn(SessionsApi, 'clearSessions').mockImplementation(() => Promise.resolve());
      const refreshDataSpy = jest.spyOn(wrapper.vm, 'refreshData').mockImplementation(() => {});
      jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve());

      await wrapper.vm.clearSessionsAndCloseModal();

      expect(clearSpy).toHaveBeenCalled();
      expect(displayNotificationSpy).toHaveBeenCalled();
      expect(refreshDataSpy).toHaveBeenCalled();
    });

    it('calls the API clearSessions method and displays an error notification when clearing sessions is not successful', async () => {
      const showErrorSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
      const clearSpy = jest.spyOn(SessionsApi, 'clearSessions').mockImplementation(() => Promise.reject());
      const refreshDataSpy = jest.spyOn(wrapper.vm, 'refreshData').mockImplementation(() => {});
      jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve());

      await wrapper.vm.clearSessionsAndCloseModal();

      expect(clearSpy).toHaveBeenCalled();
      expect(showErrorSpy).toHaveBeenCalled();
      expect(refreshDataSpy).toHaveBeenCalled();
    });
  });

  it('loads data when can clear sessions', async () => {
    jest.spyOn(SessionsApi, 'getSessionInfo').mockImplementation(() => Promise.resolve({
      data: {
        resultCount: 1,
      },
    }));
    wrapper.setProps({
      canClearSessions: true,
    });
    wrapper.vm.isOpenidmAdmin = false;
    await wrapper.vm.refreshData();
    expect(wrapper.vm.resourcePrivilege).toBe(null);
    expect(wrapper.vm.clearSessionsName).toBe('');
  });

  it('loads data when can not clear sessions', async () => {
    jest.spyOn(SessionsApi, 'getSessionInfo').mockImplementation(() => Promise.resolve({
      data: {
        resultCount: 1,
      },
    }));
    wrapper.setProps({
      canClearSessions: false,
    });
    expect(wrapper.vm.clearSessionsName).toBe('');

    await wrapper.vm.loadData();
    expect(wrapper.vm.resourcePrivilege).toBe(null);
  });

  it('gets object type property display properties', () => {
    wrapper.vm.isOpenidmAdmin = false;
    expect(wrapper.vm.getObjectTypeProperyDisplayProperties({
      order: [
        'test1',
      ],
      properties: {
        test1: {
          key: 'test1',
          value: 'test1Value',
          readOnly: true,
        },
        test2: {
          key: 'test2',
          value: 'test2Value',
          readOnly: false,
        },
      },
    })).toStrictEqual([{
      disabled: false,
      key: 'test1',
      readOnly: true,
      value: null,
    }]);
  });

  it('deletes resource', async () => {
    wrapper.vm.$refs = {
      deleteModal: {
        hide: () => {},
      },
    };
    const hideSpy = jest.spyOn(wrapper.vm.$refs.deleteModal, 'hide');
    const notificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
    await wrapper.vm.deleteResource();
    expect(hideSpy).toHaveBeenCalled();
    expect(notificationSpy).toHaveBeenCalledWith('IDMMessages', 'success', undefined);
  });
});
