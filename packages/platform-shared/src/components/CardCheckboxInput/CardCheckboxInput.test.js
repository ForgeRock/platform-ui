/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import CardCheckboxInput from './index';
import { runA11yTest } from '../../utils/testHelpers';

describe('CardCheckboxInput Component', () => {
  function setup(props = {}, slotContent = '') {
    const wrapper = mount(CardCheckboxInput, {
      props: {
        ...props,
      },
      slots: {
        default: slotContent,
      },
      global: {
        mocks: {
          $t: () => {},
        },
      },
    });
    return wrapper;
  }

  describe('@a11y', () => {
    it('should pass accessibility tests when the value is set to default false', async () => {
      const wrapper = setup({}, '<div>Test Content</div>');
      await runA11yTest(wrapper);
    });

    it('should pass accessibility tests when disabled is set to true', async () => {
      const wrapper = setup({ disabled: true }, '<div>Test Content</div>');
      await runA11yTest(wrapper);
    });

    it('should pass accessibility tests when the cardBodyClass is set', async () => {
      const wrapper = setup({ cardBodyClass: 'card-body-test-class' }, '<div>Test Content</div>');
      await runA11yTest(wrapper);
    });

    it('should pass accessibility tests when all props are set', async () => {
      const wrapper = setup({ value: false, disabled: true, cardBodyClass: 'card-body-test-class' }, '<div>Test Content</div>');
      await runA11yTest(wrapper);
    });

    it('should pass accessibility tests when slot is empty', async () => {
      const wrapper = setup({ value: false, disabled: true, cardBodyClass: 'card-body-test-class' }, '');
      await runA11yTest(wrapper);
    });
  });

  describe('Component behavior', () => {
    it('has a checkbox input', () => {
      const wrapper = setup();
      expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
    });

    it('uses a card', () => {
      const wrapper = setup();
      expect(wrapper.find('input[type="checkbox"]').attributes('class')).toBe('card-input-element');
    });

    it('has a default value of false', () => {
      const wrapper = setup();
      expect(wrapper.find('input[type="checkbox"]').attributes('value')).toBe('false');
    });

    it('sets value to true based on prop', () => {
      const wrapper = setup({ value: true });
      expect(wrapper.find('input[type="checkbox"]').attributes('value')).toBe('true');
    });

    it('renders default slot content', () => {
      const wrapper = setup({}, '<div>Test</div>');
      expect(wrapper.find('div').text()).toBe('Test');
    });
  });
});
