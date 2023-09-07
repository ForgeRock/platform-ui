/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@/i18n';
import Tag from './index';
import { findByTestId } from '../../../utils/testHelpers';

const defaultProps = {
  options: [],
  name: 'stub-name',
  label: 'stub-label',
};

describe('Tag', () => {
  function setup(props) {
    return mount(Tag, {
      attachTo: document.body,
      global: {
        plugins: [i18n],
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
  }

  describe('@actions', () => {
    it('should remove tag with click', async () => {
      const wrapper = setup();
      wrapper.vm.setInputValue(['new value']); // TODO: replace with .setValue
      await flushPromises();

      const closeButtonBeforeRemove = findByTestId(wrapper, 'remove-new-value-tag');
      closeButtonBeforeRemove.trigger('click');
      await flushPromises();

      // Note: once we click remove, this should no longer exist
      const closeButtonAfterRemove = findByTestId(wrapper, 'remove-new-value-tag');
      expect(closeButtonAfterRemove.exists()).toBeFalsy();
    });

    it('should remove tag with keyboard', async () => {
      const wrapper = setup();
      wrapper.vm.setInputValue(['new value']); // TODO: replace with .setValue
      await flushPromises();

      const closeButtonBeforeRemove = findByTestId(wrapper, 'remove-new-value-tag');
      closeButtonBeforeRemove.trigger('keydown.enter');
      await flushPromises();

      // Note: once we click remove, this should no longer exist
      const closeButtonAfterRemove = findByTestId(wrapper, 'remove-new-value-tag');
      expect(closeButtonAfterRemove.exists()).toBeFalsy();
    });
  });

  describe('@unit', () => {
    it('Tag input sets input value', async () => {
      const wrapper = setup({ options: ['a', 'b', 'c'] });
      wrapper.vm.setInputValue('');
      expect(wrapper.vm.inputValue).toStrictEqual([]);
      wrapper.vm.setInputValue(['test']);
      await flushPromises();
      expect(wrapper.vm.inputValue).toStrictEqual(['test']);

      expect(wrapper.vm.floatLabels).toBe(true);
      wrapper.vm.inputValueHandler(['test'], false);
      expect(wrapper.vm.floatLabels).toBe(true);
      wrapper.vm.inputValueHandler('', true);
      expect(wrapper.vm.floatLabels).toBe(true);
      wrapper.vm.inputValueHandler('', false);
      expect(wrapper.vm.floatLabels).toBe(false);
    });
  });
});
