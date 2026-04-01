/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { cloneDeep } from 'lodash';
import {
  buildEventWorkflowPayload,
  buildEventWorkflowForm,
  buildEventCertificationPayload,
  buildEventCertificationForm,
} from './events';

const testWorkflowForm = {
  eventDetails: {
    eventDescription: 'testDescription',
    eventName: 'testName',
    eventOwners: [{
      _id: 'userId',
      givenName: undefined,
      profileImage: null,
      sn: undefined,
      userName: undefined,
    }],
    filter: {},
  },
  workflowDetails: {
    workflow: 'testWorkflow',
    workflowVariables: [],
  },
  status: 'active',
};

const testWorkflowEvent = {
  action: { type: 'orchestration', name: 'testWorkflow', parameters: {} },
  name: 'testName',
  condition: { version: 'v2', filter: {} },
  description: 'testDescription',
  entityType: 'user',
  mutationType: 'create',
  owners: [{ id: 'managed/user/userId' }],
  status: 'active',
};

const testCertificationForm = {
  eventDescription: 'testDescription',
  eventName: 'testName',
  eventOwners: [{
    _id: 'userId',
    givenName: undefined,
    profileImage: null,
    sn: undefined,
    userName: undefined,
  }],
  filter: {},
  status: 'active',
};

const testCertificationEvent = {
  action: {
    type: 'certification',
    template: { certDetails: 'true', id: 'testId' },
  },
  name: 'testName',
  condition: { version: 'v2', filter: {} },
  description: 'testDescription',
  entityType: 'user',
  mutationType: 'create',
  owners: [{ id: 'managed/user/userId' }],
  status: 'active',
};

describe('events', () => {
  it('buildEventWorkflowPayload creates event payload from form values', () => {
    const event = buildEventWorkflowPayload(testWorkflowForm, 'userCreate');

    expect(event).toEqual(testWorkflowEvent);
  });

  it('buildEventWorkflowForm gets form values from event payload', () => {
    const form = buildEventWorkflowForm(testWorkflowEvent);
    testWorkflowForm.workflowDetails.workflowVariables = [{ variable: '', value: '' }];
    expect(form).toEqual(testWorkflowForm);
  });

  it('buildEventCertificationPayload creates event payload from from values', () => {
    const event = buildEventCertificationPayload(testCertificationForm, { certDetails: 'true' }, 'testId', 'userCreate');
    expect(event).toEqual(testCertificationEvent);
  });

  it('buildEventCertificationForm gets form values from event payload', () => {
    const form = buildEventCertificationForm(testCertificationEvent);
    let expectedResult = cloneDeep(testCertificationForm);
    delete expectedResult.status;
    expectedResult = { FrEventDetails: expectedResult };
    expect(form).toEqual(expectedResult);
  });
});
