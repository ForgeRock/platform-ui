/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import ReportSettingsAssignViewersForm from './ReportSettingsAssignViewersForm';
import i18n from '@/i18n';
import * as ManagedResourceApi from '../../../api/ManagedResourceApi';

describe('ReportSettingsAssignViewersForm', () => {
  let showErrorMessage;
  function setup(props = {}) {
    ({ showErrorMessage } = mockNotification());
    return mount(ReportSettingsAssignViewersForm, {
      global: {
        plugins: [i18n],
      },
      props,
    });
  }

  it('should load form correctly', async () => {
    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            _id: '1',
            sn: 'Doe',
            givenName: 'John',
            profileImage: 'image',
            userName: 'johndoe',
          },
          {
            _id: '2',
            sn: 'Doe',
            givenName: 'Jane',
            profileImage: 'image',
            userName: 'janedoe',
          },
          {
            _id: '3',
            sn: 'Doe',
            givenName: 'Jack',
            profileImage: 'image',
            userName: 'jackdoe',
          },
        ],
      },
    });

    const wrapper = setup();
    await flushPromises();

    const viewersMultiselect = wrapper.find('[role="listbox"]');
    const viewersOptions = viewersMultiselect.findAll('[role="option"]');

    expect(viewersOptions).toHaveLength(3);
    expect(viewersOptions[0].text()).toBe('John Doejohndoe');
    expect(viewersOptions[1].text()).toBe('Jane Doejanedoe');
    expect(viewersOptions[2].text()).toBe('Jack Doejackdoe');

    const groupCheckbox = wrapper.find('[name="reportViewer"]');
    expect(groupCheckbox.element.checked).toBe(false);
  });

  it('should load correctly data from prop', async () => {
    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            _id: '1',
            sn: 'Doe',
            givenName: 'John',
            profileImage: 'image',
            userName: 'johndoe',
          },
          {
            _id: '2',
            sn: 'Doe',
            givenName: 'Jane',
            profileImage: 'image',
            userName: 'janedoe',
          },
          {
            _id: '3',
            sn: 'Doe',
            givenName: 'Jack',
            profileImage: 'image',
            userName: 'jackdoe',
          },
        ],
      },
    });
    ManagedResourceApi.getManagedResource = jest.fn().mockResolvedValueOnce({
      data: {
        _id: '1',
        sn: 'Doe',
        givenName: 'John',
        profileImage: 'image',
        userName: 'johndoe',
      },
    }).mockResolvedValueOnce({
      data: {
        _id: '2',
        sn: 'Doe',
        givenName: 'Jane',
        profileImage: 'image',
        userName: 'janedoe',
      },
    });

    const wrapper = setup({ 'model-value': ['1', '2', 'report_viewer'] });
    await flushPromises();

    const viewersMultiselect = wrapper.find('[role="listbox"]');
    const viewersOptions = viewersMultiselect.findAll('[role="option"]');
    expect(viewersOptions.length).toBe(1);
    expect(viewersOptions[0].text()).toContain('Jack Doe');

    const selectedUsers = wrapper.findAll('.multiselect__tag');
    expect(selectedUsers.length).toBe(2);
    expect(selectedUsers[0].text()).toContain('John Doe');
    expect(selectedUsers[1].text()).toContain('Jane Doe');

    const groupCheckbox = wrapper.find('[name="reportViewer"]');
    expect(groupCheckbox.element.checked).toBe(true);
  });

  it('should emit the correct value when a viewer is selected', async () => {
    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            _id: '1',
            sn: 'Doe',
            givenName: 'John',
            profileImage: 'image',
            userName: 'johndoe',
          },
          {
            _id: '2',
            sn: 'Doe',
            givenName: 'Jane',
            profileImage: 'image',
            userName: 'janedoe',
          },
          {
            _id: '3',
            sn: 'Doe',
            givenName: 'Jack',
            profileImage: 'image',
            userName: 'jackdoe',
          },
        ],
      },
    });

    const wrapper = setup();
    await flushPromises();

    const viewersMultiselect = wrapper.find('[role="listbox"]');
    const viewersOptions = viewersMultiselect.findAll('[role="option"] .multiselect__option');
    await viewersOptions[0].trigger('click');
    await viewersOptions[0].trigger('click');

    expect(wrapper.emitted('update:modelValue')).toHaveLength(3);
    expect(wrapper.emitted('update:modelValue')[0][0]).toStrictEqual([]);
    expect(wrapper.emitted('update:modelValue')[1][0]).toStrictEqual(['1']);
    expect(wrapper.emitted('update:modelValue')[2][0]).toStrictEqual(['1', '2']);
  });

  it('should emit the correct value when the group checkbox is selected', async () => {
    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            _id: '1',
            sn: 'Doe',
            givenName: 'John',
            profileImage: 'image',
            userName: 'johndoe',
          },
          {
            _id: '2',
            sn: 'Doe',
            givenName: 'Jane',
            profileImage: 'image',
            userName: 'janedoe',
          },
          {
            _id: '3',
            sn: 'Doe',
            givenName: 'Jack',
            profileImage: 'image',
            userName: 'jackdoe',
          },
        ],
      },
    });

    const wrapper = setup();
    await flushPromises();

    const groupCheckbox = wrapper.find('[name="reportViewer"]');
    await groupCheckbox.setChecked(true);

    expect(wrapper.emitted('update:modelValue')).toHaveLength(2);
    expect(wrapper.emitted('update:modelValue')[0][0]).toStrictEqual([]);
    expect(wrapper.emitted('update:modelValue')[1][0]).toStrictEqual(['report_viewer']);
  });

  it('should emit the correct value when a viewer is selected and the group checkbox is selected', async () => {
    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            _id: '1',
            sn: 'Doe',
            givenName: 'John',
            profileImage: 'image',
            userName: 'johndoe',
          },
          {
            _id: '2',
            sn: 'Doe',
            givenName: 'Jane',
            profileImage: 'image',
            userName: 'janedoe',
          },
          {
            _id: '3',
            sn: 'Doe',
            givenName: 'Jack',
            profileImage: 'image',
            userName: 'jackdoe',
          },
        ],
      },
    });

    const wrapper = setup();
    await flushPromises();

    const viewersMultiselect = wrapper.find('[role="listbox"]');
    const viewersOptions = viewersMultiselect.findAll('[role="option"] .multiselect__option');
    await viewersOptions[0].trigger('click');
    await viewersOptions[0].trigger('click');

    const groupCheckbox = wrapper.find('[name="reportViewer"]');
    await groupCheckbox.setChecked(true);

    expect(wrapper.emitted('update:modelValue')).toHaveLength(4);
    expect(wrapper.emitted('update:modelValue')[0][0]).toStrictEqual([]);
    expect(wrapper.emitted('update:modelValue')[1][0]).toStrictEqual(['1']);
    expect(wrapper.emitted('update:modelValue')[2][0]).toStrictEqual(['1', '2']);
    expect(wrapper.emitted('update:modelValue')[3][0]).toStrictEqual(['report_viewer', '1', '2']);
  });

  it('should show error when load viewers fails', async () => {
    const error = new Error('error');
    ManagedResourceApi.getManagedResourceList = jest.fn().mockRejectedValue(error);

    const wrapper = setup();
    await flushPromises();

    expect(showErrorMessage).toHaveBeenCalledWith(error, 'There was an error retrieving users Who Can Run');

    const viewersMultiselect = wrapper.find('[role="listbox"]');
    const viewersOptions = viewersMultiselect.findAll('[role="option"]');
    expect(viewersOptions).toHaveLength(0);

    const selectedUsers = viewersMultiselect.findAll('.multiselect__tag');
    expect(selectedUsers.length).toBe(0);
  });

  it('should show error when load selected viewers fails', async () => {
    const errorResponse = {
      response: {
        status: 500,
      },
    };
    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            _id: '1',
            sn: 'Doe',
            givenName: 'John',
            profileImage: 'image',
            userName: 'johndoe',
          },
          {
            _id: '2',
            sn: 'Doe',
            givenName: 'Jane',
            profileImage: 'image',
            userName: 'janedoe',
          },
          {
            _id: '3',
            sn: 'Doe',
            givenName: 'Jack',
            profileImage: 'image',
            userName: 'jackdoe',
          },
        ],
      },
    });
    ManagedResourceApi.getManagedResource = jest.fn().mockRejectedValue(errorResponse);

    const wrapper = setup({ 'model-value': ['1', '2', 'report_viewer'] });
    await flushPromises();

    expect(showErrorMessage).toHaveBeenCalledWith(errorResponse, 'There was an error retrieving users Who Can Run');

    const viewersMultiselect = wrapper.find('[role="listbox"]');
    const viewersOptions = viewersMultiselect.findAll('[role="option"]');
    expect(viewersOptions).toHaveLength(0);

    const selectedUsers = viewersMultiselect.findAll('.multiselect__tag');
    expect(selectedUsers.length).toBe(0);
  });

  it('should search for users when search input changes', async () => {
    jest.useFakeTimers();
    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValueOnce({
      data: {
        result: [
          {
            _id: '1',
            sn: 'Doe',
            givenName: 'John',
            profileImage: 'image',
            userName: 'johndoe',
          },
          {
            _id: '2',
            sn: 'Doe',
            givenName: 'Jane',
            profileImage: 'image',
            userName: 'janedoe',
          },
          {
            _id: '3',
            sn: 'Doe',
            givenName: 'Jack',
            profileImage: 'image',
            userName: 'jackdoe',
          },
        ],
      },
    }).mockResolvedValueOnce({
      data: {
        result: [
          {
            _id: '3',
            sn: 'Doe',
            givenName: 'Jack',
            profileImage: 'image',
            userName: 'jackdoe',
          },
        ],
      },
    });

    const wrapper = setup();
    await flushPromises();

    const searchInput = wrapper.find('input[name="data-allowed-viewers"]');
    await searchInput.setValue('Jack');
    jest.runAllTimers();
    await flushPromises();

    const viewersMultiselect = wrapper.find('[role="listbox"]');
    const viewersOptions = viewersMultiselect.findAll('[role="option"]');
    expect(viewersOptions).toHaveLength(1);
    jest.useRealTimers();
  });
});
