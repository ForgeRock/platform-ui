/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { capitalize, isEmpty } from 'lodash';

import i18n from '@/i18n';

/**
 * UI metadata for known event entity types, keyed by the config API's entity
 * `name`. Any entity missing from this map falls back to the generic default,
 * so a new config entity renders with no frontend code change (per-entity
 * icon/color polish is an accepted small addition per new entity).
 * @type {Object}
 */
const EVENT_ENTITY_META_MAP = {
  account: {
    icon: 'web_asset',
    iconClasses: 'color-blue bg-lightblue',
    plural: 'accounts',
  },
  agent: {
    icon: 'smart_toy',
    iconClasses: 'color-purple bg-lightpurple',
    plural: 'agents',
  },
  user: {
    icon: 'person_add_alt',
    mutationIcons: { update: 'manage_accounts' },
    iconClasses: 'text-success bg-lightgreen',
    plural: 'users',
  },
};

/**
 * Generic UI metadata used for entity types that are not present in
 * `EVENT_ENTITY_META_MAP`.
 * @type {Object}
 */
const DEFAULT_EVENT_ENTITY_META = {
  icon: 'event',
  iconClasses: 'text-muted bg-light',
};

/**
 * Builds the event payload for creating/updating a workflow event
 * @param {Object} form form values
 * @param {Object} entityContext `{ entityType, mutationType }` resolved from
 *   the selection (create flow) or the loaded event (edit flow)
 * @returns {Object} event payload, ready for POST/PUT
 */
export function buildEventWorkflowPayload(form, entityContext) {
  const { mutationType, entityType } = entityContext;
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

/**
 * Builds the event payload for creating/updating a certification event
 * @param {Object} eventDetails event details form values
 * @param {Object} certDetails certification template details
 * @param {String|null} certId template id when editing an existing template
 * @param {Object} entityContext `{ entityType, mutationType }` resolved from
 *   the selection (create flow) or the loaded event (edit flow)
 * @returns {Object} event payload, ready for POST/PUT
 */
export function buildEventCertificationPayload(eventDetails, certDetails, certId, entityContext) {
  const { mutationType, entityType } = entityContext;
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

/**
 * Composes an event trigger display name, e.g. "User Created": the entity
 * `displayName` from the event config API followed by the capitalized
 * mutation label from `governance.events.listView.<mutationType>`. Falls back
 * to the capitalized raw mutation type when that i18n key is missing
 * (vue-i18n returns the key path for missing keys, which is detected here),
 * so an unknown mutation never renders a raw i18n key path.
 * @param {String} displayName entity display name from the event config API
 * @param {String} mutationType raw mutation type, e.g. 'create'
 * @returns {String} composed trigger name, e.g. "User Created"
 */
export function getEventTriggerName(displayName, mutationType) {
  const key = `governance.events.listView.${mutationType}`;
  const translated = i18n.global.t(key);
  const mutationLabel = translated === key
    ? capitalize(mutationType)
    : capitalize(translated);
  return `${displayName} ${mutationLabel}`;
}

/**
 * Returns the UI metadata (icon, icon classes, plural label) for an event
 * entity type. Known entities have polished entries in
 * `EVENT_ENTITY_META_MAP`; any other entity returns the generic default so
 * new config entities render with no frontend code change.
 * @param {String} entityType entity `name` from the event config API
 * @param {String} [mutationType] mutation type, e.g. 'create', used to resolve
 *   per-mutation icon overrides
 * @returns {{icon: String, iconClasses: String, plural: String}} UI metadata
 */
export function getEventEntityMeta(entityType, mutationType = '') {
  const meta = EVENT_ENTITY_META_MAP[entityType];
  if (!meta) {
    return {
      icon: DEFAULT_EVENT_ENTITY_META.icon,
      iconClasses: DEFAULT_EVENT_ENTITY_META.iconClasses,
      plural: `${entityType}s`,
    };
  }
  return {
    icon: meta.mutationIcons?.[mutationType] || meta.icon,
    iconClasses: meta.iconClasses,
    plural: meta.plural,
  };
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
