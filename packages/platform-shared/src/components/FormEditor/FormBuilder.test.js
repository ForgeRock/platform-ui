/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import FormBuilder from './FormBuilder';
import i18n from '@/i18n';

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
});

describe('FormBuilder', () => {
  function setup(modelValue = {}, schema = [
    {
      id: 'row1',
      fields: [
        {
          type: 'string',
          model: 'field1',
          label: 'Field 1',
          layout: { columns: 6, offset: 0 },
          validation: {
            required: true,
          },
        },
        {
          type: 'string',
          model: 'field2',
          label: 'Field 2',
          layout: { columns: 6, offset: 0 },
          validation: {
            required: true,
          },
        },
      ],
    },
    {
      id: 'row2',
      fields: [
        {
          type: 'string',
          model: 'field3',
          label: 'Field 3',
          layout: { columns: 4, offset: 0 },
          validation: {
            required: true,
          },
        },
        {
          type: 'string',
          model: 'field4',
          label: 'Field 4',
          layout: { columns: 4, offset: 0 },
          validation: {
            required: true,
          },
        },
        {
          type: 'string',
          model: 'field5',
          label: 'Field 5',
          layout: { columns: 4, offset: 0 },
          validation: {
            required: true,
          },
        },
      ],
    },
    {
      id: 'row3',
      fields: [
        {
          type: 'string',
          model: 'field6',
          label: 'Field 6',
          layout: { columns: 4, offset: 0 },
          validation: {
            required: true,
          },
        },
      ],
    },
    {
      id: 'row4',
      fields: [
        {
          type: 'string',
          model: 'field7',
          label: 'Field 7',
          layout: { columns: 12, offset: 0 },
          validation: {
            required: true,
          },
        },
      ],
    },
  ], propsData) {
    return mount(FormBuilder, {
      global: {
        plugins: [i18n],
      },
      props: {
        schema,
        'model-value': modelValue,
        includeDefaults: true,
        ...propsData,
      },
    });
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should init correctly the form generator', async () => {
    const wrapper = setup();

    const formGenerator = wrapper.findComponent({ name: 'FormGenerator' });

    expect(formGenerator.vm.schema).toEqual([
      [
        {
          type: 'string',
          model: 'field1',
          columnClass: 'col-md-6 offset-md-0',
          label: 'Field 1',
          disabled: false,
          layout: { columns: 6, offset: 0 },
          validation: {
            required: true,
          },
        },
        {
          type: 'string',
          model: 'field2',
          columnClass: 'col-md-6 offset-md-0',
          label: 'Field 2',
          disabled: false,
          layout: { columns: 6, offset: 0 },
          validation: {
            required: true,
          },
        },
      ],
      [
        {
          type: 'string',
          model: 'field3',
          columnClass: 'col-md-4 offset-md-0',
          label: 'Field 3',
          disabled: false,
          layout: { columns: 4, offset: 0 },
          validation: {
            required: true,
          },
        },
        {
          type: 'string',
          model: 'field4',
          columnClass: 'col-md-4 offset-md-0',
          label: 'Field 4',
          disabled: false,
          layout: { columns: 4, offset: 0 },
          validation: {
            required: true,
          },
        },
        {
          type: 'string',
          model: 'field5',
          columnClass: 'col-md-4 offset-md-0',
          label: 'Field 5',
          disabled: false,
          layout: { columns: 4, offset: 0 },
          validation: {
            required: true,
          },
        },
      ],
      [
        {
          type: 'string',
          model: 'field6',
          columnClass: 'col-md-4 offset-md-0',
          label: 'Field 6',
          disabled: false,
          layout: { columns: 4, offset: 0 },
          validation: {
            required: true,
          },
        },
      ],
      [
        {
          type: 'string',
          model: 'field7',
          columnClass: 'col-md-12 offset-md-0',
          label: 'Field 7',
          disabled: false,
          layout: { columns: 12, offset: 0 },
          validation: {
            required: true,
          },
        },
      ],
    ]);
    expect(formGenerator.vm.model).toEqual({});
  });

  it('should emit update:modelValue event correctly when form generator emits update:model event', async () => {
    const wrapper = setup();

    const formGenerator = wrapper.findComponent({ name: 'FormGenerator' });
    formGenerator.vm.$emit('update:model', { path: 'field1', value: 'value1' });

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ field1: 'value1' });
  });

  it('should emit update:modelValue event correctly when form generator emits update:model event when the form has values', async () => {
    const wrapper = setup({ field1: 'value1' });

    const formGenerator = wrapper.findComponent({ name: 'FormGenerator' });
    formGenerator.vm.$emit('update:model', { path: 'field2', value: 'value2' });

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ field1: 'value1', field2: 'value2' });
  });

  it('should emit is-valid event properly', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'string',
            model: 'field1',
            validation: { required: true },
            layout: { columns: 12 },
          },
        ],
      },
    ]);

    await flushPromises();

    expect(wrapper.emitted('is-valid')).toHaveLength(2);
    expect(wrapper.emitted('is-valid')[1][0]).toBe(false);

    const field = wrapper.find('input');

    await field.setValue('test1');
    await flushPromises();

    expect(wrapper.emitted('is-valid')).toHaveLength(4);
    expect(wrapper.emitted('is-valid')[3][0]).toBe(true);

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ field1: 'test1' });
  });

  it('should render correctly a text input', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'string',
            model: 'field1',
            defaultValue: 'Field 1 default value',
            label: 'Text 1',
            description: 'This is a text field',
            layout: { columns: 12, offset: 0 },
            validation: {
              required: true,
            },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-12', 'offset-md-0');

    const field = col[0].findComponent({ name: 'StringDisplay' });
    const label = field.find('label');
    expect(label.text()).toBe('Text 1');
    const description = field.find('small');
    expect(description.text()).toBe('This is a text field');
    const input = field.find('input');
    expect(input.attributes('type')).toBe('text');
    expect(input.element.value).toBe('Field 1 default value');
  });

  it('should render correctly a form text div', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'formText',
            layout: { columns: 12, offset: 0 },
            formText: 'form text to be tested',
            customSlot: 'formText',
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-12', 'offset-md-0');

    const formTextCol = col[0];
    expect(formTextCol.text()).toBe('form text to be tested');
  });

  it('should render correctly a text input with model value', async () => {
    const wrapper = setup({
      field1: 'Field 1 value',
    }, [
      {
        rowId: 'row1',
        fields: [
          {
            type: 'string',
            model: 'field1',
            defaultValue: 'Field 1 default value',
            label: 'Text 1',
            description: 'This is a text field',
            layout: { columns: 12, offset: 0 },
            validation: {
              required: true,
            },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-12', 'offset-md-0');

    const field = col[0].findComponent({ name: 'StringDisplay' });
    const label = field.find('label');
    expect(label.text()).toBe('Text 1');
    const description = field.find('small');
    expect(description.text()).toBe('This is a text field');
    const input = field.find('input');
    expect(input.attributes('type')).toBe('text');
    expect(input.element.value).toBe('Field 1 value');
  });

  it('should update correctly the model value when the input changes', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'string',
            model: 'field1',
            defaultValue: 'Field 1 default value',
            label: 'Text 1',
            description: 'This is a text field',
            layout: { columns: 12, offset: 0 },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const field = wrapper.findComponent({ name: 'StringDisplay' });
    const input = field.find('input');
    input.setValue('New value');
    input.trigger('input');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:modelValue')).toHaveLength(2);
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ field1: 'Field 1 default value' });
    expect(wrapper.emitted('update:modelValue')[1][0]).toEqual({ field1: 'New value' });
  });

  it('should render correctly a textarea', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'textarea',
            model: 'field1',
            defaultValue: 'Field 1 default value',
            label: 'Textarea 1',
            description: 'This is a textarea field',
            layout: { columns: 12, offset: 0 },
            validation: {
              required: true,
            },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-12', 'offset-md-0');

    const field = col[0].findComponent({ name: 'TextAreaDisplay' });
    const label = field.find('label');
    expect(label.text()).toBe('Textarea 1');
    const description = field.find('small');
    expect(description.text()).toBe('This is a textarea field');
    const textarea = field.find('textarea');
    expect(textarea.element.value).toBe('Field 1 default value');
  });

  it('should render correctly a textarea with model value', async () => {
    const wrapper = setup({
      field1: 'Field 1 value',
    }, [
      {
        id: 'row1',
        fields: [
          {
            type: 'textarea',
            model: 'field1',
            defaultValue: 'Field 1 default value',
            label: 'Textarea 1',
            description: 'This is a textarea field',
            layout: { columns: 12, offset: 0 },
            validation: {
              required: true,
            },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-12', 'offset-md-0');

    const field = col[0].findComponent({ name: 'TextAreaDisplay' });
    const label = field.find('label');
    expect(label.text()).toBe('Textarea 1');
    const description = field.find('small');
    expect(description.text()).toBe('This is a textarea field');
    const textarea = field.find('textarea');
    expect(textarea.element.value).toBe('Field 1 value');
  });

  it('should update correctly the model value when the textarea changes', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'textarea',
            model: 'field1',
            defaultValue: 'Field 1 default value',
            label: 'Textarea 1',
            description: 'This is a textarea field',
            layout: { columns: 12, offset: 0 },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const field = wrapper.findComponent({ name: 'TextAreaDisplay' });
    const textarea = field.find('textarea');
    textarea.setValue('New value');
    textarea.trigger('input');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:modelValue')).toHaveLength(2);
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ field1: 'New value' });
    expect(wrapper.emitted('update:modelValue')[1][0]).toEqual({ field1: 'New value' });
  });

  it('should render correctly a checkbox', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'checkbox',
            model: 'field1',
            defaultValue: true,
            label: 'Checkbox 1',
            description: 'This is a checkbox field',
            layout: { columns: 12, offset: 0 },
            validation: {
              required: true,
            },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-12', 'offset-md-0');

    const field = col[0].findComponent({ name: 'BooleanDisplay' });
    const label = field.find('label');
    expect(label.text().includes('Checkbox 1')).toBe(true);
    const description = label.find('small');
    expect(description.text()).toBe('This is a checkbox field');
    const checkbox = field.find('input[type="checkbox"]');
    expect(checkbox.element.checked).toBe(true);
  });

  it('should render correctly a checkbox with model value', async () => {
    const wrapper = setup({
      field1: false,
    }, [
      {
        id: 'row1',
        fields: [
          {
            type: 'checkbox',
            model: 'field1',
            defaultValue: true,
            label: 'Checkbox 1',
            description: 'This is a checkbox field',
            layout: { columns: 12, offset: 0 },
            validation: {
              required: true,
            },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-12', 'offset-md-0');

    const field = col[0].findComponent({ name: 'BooleanDisplay' });
    const label = field.find('label');
    expect(label.text().includes('Checkbox 1')).toBe(true);
    const description = label.find('small');
    expect(description.text()).toBe('This is a checkbox field');
    const checkbox = field.find('input[type="checkbox"]');
    expect(checkbox.element.checked).toBe(false);
  });

  it('should update correctly the model value when the checkbox changes', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'checkbox',
            model: 'field1',
            defaultValue: true,
            label: 'Checkbox 1',
            description: 'This is a checkbox field',
            layout: { columns: 12, offset: 0 },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const field = wrapper.findComponent({ name: 'BooleanDisplay' });
    const checkbox = field.find('input[type="checkbox"]');
    checkbox.setChecked(false);
    checkbox.trigger('change');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:modelValue')).toHaveLength(2);
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ field1: false });
    expect(wrapper.emitted('update:modelValue')[1][0]).toEqual({ field1: false });
  });

  it('should render correctly a select', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'select',
            model: 'field1',
            defaultValue: 'value1',
            label: 'Select 1',
            description: 'This is a select field',
            layout: { columns: 12, offset: 0 },
            options: [
              { value: 'value1', label: 'Value 1', selectedByDefault: true },
              { value: 'value2', label: 'Value 2' },
            ],
            validation: {
              required: true,
            },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-12', 'offset-md-0');

    const field = col[0].findComponent({ name: 'ArrayDisplay' });
    const label = field.find('label');
    expect(label.text()).toBe('Select 1');
    const description = field.find('small');
    expect(description.text()).toBe('This is a select field');
    const options = field.findAll('li[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].text()).toBe('Value 1');
    expect(options[1].text()).toBe('Value 2');
    const value = field.find('.multiselect__single');
    expect(value.text()).toBe('Value 1');
  });

  it('should render correctly a select with model value', async () => {
    const wrapper = setup({
      field1: 'value2',
    }, [
      {
        id: 'row1',
        fields: [
          {
            type: 'select',
            model: 'field1',
            defaultValue: 'value1',
            label: 'Select 1',
            description: 'This is a select field',
            layout: { columns: 12, offset: 0 },
            options: [
              { value: 'value1', label: 'Value 1' },
              { value: 'value2', label: 'Value 2' },
            ],
            validation: {
              required: true,
            },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-12', 'offset-md-0');

    const field = col[0].findComponent({ name: 'ArrayDisplay' });
    const label = field.find('label');
    expect(label.text()).toBe('Select 1');
    const description = field.find('small');
    expect(description.text()).toBe('This is a select field');
    const options = field.findAll('li[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].text()).toBe('Value 1');
    expect(options[1].text()).toBe('Value 2');
    const value = field.find('.multiselect__single');
    expect(value.text()).toBe('Value 2');
  });

  it('should update correctly the model value when the select changes', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'select',
            model: 'field1',
            defaultValue: 'value1',
            label: 'Select 1',
            description: 'This is a select field',
            layout: { columns: 12, offset: 0 },
            options: [
              { value: 'value1', label: 'Value 1' },
              { value: 'value2', label: 'Value 2' },
            ],
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const field = wrapper.findComponent({ name: 'ArrayDisplay' });
    const select = field.findComponent({ name: 'FrField' });
    select.vm.$emit('input', 'value2');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ field1: 'value2' });
  });

  it('should render correctly a multiselect', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'multiselect',
            model: 'field1',
            label: 'Multiselect 1',
            description: 'This is a multiselect field',
            defaultValue: ['value1'],
            layout: { columns: 12, offset: 0 },
            options: [
              { value: 'value1', label: 'Value 1', selectedByDefault: true },
              { value: 'value2', label: 'Value 2' },
              { value: 'value3', label: 'Value 3' },
            ],
            validation: {
              required: true,
            },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-12', 'offset-md-0');

    const field = col[0].findComponent({ name: 'ArrayDisplay' });
    const label = field.find('label');
    expect(label.text()).toBe('Multiselect 1');
    const description = field.find('small');
    expect(description.text()).toBe('This is a multiselect field');
    const options = field.findAll('li[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].text()).toBe('Value 2');
    expect(options[1].text()).toBe('Value 3');
    const tags = field.findAll('.multiselect__tag');
    expect(tags.length).toBe(1);
    expect(tags[0].text()).toBe('Value 1');
  });

  it('should render correctly a multiselect with model value', async () => {
    const wrapper = setup({
      field1: ['value2'],
    }, [
      {
        id: 'row1',
        fields: [
          {
            type: 'multiselect',
            model: 'field1',
            label: 'Multiselect 1',
            description: 'This is a multiselect field',
            defaultValue: ['value1'],
            layout: { columns: 12, offset: 0 },
            options: [
              { value: 'value1', label: 'Value 1' },
              { value: 'value2', label: 'Value 2' },
              { value: 'value3', label: 'Value 3' },
            ],
            validation: {
              required: true,
            },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-12', 'offset-md-0');

    const field = col[0].findComponent({ name: 'ArrayDisplay' });
    const label = field.find('label');
    expect(label.text()).toBe('Multiselect 1');
    const description = field.find('small');
    expect(description.text()).toBe('This is a multiselect field');
    const options = field.findAll('li[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].text()).toBe('Value 1');
    expect(options[1].text()).toBe('Value 3');
    const tags = field.findAll('.multiselect__tag');
    expect(tags.length).toBe(1);
    expect(tags[0].text()).toBe('Value 2');
  });

  it('should update correctly the model value when the multiselect changes', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'multiselect',
            model: 'field1',
            label: 'Multiselect 1',
            description: 'This is a multiselect field',
            defaultValue: ['value1'],
            layout: { columns: 12, offset: 0 },
            options: [
              { value: 'value1', label: 'Value 1' },
              { value: 'value2', label: 'Value 2' },
              { value: 'value3', label: 'Value 3' },
            ],
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const field = wrapper.findComponent({ name: 'ArrayDisplay' });
    const select = field.findComponent({ name: 'FrField' });
    select.vm.$emit('input', ['value1', 'value2']);

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ field1: ['value1', 'value2'] });
  });

  it('should render correctly a date', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'date',
            model: 'field1',
            defaultValue: '2021-01-01',
            label: 'Date 1',
            description: 'This is a date field',
            layout: { columns: 12, offset: 0 },
            validation: {
              required: true,
            },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-12', 'offset-md-0');

    const field = col[0].findComponent({ name: 'DateDisplay' });
    const label = field.find('label');
    expect(label.text()).toBe('Date 1');
    const description = field.find('small');
    expect(description.text()).toBe('This is a date field');
    const input = field.find('input');
    expect(input.attributes('type')).toBe('date');
    expect(input.element.value).toBe('2021-01-01');
  });

  it('should render correctly a date with model value', async () => {
    const wrapper = setup({
      field1: '2024-01-01',
    }, [
      {
        id: 'row1',
        fields: [
          {
            type: 'date',
            model: 'field1',
            defaultValue: '2021-01-01',
            label: 'Date 1',
            description: 'This is a date field',
            layout: { columns: 12, offset: 0 },
            validation: {
              required: true,
            },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-12', 'offset-md-0');

    const field = col[0].findComponent({ name: 'DateDisplay' });
    const label = field.find('label');
    expect(label.text()).toBe('Date 1');
    const description = field.find('small');
    expect(description.text()).toBe('This is a date field');
    const input = field.find('input');
    expect(input.attributes('type')).toBe('date');
    expect(input.element.value).toBe('2024-01-01');
  });

  it('should update correctly the model value when the date changes', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'date',
            model: 'field1',
            defaultValue: '2021-01-01',
            label: 'Date 1',
            description: 'This is a date field',
            layout: { columns: 12, offset: 0 },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const field = wrapper.findComponent({ name: 'DateDisplay' });
    const input = field.find('input');
    input.setValue('2022-01-01');
    input.trigger('input');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:modelValue')).toHaveLength(2);
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ field1: '2021-01-01' });
    expect(wrapper.emitted('update:modelValue')[1][0]).toEqual({ field1: '2022-01-01' });
  });

  it('should render properly a row with two fields with offset', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'string',
            model: 'field1',
            defaultValue: 'Field 1 default value',
            label: 'Text 1',
            description: 'This is a text field',
            layout: { columns: 6, offset: 0 },
          },
          {
            type: 'string',
            model: 'field2',
            defaultValue: 'Field 2 default value',
            label: 'Text 2',
            description: 'This is a text field',
            layout: { columns: 4, offset: 2 },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(1);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(2);
    expect(col[0].classes()).toContain('col-md-6', 'offset-md-0');
    expect(col[1].classes()).toContain('col-md-4', 'offset-md-2');
  });

  it('should render properly two fields because one field is too big for a single row', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'string',
            model: 'field1',
            defaultValue: 'Field 1 default value',
            label: 'Text 1',
            description: 'This is a text field',
            layout: { columns: 6, offset: 0 },
          },
        ],
      },
      {
        id: 'row2',
        fields: [
          {
            type: 'string',
            model: 'field2',
            defaultValue: 'Field 2 default value',
            label: 'Text 2',
            description: 'This is a text field',
            layout: { columns: 12, offset: 0 },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    const row = wrapper.findAllComponents({ name: 'BRow' });
    expect(row.length).toBe(2);

    const col = row[0].findAllComponents({ name: 'BCol' });
    expect(col.length).toBe(1);
    expect(col[0].classes()).toContain('col-md-6', 'offset-md-0');

    const col2 = row[1].findAllComponents({ name: 'BCol' });
    expect(col2.length).toBe(1);
    expect(col2[0].classes()).toContain('col-md-12', 'offset-md-0');
  });

  it('should react to schema changes', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'string',
            model: 'field1',
            defaultValue: 'Field 1 default value',
            label: 'Text 1',
            description: 'This is a text field',
            layout: { columns: 12, offset: 0 },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    let rows = wrapper.findAllComponents({ name: 'BRow' });
    expect(rows.length).toBe(1);

    wrapper.setProps({
      schema: [
        {
          id: 'row1',
          fields: [
            {
              type: 'string',
              model: 'field1',
              defaultValue: 'Field 1 default value',
              label: 'Text 1',
              description: 'This is a text field',
              layout: { columns: 12, offset: 0 },
            },
          ],
        },
        {
          id: 'row2',
          fields: [
            {
              type: 'string',
              model: 'field2',
              defaultValue: 'Field 2 default value',
              label: 'Text 2',
              description: 'This is a text field',
              layout: { columns: 12, offset: 0 },
            },
          ],
        },
      ],
    });

    await wrapper.vm.$nextTick();

    rows = wrapper.findAllComponents({ name: 'BRow' });
    expect(rows.length).toBe(2);
  });

  it('should react to model value changes', async () => {
    const wrapper = setup({
      field1: 'Field 1 value',
    }, [
      {
        id: 'row1',
        fields: [
          {
            type: 'string',
            model: 'field1',
            defaultValue: 'Field 1 default value',
            label: 'Text 1',
            description: 'This is a text field',
            layout: { columns: 12, offset: 0 },
          },
        ],
      },
    ]);

    await wrapper.vm.$nextTick();

    let field = wrapper.findComponent({ name: 'StringDisplay' });
    let input = field.find('input');
    expect(input.element.value).toBe('Field 1 value');

    wrapper.setProps({
      'model-value': {
        field1: 'Field 1 new value',
      },
    });

    await wrapper.vm.$nextTick();

    field = wrapper.findComponent({ name: 'StringDisplay' });
    input = field.find('input');
    expect(input.element.value).toBe('Field 1 new value');
  });

  it('should disable form fields when readOnly prop is true', async () => {
    const wrapper = setup({}, [
      {
        id: 'row1',
        fields: [
          {
            type: 'string',
            model: 'field1',
            label: 'Text 1',
            description: 'This is a text field',
            layout: { columns: 12, offset: 0 },
          },
        ],
      },
    ], {
      readOnly: true,
    });

    await wrapper.vm.$nextTick();

    const field = wrapper.findComponent({ name: 'StringDisplay' }).find('.fr-field');
    expect(field.attributes('disabled')).toBe('true');
  });
});
