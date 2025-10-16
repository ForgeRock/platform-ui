/**
 * Copyright (c) 2022-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import QueryFilterBuilder from './index';
import i18n from '@/i18n';
import { findByText } from '@/utils/testHelpers';

function setup(props = {}, { validateFilterMock } = {}) {
  // Stub before mount to avoid network call (allow override)
  QueryFilterBuilder.methods.validateFilter = validateFilterMock || jest.fn().mockResolvedValue({
    subfilters: [
      { operator: 'co', field: '/', value: 'test' },
    ],
  });

  return mount(QueryFilterBuilder, {
    props: {
      resourceName: 'user',
      queryFilterString: '/ co ""',
      properties: [
        { label: 'Option 1', value: 'option1', type: 'string' },
        { label: 'Option 2', value: 'option2', type: 'string' },
        { label: 'Option 3', value: 'option3', type: 'string' },
        { label: 'Option 4', value: 'option4', type: 'string' },
        { label: 'Option 5', value: 'option5', type: 'string' },
      ],
      disabled: false,
      hideAdvanced: false,
      hideGroup: false,
      prefixGroupText: '',
      ...props,
    },
    global: {
      plugins: [i18n],
      mocks: {
        $store: {
          state: {
            isFraas: true,
          },
        },
      },
    },
  });
}

describe('@renders', () => {
  it('mounts successfully', async () => {
    const wrapper = setup();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders a single FilterBuilderGroup when in basic mode', async () => {
    const wrapper = setup();
    await flushPromises();
    const groups = wrapper.findAllComponents({ name: 'FilterBuilderGroup' });
    expect(groups.length).toBe(1);
  });

  it('switches to Advanced Editor when button clicked and renders Script Editor then back to Basic', async () => {
    const wrapper = setup();
    await flushPromises();

    expect(wrapper.findAllComponents({ name: 'FilterBuilderGroup' }).length).toBe(1);

    const advancedBtn = findByText(wrapper, 'button', 'Advanced Editor');
    expect(advancedBtn.exists()).toBe(true);
    await advancedBtn.trigger('click');
    await flushPromises();

    const scriptEditor = wrapper.findComponent({ name: 'ScriptEditor' });
    expect(scriptEditor.exists()).toBe(true);

    const basicBtn = findByText(wrapper, 'button', 'Basic Editor');
    expect(basicBtn.exists()).toBe(true);
    await basicBtn.trigger('click');
    await flushPromises();

    expect(wrapper.findAllComponents({ name: 'FilterBuilderGroup' }).length).toBe(1);
  });

  it('renders disabled multiselect elements when disabled prop true', async () => {
    const wrapper = setup({ disabled: true });
    await flushPromises();
    const multiselects = wrapper.findAll('.multiselect');
    expect(multiselects.length).toBeGreaterThan(0);
    multiselects.forEach((ms) => {
      expect(ms.classes()).toContain('multiselect--disabled');
      const input = ms.find('input.multiselect__input');
      if (input.exists()) {
        expect(input.element.disabled).toBe(true);
      }
    });
  });

  it('renders enabled multiselect elements when disabled prop false', async () => {
    const wrapper = setup({ disabled: false });
    await flushPromises();
    const multiselects = wrapper.findAll('.multiselect');
    expect(multiselects.length).toBeGreaterThan(0);
    multiselects.forEach((ms) => {
      expect(ms.classes()).not.toContain('multiselect--disabled');
      const input = ms.find('input.multiselect__input');
      if (input.exists()) {
        expect(input.element.disabled).toBe(false);
      }
    });
  });

  it('shows Advanced Editor button when hideAdvanced false', async () => {
    const wrapper = setup({ hideAdvanced: false });
    await flushPromises();
    const advancedBtn = findByText(wrapper, 'button', 'Advanced Editor');
    expect(advancedBtn.exists()).toBe(true);
  });

  it('hides Advanced Editor button when hideAdvanced true', async () => {
    const wrapper = setup({ hideAdvanced: true });
    await flushPromises();
    const advancedBtn = findByText(wrapper, 'button', 'Advanced Editor');
    expect(advancedBtn?.exists()).toBeFalsy();
  });

  it('updates filterString and emits filter-update when selecting property, operator and value', async () => {
    const wrapper = setup();
    await flushPromises();

    // Select property Option 3
    const propertySelect = wrapper.find('.rule-property-col .multiselect');
    expect(propertySelect.exists()).toBe(true);
    await propertySelect.trigger('click');
    await flushPromises();
    const propertyOptions = wrapper.findAll('.rule-property-col .multiselect__option');
    const option3 = propertyOptions.find((o) => o.text().includes('Option 3'));
    expect(option3).toBeTruthy();
    await option3.trigger('click');
    await flushPromises();

    // Select operator Contains (value: co)
    const operatorSelect = wrapper.find('.rule-condition-col .multiselect');
    expect(operatorSelect.exists()).toBe(true);
    await operatorSelect.trigger('click');
    await flushPromises();
    const operatorOptions = wrapper.findAll('.rule-condition-col .multiselect__option');
    const containsOption = operatorOptions.find((o) => /Contains/i.test(o.text()));
    if (containsOption) {
      await containsOption.trigger('click');
      await flushPromises();
    }

    // Enter value test123
    const valueInput = wrapper.find('.rule-value-col input');
    expect(valueInput.exists()).toBe(true);
    await valueInput.setValue('test123');
    await flushPromises();

    // Verify emission
    const emitted = wrapper.emitted('filter-update');
    expect(emitted).toBeTruthy();

    // Last emission should contain updated queryFilter with selected field/operator/value
    const lastEmission = emitted[emitted.length - 1][0];
    expect(lastEmission.subfilters[0].field).toBe('/option3');
    expect(lastEmission.subfilters[0].operator).toBe('co');
    expect(lastEmission.subfilters[0].value).toBe('test123');
  });

  it('shows ScriptEditor with complex filter and disables Basic Editor button', async () => {
    const complexFilter = '/effectiveGroups[_ref eq "managed/alpha_group/Test"]';

    const validateFilterMock = jest.fn().mockResolvedValue({
      field: '/effectiveGroups',
      subfilter: {
        field: '_ref',
        value: 'managed/alpha_group/Test',
        operator: 'eq',
      },
      operator: 'complex',
    });

    const wrapper = setup({ queryFilterString: complexFilter }, { validateFilterMock });
    await flushPromises();

    expect(validateFilterMock).toHaveBeenCalled();

    // Should be in advanced mode (isBasic === false) so ScriptEditor visible
    const scriptEditor = wrapper.findComponent({ name: 'ScriptEditor' });
    expect(scriptEditor.exists()).toBe(true);

    // Basic Editor button should be present but disabled (allowBasicMode false)
    const basicBtn = findByText(wrapper, 'button', 'Basic Editor');
    expect(basicBtn.exists()).toBe(true);
    expect(basicBtn.attributes('disabled')).toBeDefined();
  });
});
