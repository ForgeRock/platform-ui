/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ChoiceCallback from '@/components/callbacks/ChoiceCallback';
import i18n from '@/i18n';

describe('ChoiceCallback', () => {
  const mockCallback = {
    getChoices: () => ['Option A', 'Option B', 'Option C'],
    getDefaultChoice: () => 0,
    getPrompt: () => 'Choose one',
    setInputValue: jest.fn(),
  };

  function createWrapper(stage = null) {
    return mount(ChoiceCallback, {
      global: {
        plugins: [i18n],
      },
      props: {
        callback: mockCallback,
        index: 0,
        stage,
      },
    });
  }

  describe('Default Select Display', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('Sets selected and choices/options data', () => {
      expect(wrapper.vm.$data.selected).toMatchObject(
        {
          name: 'callback_0',
          label: 'Choose one',
          value: 0,
          options: [
            { text: 'Option A', value: 0 },
            { text: 'Option B', value: 1 },
            { text: 'Option C', value: 2 }],
        },
      );
    });

    it('Sets prompt on DOM', async () => {
      const selectInput = wrapper.find('.form-label-group-input');
      const selectLabel = wrapper.find('.form-label-group-input label');

      expect(selectInput.wrapperElement.title).toBe('Choose one');
      expect(selectLabel.text()).toBe('Choose one');
    });
  });

  describe('Vertical Radio Display', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = createWrapper({ displayType: 'radio' });
    });

    it('Renders vertical radio buttons with stacked prop', () => {
      const radioGroup = wrapper.findComponent({ name: 'BFormRadioGroup' });
      expect(radioGroup.props('stacked')).toBe(true);
    });

    it('Has aria-label for accessibility', () => {
      const radioGroup = wrapper.findComponent({ name: 'BFormRadioGroup' });
      expect(radioGroup.attributes('aria-label')).toBe('Choose one');
    });

    it('Sets input value on radio selection', async () => {
      wrapper.vm.selected.value = 2;
      await wrapper.vm.$nextTick();
      expect(mockCallback.setInputValue).toHaveBeenCalledWith(2);
    });
  });

  describe('Horizontal Radio Display', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = createWrapper({ displayType: 'horizontalRadio' });
    });

    it('Renders horizontal radio buttons without stacked prop', () => {
      const radioGroup = wrapper.findComponent({ name: 'BFormRadioGroup' });
      expect(radioGroup.props('stacked')).toBe(false);
    });

    it('Has aria-label for accessibility', () => {
      const radioGroup = wrapper.findComponent({ name: 'BFormRadioGroup' });
      expect(radioGroup.attributes('aria-label')).toBe('Choose one');
    });

    it('Sets input value on radio selection', async () => {
      wrapper.vm.selected.value = 1;
      await wrapper.vm.$nextTick();
      expect(mockCallback.setInputValue).toHaveBeenCalledWith(1);
    });
  });

  describe('Vertical Buttons Display', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = createWrapper({ displayType: 'verticalButtons' });
      mockCallback.setInputValue.mockClear();
    });

    it('Renders buttons in flex column layout', () => {
      const div = wrapper.find('.d-flex.flex-column');
      expect(div.exists()).toBe(true);
    });

    it('Renders all option buttons', () => {
      const buttons = wrapper.findAllComponents({ name: 'BButton' });
      expect(buttons).toHaveLength(3);
      expect(buttons[0].text()).toBe('Option A');
      expect(buttons[1].text()).toBe('Option B');
      expect(buttons[2].text()).toBe('Option C');
    });

    it('Has proper aria-label for each button with selected state', async () => {
      wrapper.vm.selected.value = 0;
      await wrapper.vm.$nextTick();

      const buttons = wrapper.findAllComponents({ name: 'BButton' });
      expect(buttons[0].attributes('aria-label')).toBe('Option A (selected)');
      expect(buttons[1].attributes('aria-label')).toBe('Option B ');
    });

    it('Has group role and aria-label on container', () => {
      const groupDiv = wrapper.find('[role="group"]');
      expect(groupDiv.exists()).toBe(true);
      expect(groupDiv.attributes('aria-label')).toBe('Choose one');
    });

    it('Updates value and calls setInputValue on button click', async () => {
      const buttons = wrapper.findAllComponents({ name: 'BButton' });
      await buttons[2].trigger('click');

      expect(wrapper.vm.selected.value).toBe(2);
      expect(mockCallback.setInputValue).toHaveBeenCalledWith(2);
    });

    it('Has correct spacing classes', () => {
      const buttons = wrapper.findAllComponents({ name: 'BButton' });
      expect(buttons[0].classes()).toContain('mt-1');
    });
  });

  describe('Horizontal Buttons Display', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = createWrapper({ displayType: 'horizontalButtons' });
      mockCallback.setInputValue.mockClear();
    });

    it('Renders buttons with group role', () => {
      const groupDiv = wrapper.find('[role="group"]');
      expect(groupDiv.exists()).toBe(true);
      expect(groupDiv.classes()).not.toContain('flex-column');
    });

    it('Has aria-label on group container', () => {
      const groupDiv = wrapper.find('[role="group"]');
      expect(groupDiv.attributes('aria-label')).toBe('Choose one');
    });

    it('Renders all option buttons', () => {
      const buttons = wrapper.findAllComponents({ name: 'BButton' });
      expect(buttons).toHaveLength(3);
    });

    it('Has proper aria-label for each button', async () => {
      wrapper.vm.selected.value = 1;
      await wrapper.vm.$nextTick();

      const buttons = wrapper.findAllComponents({ name: 'BButton' });
      expect(buttons[1].attributes('aria-label')).toBe('Option B (selected)');
      expect(buttons[2].attributes('aria-label')).toBe('Option C ');
    });

    it('Updates value and calls setInputValue on button click', async () => {
      const buttons = wrapper.findAllComponents({ name: 'BButton' });
      await buttons[1].trigger('click');

      expect(wrapper.vm.selected.value).toBe(1);
      expect(mockCallback.setInputValue).toHaveBeenCalledWith(1);
    });
  });

  describe('Accessibility Features', () => {
    it('Vertical buttons have proper ARIA labels and roles', () => {
      const wrapper = createWrapper({ displayType: 'verticalButtons' });
      const groupDiv = wrapper.find('[role="group"]');

      expect(groupDiv.exists()).toBe(true);
      expect(groupDiv.attributes('aria-label')).toBe('Choose one');

      const buttons = wrapper.findAllComponents({ name: 'BButton' });
      buttons.forEach((button, index) => {
        expect(button.attributes('aria-label')).toBeDefined();
        expect(button.attributes('aria-label')).toContain(`Option ${String.fromCharCode(65 + index)}`);
      });
    });

    it('Horizontal buttons have proper ARIA labels and roles', () => {
      const wrapper = createWrapper({ displayType: 'horizontalButtons' });
      const groupDiv = wrapper.find('[role="group"]');

      expect(groupDiv.exists()).toBe(true);
      expect(groupDiv.attributes('aria-label')).toBe('Choose one');
    });

    it('Radio groups have aria-label', () => {
      const verticalWrapper = createWrapper({ displayType: 'radio' });
      const horizontalWrapper = createWrapper({ displayType: 'horizontalRadio' });

      expect(verticalWrapper.findComponent({ name: 'BFormRadioGroup' }).attributes('aria-label')).toBe('Choose one');
      expect(horizontalWrapper.findComponent({ name: 'BFormRadioGroup' }).attributes('aria-label')).toBe('Choose one');
    });
  });

  describe('Component Initialization', () => {
    it('Uses default displayType of "select" when stage is null', () => {
      const wrapper = createWrapper(null);
      expect(wrapper.vm.displayType).toBe('select');
    });

    it('Uses provided displayType from stage', () => {
      const wrapper = createWrapper({ displayType: 'verticalButtons' });
      expect(wrapper.vm.displayType).toBe('verticalButtons');
    });

    it('Uses default choice as initial value', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.selected.value).toBe(0);
    });

    it('Has correct callback name format', () => {
      const wrapper = mount(ChoiceCallback, {
        global: {
          plugins: [i18n],
        },
        props: {
          callback: mockCallback,
          index: 42,
          stage: null,
        },
      });

      expect(wrapper.vm.selected.name).toBe('callback_42');
    });
  });
});
