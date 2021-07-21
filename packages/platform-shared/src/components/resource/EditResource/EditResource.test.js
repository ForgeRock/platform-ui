/**
 * Copyright (c) 2019-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable import/no-extraneous-dependencies */
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
    meta: {},
    params: {
      resourceName: 'test',
      resourceType: 'test',
      resourceId: 'test',
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
              adminUser: false,
            },
          },
        },
      },
    });
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
    expect(wrapper.vm.buildResourceUrl()).toEqual('test/test/test?_fields=*,manager/*');
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
});
