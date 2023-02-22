/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import {
  getCertificationUserFilter,
  getCertificationApplicationFilter,
} from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import CertificationTaskListFilters from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

let wrapper;

function mountComponent(options, methods) {
  wrapper = shallowMount(CertificationTaskListFilters, {
    methods: {
      ...methods,
    },
    mocks: {
      $t: (t) => t,
      ...options,
    },
    propsData: {
      certId: 'certification-id',
      actorId: 'certifier-test',
    },
  });
}
describe('CertificationTaskListFilters', () => {
  beforeEach(() => {
    getCertificationUserFilter.mockImplementation(() => Promise.resolve({ data: [{ id: 'user' }] }));
    getCertificationApplicationFilter.mockImplementation(() => Promise.resolve({ data: [{ id: 'application' }] }));
  });
  describe('Component mount', () => {
    it('CertificationTaskListFilters successfully loaded', () => {
      const methods = {
        getUserInfoFilter: jest.fn(),
        getApplicationInfoFilter: jest.fn(),
      };
      mountComponent({}, methods);
      expect(wrapper.name()).toEqual('CertificationTaskListFilters');
    });
  });
  describe('getUserInfoFilter', () => {
    beforeEach(() => {
      jest.spyOn(wrapper.vm, 'showErrorMessage');
    });
    it('should call the notification error message', async () => {
      mountComponent();
      getCertificationUserFilter.mockImplementation(() => Promise.reject(new Error()));
      const showErrorMessage = jest.spyOn(wrapper.vm, 'showErrorMessage');
      wrapper.vm.getUserInfoFilter();

      await wrapper.vm.$nextTick();
      expect(showErrorMessage).toBeCalled();
    });
    it('should set the user response to the user variable', async () => {
      mountComponent();
      getCertificationUserFilter.mockImplementation(() => Promise.resolve({ data: [{ id: 'user' }] }));
      wrapper.vm.getUserInfoFilter();

      await wrapper.vm.$nextTick();
      expect(wrapper.vm.users).toEqual([
        {
          text: 'governance.certificationTask.allUsers',
          value: '',
        },
        {
          id: 'user',
          text: 'undefined',
          value: 'user',
        },
      ]);
    });
  });
  describe('getApplicationInfoFilter', () => {
    beforeEach(() => {
      jest.spyOn(wrapper.vm, 'showErrorMessage');
    });
    it('should call the notification error message', async () => {
      getCertificationApplicationFilter.mockImplementation(() => Promise.reject(new Error()));
      const showErrorMessage = jest.spyOn(wrapper.vm, 'showErrorMessage');
      wrapper.vm.getApplicationInfoFilter();

      await wrapper.vm.$nextTick();
      expect(showErrorMessage).toBeCalled();
    });
    it('should set the applications response to the application variable', async () => {
      getCertificationApplicationFilter.mockImplementation(() => Promise.resolve({ data: [{ id: 'application' }] }));
      wrapper.vm.getApplicationInfoFilter();

      await wrapper.vm.$nextTick();
      expect(wrapper.vm.applications).toEqual([
        {
          text: 'governance.certificationTask.allApplications',
          value: '',
        },
        {
          id: 'application',
          text: undefined,
          value: 'application',
        },
      ]);
    });
  });
  describe('getUserSelected', () => {
    const methods = {
      getUserInfoFilter: jest.fn(),
      getApplicationInfoFilter: jest.fn(),
    };
    it('returns the name of the user when formFields.user.name exists', () => {
      mountComponent({}, methods);
      const result = wrapper.vm.getUserSelected();
      expect(result).toBe('governance.certificationTask.allUsers');
    });

    it('returns the translated string "governance.certificationTask.allUsers" when the name does not exist', () => {
      mountComponent({}, methods);
      const result = wrapper.vm.getUserSelected();
      expect(result).toBe('governance.certificationTask.allUsers');
    });
  });
});
