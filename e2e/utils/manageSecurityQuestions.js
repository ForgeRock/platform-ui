/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { getSecurityQuestions, putSecurityQuestions } from '../api/securityQuestionsApi.e2e';

export function createSecurityQuestion(newSecurityQuestionsObject) {
  getSecurityQuestions().then((response) => {
    const patchedObject = response.body;
    const numberOfQuestions = Object.keys(patchedObject.questions).length;
    const newQuestions = {};
    Object.keys(newSecurityQuestionsObject).forEach((key, i) => {
      newQuestions[numberOfQuestions + 1 + i] = newSecurityQuestionsObject[key];
    });
    patchedObject.questions = { ...patchedObject.questions, ...newQuestions };
    putSecurityQuestions(patchedObject);
  });
}

export function setSecurityQuestionsObject(securityQuestionsObject) {
  putSecurityQuestions(securityQuestionsObject);
}

export function deleteAllSecurityQuestions() {
  getSecurityQuestions().then((response) => {
    const patchedObject = response.body;
    patchedObject.questions = {};
    putSecurityQuestions(patchedObject);
  });
}

export function setSecurityQuestionsSettings(settingsName, settingsValue) {
  const objectSettingsName = {
    'must define': 'minimumAnswersToDefine',
    'must answer': 'minimumAnswersToVerify',
  };
  getSecurityQuestions().then((response) => {
    const patchedObject = response.body;
    patchedObject[objectSettingsName[settingsName]] = settingsValue;
    putSecurityQuestions(patchedObject);
  });
}
