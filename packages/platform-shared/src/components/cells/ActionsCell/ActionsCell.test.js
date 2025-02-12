/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import i18n from '@forgerock/platform-shared/src/i18n';
import ActionsCell from './index';
import { findByTestId } from '../../../utils/testHelpers';

describe('Actions cell actions and renders', () => {
  it('renders "Delete" and "Edit" by default if no props are passed', () => {
    const wrapper = mount(ActionsCell, {
      global: {
        plugins: [i18n],
      },
      props: {
        testId: '0',
      },
    });

    const dropdownDelete = findByTestId(wrapper, 'dropdown-delete-0');
    expect(dropdownDelete.exists()).toBe(true);

    const dropdownEdit = findByTestId(wrapper, 'dropdown-edit-0');
    expect(dropdownEdit.exists()).toBe(true);

    const dropdownDuplicate = findByTestId(wrapper, 'dropdown-duplicate-toggle-0');
    expect(dropdownDuplicate.exists()).not.toBe(true);
  });

  it('does not render any options when default options are set to false', () => {
    const wrapper = mount(ActionsCell, {
      global: {
        plugins: [i18n],
      },
      props: {
        testId: '0',
        deleteOption: false,
        editOption: false,
      },
    });

    const dropdownDelete = findByTestId(wrapper, 'dropdown-delete-0');
    expect(dropdownDelete.exists()).toBe(false);

    const dropdownEdit = findByTestId(wrapper, 'dropdown-edit-0');
    expect(dropdownEdit.exists()).toBe(false);

    const dropdownShowActiveToggle = findByTestId(wrapper, 'dropdown-delete-0');
    expect(dropdownShowActiveToggle.exists()).not.toBe(true);

    const dropdownDuplicate = findByTestId(wrapper, 'dropdown-duplicate-toggle-0');
    expect(dropdownDuplicate.exists()).not.toBe(true);
  });

  it('renders list items "Edit" and "Deactivate" when deleteOption is false and toggle properties are true', () => {
    const wrapper = mount(ActionsCell, {
      global: {
        plugins: [i18n],
      },
      props: {
        testId: '0',
        deleteOption: false,
        showActiveToggle: true,
        toggleIsActive: true,
      },
    });

    const dropdownShowActiveToggle = findByTestId(wrapper, 'dropdown-active-toggle-0');
    expect(dropdownShowActiveToggle.exists()).toBe(true);
    expect(dropdownShowActiveToggle.text()).toContain('Deactivate');

    const dropdownEdit = findByTestId(wrapper, 'dropdown-edit-0');
    expect(dropdownEdit.exists()).toBe(true);

    const dropdownDelete = findByTestId(wrapper, 'dropdown-delete-0');
    expect(dropdownDelete.exists()).toBe(false);
  });

  it('renders "Activate" when toggleIsActive property is false', () => {
    const wrapper = mount(ActionsCell, {
      global: {
        plugins: [i18n],
      },
      props: {
        testId: '0',
        showActiveToggle: true,
        toggleIsActive: false,
      },
    });

    const dropdownShowActiveToggle = findByTestId(wrapper, 'dropdown-active-toggle-0');
    expect(dropdownShowActiveToggle.exists()).toBe(true);
    expect(dropdownShowActiveToggle.text()).toContain('Activate');
  });

  it('emits delete-clicked event when Delete dropdown item is clicked', () => {
    const wrapper = mount(ActionsCell, {
      global: {
        plugins: [i18n],
      },
      props: {
        testId: '0',
        deleteOption: true,
      },
    });

    const dropdownDelete = findByTestId(wrapper, 'dropdown-delete-0');
    expect(dropdownDelete.text()).toContain('Delete');
    expect(dropdownDelete.classes()).toContain('dropdown-item');
    expect(wrapper.emitted('deactivate-clicked')).toBeFalsy();

    dropdownDelete.trigger('click');
    expect(wrapper.emitted('delete-clicked')).toBeTruthy();
  });

  it('emits duplicate-clicked event when Duplicate dropdown item is clicked', () => {
    const wrapper = mount(ActionsCell, {
      global: {
        plugins: [i18n],
      },
      props: {
        testId: '0',
        duplicateOption: true,
      },
    });

    const dropDownDuplicate = findByTestId(wrapper, 'dropdown-duplicate-0');
    expect(dropDownDuplicate.text()).toContain('Duplicate');
    expect(dropDownDuplicate.classes()).toContain('dropdown-item');

    dropDownDuplicate.trigger('click');
    expect(wrapper.emitted('duplicate-clicked')).toBeTruthy();
  });

  it('emits edit-clicked event when Edit dropdown item is clicked', () => {
    const wrapper = mount(ActionsCell, {
      global: {
        plugins: [i18n],
      },
      props: {
        testId: '0',
        editOption: true,
      },
    });

    const dropdownEdit = findByTestId(wrapper, 'dropdown-edit-0');
    expect(dropdownEdit.text()).toContain('Edit');
    expect(dropdownEdit.classes()).toContain('dropdown-item');

    dropdownEdit.trigger('click');
    expect(wrapper.emitted('edit-clicked')).toBeTruthy();
  });

  it('emits toggle-clicked event when Deactivate dropdown toggle item is clicked', () => {
    const wrapper = mount(ActionsCell, {
      global: {
        plugins: [i18n],
      },
      props: {
        testId: '0',
        showActiveToggle: true,
      },
    });

    const dropdownActiveToggle = findByTestId(wrapper, 'dropdown-active-toggle-0');
    expect(dropdownActiveToggle.text()).toContain('Deactivate');
    expect(dropdownActiveToggle.text()).toContain('power_settings_new');
    expect(dropdownActiveToggle.classes()).toContain('dropdown-item');

    dropdownActiveToggle.trigger('click');
    expect(wrapper.emitted('toggle-clicked')).toBeTruthy();
  });

  it('custom edit option text correctly rendered', () => {
    const wrapper = mount(ActionsCell, {
      global: {
        plugins: [i18n],
      },
      props: {
        testId: '0',
        editOption: true,
        editOptionText: 'Custom Edit',
      },
    });
    const dropdownEdit = findByTestId(wrapper, 'dropdown-edit-0');
    expect(dropdownEdit.text()).toContain('Custom Edit');
  });

  it('custom classes applied to toggle button properly', () => {
    const wrapper = mount(ActionsCell, {
      global: {
        plugins: [i18n],
      },
      props: {
        testId: '0',
        toggleClass: 'custom-class',
      },
    });

    const dropdownToggle = findByTestId(wrapper, 'actions-0').find('.dropdown-toggle');
    expect(dropdownToggle.classes()).toContain('custom-class');
  });
});
