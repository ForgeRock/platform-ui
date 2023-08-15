/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { first } from 'lodash';
import i18n from '@/i18n';
import EditPersonalInfo from './index';
import { findByTestId } from '../../../utils/testHelpers';

describe('EditPersonalInfo', () => {
  const defaultProps = {
    schema: {
      order: ['givenName', 'sn'],
      properties: {
        givenName: {
          description: 'First Name',
          isPersonal: true,
          searchable: true,
          title: 'First Name',
          type: 'string',
          usageDescription: '',
          userEditable: true,
          viewable: true,
        },
        sn: {
          description: 'Last Name',
          isPersonal: true,
          searchable: true,
          title: 'Last Name',
          type: 'string',
          usageDescription: '',
          userEditable: true,
          viewable: true,
        },
      },
      required: ['givenName'],
    },
    profile: { first: 'test', second: 'second' },
    isTesting: true,
  };

  function setup(props) {
    return mount(EditPersonalInfo, {
      i18n,
      mocks: {
        $store: {
          state: {
            UserStore: {
              userId: 'stub-id',
              managedResource: {},
              internalUser: false,
            },
            isFraas: true,
          },
        },
      },
      propsData: {
        ...defaultProps,
        ...props,
      },
    });
  }

  describe('@renders', () => {
    it('renders header', () => {
      const wrapper = setup();
      const title = wrapper.find('h2');
      expect(title.text()).toBe('Edit personal info');
    });

    describe('given no fields', () => {
      it('renders no fields text', () => {
        const wrapper = setup({ schema: {} });
        // Note: must trigger the 'show' event as when we mount the modal manually it doesn't trigger bootstrap @shown event
        wrapper.vm.$root.$emit('bv::show::modal', 'userDetailsModal');

        const noFieldsHeader = findByTestId(wrapper, 'edit-personal-info-no-fields');
        expect(noFieldsHeader.text()).toBe('No profile fields available');
      });
    });

    describe('given form fields', () => {
      it('should render fields', async () => {
        const wrapper = setup();
        // Note: must trigger the 'show' event as when we mount the modal manually it doesn't trigger bootstrap @shown event
        wrapper.vm.$root.$emit('bv::show::modal', 'userDetailsModal');
        await flushPromises();

        const firstField = findByTestId(wrapper, 'input-edit-personal-info-0');
        expect(firstField.exists()).toBeTruthy();

        const secondField = findByTestId(wrapper, 'input-edit-personal-info-1');
        expect(secondField.exists()).toBeTruthy();
      });
    });
  });

  describe('@actions', () => {
    describe('when form is valid', () => {
      it('should save form', async () => {
        const wrapper = setup();
        jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({
          post: () => Promise.resolve({
            data: {
              failedPolicyRequirements: {},
            },
          }),
        }));
        // Note: must trigger the 'show' event as when we mount the modal manually it doesn't trigger bootstrap @shown event
        wrapper.vm.$root.$emit('bv::show::modal', 'userDetailsModal');

        const saveButton = findByTestId(wrapper, 'btn-edit-personal-info-save');
        await saveButton.trigger('click');
      });
    });
  });

  describe('@unit', () => {
    describe('generateFormFields', () => {
      it('should create the proper fields based on schema', () => {
        const wrapper = shallowMount(EditPersonalInfo, {
          i18n,
          propsData: {
            ...defaultProps,
          },
        });
        const formFields = wrapper.vm.generateFormFields();
        const firstFormField = first(formFields);

        expect(formFields.length).toBe(2);
        expect(typeof formFields).toBe('object');
        expect(typeof firstFormField).toBe('object');

        expect(firstFormField).toMatchObject({
          name: 'givenName',
          title: 'First Name',
          value: null,
          type: 'string',
          description: 'First Name',
          items: undefined,
          format: undefined,
          validation: 'required',
        });

        const secondFormField = formFields[1];
        expect(secondFormField).toMatchObject({
          name: 'sn',
          title: 'Last Name (optional)',
          value: null,
          type: 'string',
          description: 'Last Name',
          items: undefined,
          format: undefined,
          validation: '',
        });
      });
    });
  });
});
