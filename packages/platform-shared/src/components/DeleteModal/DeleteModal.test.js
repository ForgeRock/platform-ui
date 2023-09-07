/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
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
