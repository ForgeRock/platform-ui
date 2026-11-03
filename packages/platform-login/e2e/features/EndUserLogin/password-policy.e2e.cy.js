/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  USER_POLICY_RESOURCE,
  deleteUserPolicy,
  getDefaultUserPolicy,
  putUserPolicy,
} from '@e2e/api/passwordPolicyApi.e2e';
import enduser from '../../persona/enduserSteps';

const REPEATED_CHARACTERS_POLICY_TEXT = 'Cannot contain more than 2 repeated consecutive characters';
const DICTIONARY_POLICY_TEXT = 'Cannot contain common passwords';

describe('Enduser login password policy', { tags: ['@cloud', '@forgeops'] }, () => {
  let defaultUserPolicy;

  before(() => {
    // Back up the original policy (cloud only) before anything modifies it
    if (Cypress.env('IS_FRAAS')) {
      cy.loginAsAdminCached().then(() => {
        getDefaultUserPolicy().then((result) => {
          expect(result.status).to.equal(200);
          defaultUserPolicy = result.body;
        });
        cy.logout();
      });
    }
  });

  after(() => {
    cy.loginAsAdminCached().then(() => {
      // Cloud: restore the pre-test policy. ForgeOps: DELETE the user-defined
      // config so the shipped defaults apply.
      if (Cypress.env('IS_FRAAS')) {
        if (defaultUserPolicy) {
          putUserPolicy(defaultUserPolicy).then((result) => {
            expect(result.status).to.equal(200);
          });
        }
      } else {
        deleteUserPolicy();
      }
    });
  });

  it('[TC-13105] Registration form displays all active password validation rules', () => {
    const minLengthPolicyText = 'Must be at least 10 characters long';
    const characterSetPolicyText = 'One lowercase character, one uppercase character, one number, one special character';
    const attributeValuePolicyText = 'Cannot match the value of First Name, Email, Last Name, Username';

    const passwordPolicy = (resource) => ({
      defaultPasswordStorageScheme: [{ _id: 'PBKDF2-HMAC-SHA256' }],
      type: 'password-policy',
      passwordAttribute: 'password',
      resourceCollection: `managed/${resource}`,
      validator: [
        {
          _id: `${resource}PasswordPolicy-length-based-password-validator`,
          type: 'length-based',
          enabled: true,
          // 10 differs from any environment default (IDM schema ships 8 on
          // ForgeOps), so the seeded rule renders a unique line
          minPasswordLength: 10,
          maxPasswordLength: 0,
        },
        {
          _id: `${resource}PasswordPolicy-repeated-characters-password-validator`,
          type: 'repeated-characters',
          caseSensitiveValidation: true,
          enabled: true,
          maxConsecutiveLength: 2,
        },
        {
          _id: `${resource}PasswordPolicy-dictionary-password-validator`,
          type: 'dictionary',
          caseSensitiveValidation: false,
          checkSubstrings: false,
          dictionaryFile: 'config/wordlist.txt',
          enabled: true,
          testReversedPassword: true,
        },
        {
          _id: `${resource}PasswordPolicy-attribute-value-password-validator`,
          type: 'attribute-value',
          enabled: true,
          matchAttribute: ['givenName', 'mail', 'sn', 'userName'],
          minSubstringLength: 5,
          checkSubstrings: true,
          testReversedPassword: true,
        },
        {
          _id: `${resource}PasswordPolicy-character-set-password-validator`,
          type: 'character-set',
          enabled: true,
          // 0: prefix = count the set, requirement governed by minCharacterSets
          // (same shape the admin Password Policy form writes)
          characterSet: [
            '0:abcdefghijklmnopqrstuvwxyz',
            '0:ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            '0:0123456789',
            '0:~!@#$%^&*()-_=+[]{}|;:,.<>/?"\'\\`',
          ],
          allowUnclassifiedCharacters: true,
          minCharacterSets: 4,
        },
      ],
    });

    // waitForCompletion closes the IDM propagation gap: without it the
    // journey's policy probes can be evaluated against the stale config
    const waitForCompletion = true;

    cy.loginAsAdminCached().then(() => {
      putUserPolicy(passwordPolicy(USER_POLICY_RESOURCE), undefined, waitForCompletion).then((result) => {
        expect(result.status).to.be.oneOf([200, 201]);
        cy.logout();
      });
    });

    enduser.passwordPolicy.interceptPasswordProbes();
    // Test uses the default Registration journey because it has the
    // validatePassword option enabled by default
    enduser.registration.navigate();

    const expectedPasswordPolicies = [
      minLengthPolicyText,
      characterSetPolicyText,
      attributeValuePolicyText,
      REPEATED_CHARACTERS_POLICY_TEXT,
      DICTIONARY_POLICY_TEXT,
    ];

    enduser.passwordPolicy.waitForPoliciesLoad();

    enduser.passwordPolicy.assertPoliciesVisibleAndUnique(expectedPasswordPolicies);
  });
});
