/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import AssignViewersModal from './AssignViewersModal';
import i18n from '@/i18n';
import * as ManagedResourceApi from '../../../api/ManagedResourceApi';
import { findByText } from '../../../utils/testHelpers';

describe('AssignViewersModal', () => {
  function setup(props = {}) {
    return mount(AssignViewersModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        ...props,
      },
    });
  }

  it('should set viewers correctly and emit them on save', async () => {
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
        ],
      },
    });

    const wrapper = setup();
    await flushPromises();

    const users = wrapper.findAll('.fr-viewers-multiselect .multiselect__option');
    await users[0].trigger('click');

    const saveButton = wrapper.find('[aria-label="Save"]');
    await saveButton.trigger('click');

    expect(wrapper.emitted('save')).toBeTruthy();
    expect(wrapper.emitted('save')[0][0]).toStrictEqual(['1']);
  });

  it('should set viewers and group correctly and emit them on save', async () => {
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
        ],
      },
    });

    const wrapper = setup();
    await flushPromises();

    const users = wrapper.findAll('.fr-viewers-multiselect .multiselect__option');
    await users[0].trigger('click');
    const groupCheckbox = wrapper.find('input[name="reportViewer"]');
    await groupCheckbox.setChecked();

    const saveButton = wrapper.find('[aria-label="Save"]');
    await saveButton.trigger('click');

    expect(wrapper.emitted('save')).toBeTruthy();
    expect(wrapper.emitted('save')[0][0]).toStrictEqual(['report_viewer', '1']);
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

    const wrapper = setup({ reportViewers: ['1', '2', 'report_viewer'] });
    await flushPromises();

    const users = wrapper.findAll('.fr-viewers-multiselect [role="option"]');
    expect(users.length).toBe(1);
    expect(users[0].text()).toContain('Jack Doe');

    const selectedUsers = wrapper.findAll('.fr-viewers-multiselect .multiselect__tag');
    expect(selectedUsers.length).toBe(2);
    expect(selectedUsers[0].text()).toContain('John Doe');
    expect(selectedUsers[1].text()).toContain('Jane Doe');
  });

  it('save and cancel buttons should be disabled when prop isSaving is true', async () => {
    const wrapper = setup({ isSaving: true });
    const saveButton = wrapper.find('[aria-label="Save"]');
    const cancelButton = findByText(wrapper, 'button', 'Cancel');
    expect(saveButton.attributes('disabled')).toBeDefined();
    expect(cancelButton.attributes('disabled')).toBeDefined();
  });
});
