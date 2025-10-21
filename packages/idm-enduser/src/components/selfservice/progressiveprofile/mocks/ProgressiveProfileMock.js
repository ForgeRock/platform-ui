/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const KBADetails = {
  properties: {
    kba: {
      type: 'array',
      minItems: 2,
      items: {
        type: 'object',
        oneOf: [
          {
            $ref: '#/definitions/systemQuestion',
          },
          {
            $ref: '#/definitions/userQuestion',
          },
        ],
      },
      questions: [
        {
          question: {
            en: "What's your favorite color?",
            en_GB: 'What is your favourite colour?',
            fr: 'Quelle est votre couleur préférée?',
          },
          id: '1',
        },
        {
          question: {
            en: 'Who was your first employer?',
            fr: 'FR Who was your first employer',
          },
          id: '2',
        },
      ],
    },
  },
};

export const UserDetails = {
  attributes: [
    {
      name: 'city',
      isRequired: false,
      schema: {
        type: 'string',
        title: 'City',
        description: 'City',
      },
      value: 'initialValue',
    },
  ],
};

export const basicProfileStage = {
  requirements: {
    description: 'Attribute Details',
    type: 'object',
    properties: {},
    attributes: [
      {
        name: 'city',
        isRequired: false,
        schema: {
          type: 'string',
          title: 'City',
          description: 'City',
          viewable: true,
          userEditable: true,
          usageDescription: null,
          isPersonal: false,
          policies: [
            {
              policyId: 'minimum-length',
              params: {
                minLength: 1,
              },
            },
            {
              policyId: 'maximum-length',
              params: {
                maxLength: 255,
              },
            },
          ],
        },
        value: 'a',
      },
    ],
    uiConfig: {
      displayName: 'test',
      purpose: 'test',
      buttonText: 'Save',
    },
  },
  tag: 'initial',
  type: 'conditionaluser',
};
