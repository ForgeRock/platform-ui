/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { isEmpty } from 'lodash';

export const typeMap = {
  userCreate: { mutationType: 'create', entityType: 'user' },
  userUpdate: { mutationType: 'update', entityType: 'user' },
};

export function buildEventWorkflowPayload(form, eventTrigger) {
  const { mutationType, entityType } = typeMap[eventTrigger];
  const owners = form.eventDetails.eventOwners
    .map((owner) => ({
      id: `managed/user/${owner._id}`,
    }));

  const workflowVariables = {};
  if (form.workflowDetails?.workflowVariables?.length) {
    form.workflowDetails.workflowVariables.forEach((variable) => {
      if (variable.variable?.length) workflowVariables[variable.variable] = variable.value;
    });
  }

  const event = {
    action: {
      type: 'orchestration',
      name: form.workflowDetails.workflow,
      parameters: workflowVariables,
    },
    name: form.eventDetails.eventName,
    condition: {
      version: 'v2',
      filter: form.eventDetails.filter,
    },
    description: form.eventDetails.eventDescription,
    entityType,
    mutationType,
    owners,
    status: form.status,
  };

  return event;
}

export function buildEventWorkflowForm(event) {
  const owners = event.owners
    .map((owner) => ({
      _id: owner.id.split('/').pop(),
      profileImage: null,
      givenName: owner.givenName,
      sn: owner.sn,
      userName: owner.userName,
    }));

  let workflowVariables = [{ variable: '', value: '' }];
  const parameters = event.action?.parameters;

  if (parameters && !isEmpty(parameters)) {
    const variables = [];
    Object.keys(parameters).forEach((key) => {
      variables.push({ variable: key, value: parameters[key] });
    });
    workflowVariables = variables;
  }

  const formValues = {
    eventDetails: {
      eventName: event.name,
      eventDescription: event.description,
      eventOwners: owners,
      filter: event.condition?.filter || {},
    },
    workflowDetails: {
      workflow: event.action.name,
      workflowVariables,
    },
    status: event.status,
  };
  return formValues;
}

export function buildEventCertificationPayload(eventDetails, certDetails, certId, eventTrigger) {
  const { mutationType, entityType } = typeMap[eventTrigger];
  const owners = eventDetails.eventOwners
    .map((owner) => ({
      id: `managed/user/${owner._id}`,
    }));

  const event = {
    action: {
      type: 'certification',
      template: {
        ...certDetails,
      },
    },
    name: eventDetails.eventName,
    condition: {
      version: 'v2',
      filter: eventDetails.filter,
    },
    description: eventDetails.eventDescription,
    entityType,
    mutationType,
    owners,
    status: eventDetails.status,
  };
  if (certId) event.action.template.id = certId;
  return event;
}

export function buildEventCertificationForm(event) {
  const owners = event.owners
    .map((owner) => ({
      _id: owner.id.split('/').pop(),
      profileImage: null,
      givenName: owner.givenName,
      sn: owner.sn,
      userName: owner.userName,
    }));

  const formValues = {
    FrEventDetails: {
      eventName: event.name,
      eventDescription: event.description,
      eventOwners: owners,
      filter: event.condition?.filter || {},
    },
  };
  return formValues;
}

export function getNameFromDisplayName(displayName) {
  const igaParams = [
    /{{(userDisplayName)}}/g,
    /{{(eventName)}}/g,
    /{{(userId)}}/g,
  ];

  let name = displayName;
  igaParams.forEach((regex) => {
    name = name.replace(regex, '{{IGA_PARAM_$1_IGA_PARAM}}');
  });
  return name;
}

export function getDisplayNamefromName(name) {
  const igaParams = [
    /{{IGA_PARAM_(userDisplayName)_IGA_PARAM}}/g,
    /{{IGA_PARAM_(eventName)_IGA_PARAM}}/g,
    /{{IGA_PARAM_(userId)_IGA_PARAM}}/g,
  ];

  let displayName = name;
  igaParams.forEach((regex) => {
    displayName = displayName.replace(regex, '{{$1}}');
  });
  return displayName;
}
