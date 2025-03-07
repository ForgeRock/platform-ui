/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { transformSchemaToFormGenerator } from './formGeneratorSchemaTransformer';

describe('formGeneratorSchemaTransformer', () => {
  it('should transform form editor schema to form generator schema', () => {
    const schema = [
      {
        id: 'row1',
        fields: [
          {
            type: 'text',
            model: 'field1',
            label: 'Field 1',
            description: 'Field 1 description',
            defaultValue: 'Field 1 default value',
            layout: {
              columns: 6,
              offset: 0,
            },
            validation: {
              required: true,
            },
          },
          {
            type: 'textarea',
            model: 'field2',
            label: 'Field 2',
            description: 'Field 2 description',
            defaultValue: 'Field 2 default value',
            layout: {
              columns: 6,
              offset: 0,
            },
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
            type: 'checkbox',
            model: 'field3',
            label: 'Field 3',
            description: 'Field 3 description',
            defaultValue: true,
            layout: {
              columns: 4,
              offset: 0,
            },
            validation: {
              required: true,
            },
          },
          {
            type: 'select',
            model: 'field4',
            label: 'Field 4',
            description: 'Field 4 description',
            options: [
              {
                label: 'Option 1',
                value: 'option1',
                selectedByDefault: true,
              },
              {
                label: 'Option 2',
                value: 'option2',
              },
            ],
            defaultValue: 'option1',
            layout: {
              columns: 4,
              offset: 0,
            },
            validation: {
              required: true,
            },
          },
          {
            type: 'multiselect',
            model: 'field5',
            label: 'Field 5',
            description: 'Field 5 description',
            layout: {
              columns: 4,
              offset: 0,
            },
            validation: {
              required: true,
            },
            options: [
              {
                label: 'Option 1',
                value: 'option1',
                selectedByDefault: true,
              },
              {
                label: 'Option 2',
                value: 'option2',
              },
              {
                label: 'Option 3',
                value: 'option3',
              },
            ],
            defaultValue: ['option1'],
          },
        ],
      },
      {
        id: 'row3',
        fields: [
          {
            type: 'date',
            model: 'field6',
            label: 'Field 6',
            description: 'Field 6 description',
            defaultValue: '2024-01-01',
            layout: {
              columns: 4,
              offset: 0,
            },
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
            type: 'text',
            model: 'field7',
            label: 'Field 7',
            description: 'Field 7 description',
            layout: {
              columns: 12,
              offset: 0,
            },
            validation: {
              required: true,
            },
          },
        ],
      },
      {
        id: 'row5',
        fields: [{
          type: 'select',
          model: 'field8',
          label: 'Field 8',
          description: 'Field 8 description',
          options: { object: 'user' },
          layout: {
            columns: 6,
            offset: 0,
          },
          validation: {
            required: true,
          },
        },
        {
          type: 'multiselect',
          model: 'field9',
          label: 'Field 9',
          description: 'Field 9 description',
          layout: {
            columns: 6,
            offset: 0,
          },
          validation: {
            required: true,
          },
          options: { object: 'user' },
        }],
      },
      {
        id: 'row6',
        fields: [{
          type: 'select',
          model: 'field10',
          label: 'Field 10',
          description: 'Field 10 description',
          options: { object: 'user', queryFilter: 'testFilter' },
          layout: {
            columns: 6,
            offset: 0,
          },
          validation: {
            required: true,
          },
        }],
      },
    ];
    const expected = [
      [
        {
          columnClass: 'col-md-6 offset-md-0',
          description: 'Field 1 description',
          label: 'Field 1',
          layout: {
            columns: 6,
            offset: 0,
          },
          model: 'field1',
          type: 'string',
          validation: {
            required: true,
          },
          defaultValue: 'Field 1 default value',
          disabled: false,
          customSlot: undefined,
        },
        {
          columnClass: 'col-md-6 offset-md-0',
          description: 'Field 2 description',
          label: 'Field 2',
          layout: {
            columns: 6,
            offset: 0,
          },
          model: 'field2',
          type: 'textarea',
          validation: {
            required: true,
          },
          defaultValue: 'Field 2 default value',
          disabled: false,
          customSlot: undefined,
        },
      ],
      [
        {
          columnClass: 'col-md-4 offset-md-0',
          description: 'Field 3 description',
          label: 'Field 3',
          layout: {
            columns: 4,
            offset: 0,
          },
          model: 'field3',
          type: 'boolean',
          validation: {
            required: true,
          },
          defaultValue: true,
          disabled: false,
          customSlot: undefined,
        },
        {
          columnClass: 'col-md-4 offset-md-0',
          description: 'Field 4 description',
          label: 'Field 4',
          layout: {
            columns: 4,
            offset: 0,
          },
          model: 'field4',
          type: 'select',
          validation: {
            required: true,
          },
          options: [
            {
              text: 'Option 1',
              value: 'option1',
            },
            {
              text: 'Option 2',
              value: 'option2',
            },
          ],
          defaultValue: 'option1',
          disabled: false,
          customSlot: undefined,
        },
        {
          columnClass: 'col-md-4 offset-md-0',
          description: 'Field 5 description',
          label: 'Field 5',
          layout: {
            columns: 4,
            offset: 0,
          },
          model: 'field5',
          type: 'multiselect',
          validation: {
            required: true,
          },
          options: [
            {
              text: 'Option 1',
              value: 'option1',
            },
            {
              text: 'Option 2',
              value: 'option2',
            },
            {
              text: 'Option 3',
              value: 'option3',
            },
          ],
          defaultValue: ['option1'],
          disabled: false,
          customSlot: undefined,
        },
      ],
      [
        {
          columnClass: 'col-md-4 offset-md-0',
          description: 'Field 6 description',
          label: 'Field 6',
          layout: {
            columns: 4,
            offset: 0,
          },
          model: 'field6',
          type: 'date',
          validation: {
            required: true,
          },
          defaultValue: '2024-01-01',
          disabled: false,
          customSlot: undefined,
        },
      ],
      [
        {
          columnClass: 'col-md-12 offset-md-0',
          description: 'Field 7 description',
          label: 'Field 7',
          layout: {
            columns: 12,
            offset: 0,
          },
          model: 'field7',
          type: 'string',
          validation: {
            required: true,
          },
          disabled: false,
          customSlot: undefined,
        },
      ],
      [
        {
          columnClass: 'col-md-6 offset-md-0',
          description: 'Field 8 description',
          label: 'Field 8',
          layout: {
            columns: 6,
            offset: 0,
          },
          model: 'field8',
          type: 'select',
          validation: {
            required: true,
          },
          defaultValue: '',
          options: { object: 'user' },
          disabled: false,
          customSlot: 'objectSelect',
        },
        {
          columnClass: 'col-md-6 offset-md-0',
          description: 'Field 9 description',
          label: 'Field 9',
          layout: {
            columns: 6,
            offset: 0,
          },
          model: 'field9',
          type: 'multiselect',
          validation: {
            required: true,
          },
          defaultValue: [],
          options: { object: 'user' },
          disabled: false,
          customSlot: 'objectMultiselect',
        },
      ],
      [
        {
          columnClass: 'col-md-6 offset-md-0',
          description: 'Field 10 description',
          label: 'Field 10',
          layout: {
            columns: 6,
            offset: 0,
          },
          model: 'field10',
          type: 'select',
          validation: {
            required: true,
          },
          defaultValue: '',
          options: { object: 'user', queryFilter: 'testFilter' },
          disabled: false,
          customSlot: 'objectSelect',
        },
      ],
    ];
    const result = transformSchemaToFormGenerator(schema, false, true);
    expect(result).toEqual(expected);
  });

  it('should transform form editor schema to form generator schema without defaults when include defaults is false', () => {
    const schema = [
      {
        id: 'row1',
        fields: [
          {
            type: 'text',
            model: 'field1',
            label: 'Field 1',
            description: 'Field 1 description',
            defaultValue: 'Field 1 default value',
            layout: {
              columns: 6,
              offset: 0,
            },
            validation: {
              required: true,
            },
          },
          {
            type: 'textarea',
            model: 'field2',
            label: 'Field 2',
            description: 'Field 2 description',
            defaultValue: 'Field 2 default value',
            layout: {
              columns: 6,
              offset: 0,
            },
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
            type: 'checkbox',
            model: 'field3',
            label: 'Field 3',
            description: 'Field 3 description',
            defaultValue: true,
            layout: {
              columns: 4,
              offset: 0,
            },
            validation: {
              required: true,
            },
          },
          {
            type: 'select',
            model: 'field4',
            label: 'Field 4',
            description: 'Field 4 description',
            options: [
              {
                label: 'Option 1',
                value: 'option1',
                selectedByDefault: true,
              },
              {
                label: 'Option 2',
                value: 'option2',
              },
            ],
            defaultValue: 'option1',
            layout: {
              columns: 4,
              offset: 0,
            },
            validation: {
              required: true,
            },
          },
          {
            type: 'multiselect',
            model: 'field5',
            label: 'Field 5',
            description: 'Field 5 description',
            layout: {
              columns: 4,
              offset: 0,
            },
            validation: {
              required: true,
            },
            options: [
              {
                label: 'Option 1',
                value: 'option1',
                selectedByDefault: true,
              },
              {
                label: 'Option 2',
                value: 'option2',
              },
              {
                label: 'Option 3',
                value: 'option3',
              },
            ],
            defaultValue: ['option1'],
          },
        ],
      },
      {
        id: 'row3',
        fields: [
          {
            type: 'date',
            model: 'field6',
            label: 'Field 6',
            description: 'Field 6 description',
            defaultValue: '2024-01-01',
            layout: {
              columns: 4,
              offset: 0,
            },
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
            type: 'text',
            model: 'field7',
            label: 'Field 7',
            description: 'Field 7 description',
            layout: {
              columns: 12,
              offset: 0,
            },
            validation: {
              required: true,
            },
          },
        ],
      },
    ];
    const expected = [
      [
        {
          columnClass: 'col-md-6 offset-md-0',
          description: 'Field 1 description',
          label: 'Field 1',
          layout: {
            columns: 6,
            offset: 0,
          },
          model: 'field1',
          type: 'string',
          validation: {
            required: true,
          },
          disabled: false,
        },
        {
          columnClass: 'col-md-6 offset-md-0',
          description: 'Field 2 description',
          label: 'Field 2',
          layout: {
            columns: 6,
            offset: 0,
          },
          model: 'field2',
          type: 'textarea',
          validation: {
            required: true,
          },
          disabled: false,
        },
      ],
      [
        {
          columnClass: 'col-md-4 offset-md-0',
          description: 'Field 3 description',
          label: 'Field 3',
          layout: {
            columns: 4,
            offset: 0,
          },
          model: 'field3',
          type: 'boolean',
          validation: {
            required: true,
          },
          disabled: false,
        },
        {
          columnClass: 'col-md-4 offset-md-0',
          description: 'Field 4 description',
          label: 'Field 4',
          layout: {
            columns: 4,
            offset: 0,
          },
          model: 'field4',
          type: 'select',
          validation: {
            required: true,
          },
          options: [
            {
              text: 'Option 1',
              value: 'option1',
            },
            {
              text: 'Option 2',
              value: 'option2',
            },
          ],
          disabled: false,
        },
        {
          columnClass: 'col-md-4 offset-md-0',
          description: 'Field 5 description',
          label: 'Field 5',
          layout: {
            columns: 4,
            offset: 0,
          },
          model: 'field5',
          type: 'multiselect',
          validation: {
            required: true,
          },
          options: [
            {
              text: 'Option 1',
              value: 'option1',
            },
            {
              text: 'Option 2',
              value: 'option2',
            },
            {
              text: 'Option 3',
              value: 'option3',
            },
          ],
          disabled: false,
          defaultValue: [],
        },
      ],
      [
        {
          columnClass: 'col-md-4 offset-md-0',
          description: 'Field 6 description',
          label: 'Field 6',
          layout: {
            columns: 4,
            offset: 0,
          },
          model: 'field6',
          type: 'date',
          validation: {
            required: true,
          },
          disabled: false,
        },
      ],
      [
        {
          columnClass: 'col-md-12 offset-md-0',
          description: 'Field 7 description',
          label: 'Field 7',
          layout: {
            columns: 12,
            offset: 0,
          },
          model: 'field7',
          type: 'string',
          validation: {
            required: true,
          },
          disabled: false,
        },
      ],
    ];
    const result = transformSchemaToFormGenerator(schema, false, false);
    expect(result).toEqual(expected);
  });

  it('creates disabled fields when readOnly prop is true', () => {
    const schema = [
      {
        id: 'row1',
        fields: [
          {
            label: 'Field 1',
            model: 'field1',
            type: 'string',
            layout: {
              columns: 12,
              offset: 0,
            },
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
            label: 'Field 3',
            model: 'field3',
            type: 'boolean',
            layout: {
              columns: 12,
              offset: 0,
            },
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
            label: 'Field 4',
            model: 'field4',
            type: 'string',
            layout: {
              columns: 12,
              offset: 0,
            },
            validation: {
              required: true,
            },
          },
        ],
      },
    ];

    const expected = [
      [
        {
          columnClass: 'col-md-12 offset-md-0',
          label: 'Field 1',
          model: 'field1',
          type: 'string',
          layout: {
            columns: 12,
            offset: 0,
          },
          disabled: true,
          validation: {
            required: true,
          },
        },
      ],
      [
        {
          columnClass: 'col-md-12 offset-md-0',
          label: 'Field 3',
          model: 'field3',
          type: 'boolean',
          layout: {
            columns: 12,
            offset: 0,
          },
          disabled: true,
          validation: {
            required: true,
          },
        },
      ],
      [
        {
          columnClass: 'col-md-12 offset-md-0',
          label: 'Field 4',
          model: 'field4',
          type: 'string',
          layout: {
            columns: 12,
            offset: 0,
          },
          disabled: true,
          validation: {
            required: true,
          },
        },
      ],
    ];

    const result = transformSchemaToFormGenerator(schema, true);
    expect(result).toEqual(expected);
  });

  it('should add optional labels to optional properties', () => {
    const schema = [
      {
        id: 'row1',
        fields: [
          {
            label: 'Field 1',
            model: 'field1',
            type: 'string',
            layout: {
              columns: 12,
              offset: 0,
            },
          },
        ],
      },
    ];

    const expected = [
      [
        {
          columnClass: 'col-md-12 offset-md-0',
          label: 'Field 1 (optional)',
          model: 'field1',
          type: 'string',
          layout: {
            columns: 12,
            offset: 0,
          },
          disabled: false,
        },
      ],
    ];

    const result = transformSchemaToFormGenerator(schema);
    expect(result).toEqual(expected);
  });
});
