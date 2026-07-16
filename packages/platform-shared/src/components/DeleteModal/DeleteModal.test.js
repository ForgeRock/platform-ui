/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import DeleteModal from './index';

describe('DeleteModal', () => {
  const stubPropsData = {
    isTesting: true,
  };

  function setup(props) {
    return mount(DeleteModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...stubPropsData,
        ...props,
      },
    });
  }

  it('with custom message', () => {
    const wrapper = setup({
      customMessage: 'stub custom message',
    });

    const customMessageElement = findByTestId(wrapper, 'delete-modal-custom-message');
    expect(customMessageElement.text()).toBe('stub custom message');
  });

  it('with type', () => {
    const wrapper = setup({
      translatedItemType: 'Service Account',
    });

    const bodyWithType = findByTestId(wrapper, 'deletePanel-body');
    expect(bodyWithType.text()).toBe('Are you sure you want to delete this service account?');
  });

  it('delete button should not be disabled when not deleting', () => {
    const wrapper = setup({
      isDeleting: false,
      testid: 'delete-modal',
    });

    const deleteButton = findByTestId(wrapper, 'btn-confirm-delete-modal');
    expect(deleteButton.attributes('disabled')).toBeFalsy();
  });

  it('delete button should be disabled when deleting', () => {
    const wrapper = setup({
      isDeleting: true,
      testid: 'delete-modal',
    });

    const deleteButton = findByTestId(wrapper, 'btn-confirm-delete-modal');
    expect(deleteButton.attributes('disabled')).toBe('');
  });

  it('cancel should be hidden when deleting', () => {
    const wrapper = setup({
      isDeleting: true,
      testid: 'delete-modal',
    });

    const cancelButton = findByTestId(wrapper, 'btn-cancel-delete-modal');
    expect(cancelButton.exists()).toBeFalsy();
  });

  it('renders below-body slot content after the body', () => {
    const wrapper = mount(DeleteModal, {
      global: { plugins: [i18n] },
      props: { ...stubPropsData },
      slots: { 'below-body': '<p data-testid="slot-content">Extra warning</p>' },
    });

    const slotContent = findByTestId(wrapper, 'slot-content');
    expect(slotContent.exists()).toBeTruthy();
    expect(slotContent.text()).toBe('Extra warning');
  });

  it('renders below-body slot after the standard body text', () => {
    const wrapper = mount(DeleteModal, {
      global: { plugins: [i18n] },
      props: { ...stubPropsData, translatedItemType: 'Template' },
      slots: { 'below-body': '<p data-testid="slot-content">Extra warning</p>' },
    });

    const body = findByTestId(wrapper, 'deletePanel-body');
    const slotContent = findByTestId(wrapper, 'slot-content');
    expect(body.exists()).toBeTruthy();
    expect(slotContent.exists()).toBeTruthy();
  });

  it('passes size prop to BModal', () => {
    const wrapper = setup({ size: 'lg' });
    const modal = wrapper.findComponent({ name: 'BModal' });
    expect(modal.props('size')).toBe('lg');
  });

  it('uses default empty string for size when not provided', () => {
    const wrapper = setup({});
    const modal = wrapper.findComponent({ name: 'BModal' });
    expect(modal.props('size')).toBe('');
  });

  it('accepts valid size values', () => {
    ['sm', 'md', 'lg', 'xl', ''].forEach((size) => {
      const wrapper = setup({ size });
      const modal = wrapper.findComponent({ name: 'BModal' });
      expect(modal.props('size')).toBe(size);
    });
  });

  it('warns on invalid size value', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    setup({ size: 'xxl' });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  describe('@actions', () => {
    it('should emit delete-item event', () => {
      const wrapper = setup({
        testid: 'delete-modal',
      });
      expect(wrapper.emitted()['delete-item']).toBeFalsy();

      const deleteButton = findByTestId(wrapper, 'btn-confirm-delete-modal');
      deleteButton.trigger('click');

      expect(wrapper.emitted()['delete-item']).toBeTruthy();
    });
  });
});
