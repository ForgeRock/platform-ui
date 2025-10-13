/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default {
  tag: 'initial',
  type: 'allInOneRegistration',
  requirements: {
    stages: [
      'termsAndConditions',
      'captcha',
      'kbaSecurityAnswerDefinitionStage',
      'consent',
      'idmUserDetails',
    ],
    consent: '<strong> I CONSENT </strong>',
    terms: '<strong> THESE ARE TERMS AND CONDITIONS </strong>',
    properties: {
      response: {},
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
    registrationPreferences: {
      updates: {
        description: 'Send me news and updates',
        type: 'boolean',
      },
      marketing: {
        description: 'Send me special offers and services',
        type: 'boolean',
      },
    },
    registrationProperties: {
      properties: {
        userName: {
          title: 'Username',
          description: 'Username',
          type: 'string',
          policies: [
            {
              policyId: 'valid-username',
            },
            {
              policyId: 'cannot-contain-characters',
              params: {
                forbiddenChars: ['/'],
              },
            },
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
        givenName: {
          title: 'First Name',
          description: 'First Name',
          type: 'string',
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
        sn: {
          title: 'Last Name',
          description: 'Last Name',
          type: 'string',
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
        mail: {
          title: 'Email Address',
          description: 'Email Address',
          type: 'string',
          policies: [
            {
              policyId: 'valid-email-address-format',
            },
            {
              policyId: 'maximum-length',
              params: {
                maxLength: 255,
              },
            },
          ],
        },
      },
      required: ['userName', 'givenName', 'mail'],
    },
  },
};
