/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { get } from 'lodash';
import dayjs from 'dayjs';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import i18n from '@/i18n';
import { resolveAiAgentSource } from './useAgentConfig';
import agentConstants from './agentConstants';

/**
 * Get the badge variant for various account types
 * @returns badge variant
 */
export function getAgentTypeVariant(accountType) {
  if (!accountType) return 'light';
  const type = accountType.toLowerCase();
  if (type === agentConstants.ACCOUNT_TYPES.DEFAULT) {
    return 'light';
  }
  if (type === agentConstants.ACCOUNT_TYPES.MACHINE) {
    return 'warning';
  }
  return 'light';
}

/**
 * Get the display name from an account
 * @param {object} account Account object
 * @returns Display name
 */
export function getAgentDisplayName(account) {
  return get(account, 'descriptor.idx./account.displayName') || account?.__NAME__ || blankValueIndicator;
}

/**
 * Tab label for an agent template: its displayName, else the tabs.* translation
 * for the template id (vue-i18n echoes the key when no locale carries it).
 * @param {Object} template - Agent template from /agent/config (id, optional displayName)
 * @returns {String} The label to show on the tab
 */
export function getAgentTemplateLabel(template) {
  if (!template?.id) return '';
  if (template.displayName) return template.displayName;
  return i18n.global.t(`governance.agents.tabs.${template.id.replace(/\./g, '-')}`);
}

// Kept uppercase / expanded when generating property display names,
// e.g. agentId -> "Agent ID", envVarKeys -> "Environment Variable Keys".
const UPPERCASE_WORDS = new Set(['id', 'arn', 'uri', 'url', 'mcp', 'api']);
const EXPANDED_WORDS = { env: 'Environment', var: 'Variable' };

/**
 * Converts an objectClass attribute name (camelCase) into a display name.
 * @param {String} name attribute name
 * @returns {String} display name
 */
function attributeDisplayName(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter((word, index) => !(index === 0 && word.toLowerCase() === 'is'))
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower in EXPANDED_WORDS) return EXPANDED_WORDS[lower];
      if (UPPERCASE_WORDS.has(lower)) return lower.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// The example payload represents datetimes as plain strings, so normalize them.
const TYPE_OVERRIDES = { datetime: 'string' };

/**
 * Converts a single objectClass attribute into an application objectTypes property entry.
 * @param {Object} attribute attribute from the objectClass schema
 * @param {Object} options computed placement/requirement for this attribute
 * @param {Number} options.order display order of the property
 * @param {Boolean} options.required whether the property is required
 * @param {Boolean} options.isPrimaryKey marks the property as the record's primary key (privilege only)
 * @param {Boolean} options.isDisplay marks the property as the record's display name (privilege only)
 * @param {Boolean} options.isUserSpecific marks the record id attribute
 * @returns {Object} property entry for the objectTypes payload
 */
function buildObjectTypeProperty(attribute, {
  order, required, isPrimaryKey = false, isDisplay = false, isUserSpecific = false,
}) {
  const property = {
    type: attribute.multiValued ? 'array' : (TYPE_OVERRIDES[attribute.type] || attribute.type),
    required,
    displayName: attributeDisplayName(attribute.name),
    order,
  };
  if (attribute.multiValued) {
    property.items = { type: TYPE_OVERRIDES[attribute.type] || attribute.type };
  }
  if (isPrimaryKey || isUserSpecific) {
    property.flags = ['NOT_UPDATEABLE'];
  }
  if (isPrimaryKey) {
    property.isPrimaryKey = true;
  }
  if (isDisplay) {
    property.isDisplay = true;
  }
  if (isUserSpecific) {
    property.userSpecific = true;
  }
  return property;
}

/**
 * The "Agent" objectTypes entry from the subtype's __ACCOUNT__ objectClass;
 * privilege sources promote agentId/agentName.
 * @param {Object} subtypeSchema subtype entry from the /agent/config sources object
 * @param {String} source source key (e.g. 'privilege')
 * @returns {Object} objectTypes array entry with id 'Agent'
 */
export function buildAgentObjectType(subtypeSchema, source) {
  const accountClass = subtypeSchema?.objectClasses?.find((objectClass) => objectClass.name === '__ACCOUNT__');
  const attributes = accountClass?.attributes || [];
  const { idAttribute, nameAttribute } = accountClass || {};

  const isPrivilege = source === 'privilege';
  const promotedAttributes = isPrivilege ? ['agentId', 'agentName'] : [];
  const requiredAttributes = new Set(attributes.slice(0, 5).map(({ name }) => name));
  if (isPrivilege) {
    promotedAttributes.forEach((name) => requiredAttributes.add(name));
  }

  // Promotion order: agentId, agentName (privilege only), then remaining schema
  // attributes in schema order, then the name/idAttribute pair at the end.
  const orderedNames = [...promotedAttributes];
  attributes.forEach(({ name }) => {
    if (name !== idAttribute && name !== nameAttribute && !promotedAttributes.includes(name)) {
      orderedNames.push(name);
    }
  });
  orderedNames.push(nameAttribute, idAttribute);

  const properties = {};
  orderedNames.forEach((name, index) => {
    const attribute = attributes.find(({ name: attributeName }) => attributeName === name);
    if (!attribute) return;
    properties[name] = buildObjectTypeProperty(attribute, {
      order: index + 1,
      required: requiredAttributes.has(name),
      isPrimaryKey: isPrivilege && name === 'agentId',
      isDisplay: isPrivilege && name === 'agentName',
      isUserSpecific: name === idAttribute,
    });
  });

  return {
    id: 'Agent',
    type: 'account',
    properties,
    name: 'Agent',
  };
}

// Gate for the agent source form's API-secret requirement. Tests asserting the
// secret gate read this flag and skip accordingly.
export const IS_AGENT_SECRET_REQUIRED = true;

/**
 * ingestion.connector.connection block from the form's values; non-empty fields
 * only (blanks mean tenant default). apiSecret is write-only — see the design doc.
 * @param {Object} connectionValues form values keyed by connection field
 * @returns {Object} connection block containing only the non-empty fields
 */
export function buildAgentConnection(connectionValues = {}) {
  const connectionFields = [
    'controllerUrl', 'envId', 'userId', 'apiKey', 'namespace', 'apiSecret', 'apiSecretRef',
  ];
  const connection = {};
  connectionFields.forEach((field) => {
    const value = connectionValues[field];
    if (typeof value === 'string' && value.trim() !== '') {
      connection[field] = value.trim();
    }
  });
  return connection;
}

/**
 * Create payload for one subtype of a discovery source; aiAgentSource is the id
 * of the template claiming the '<source>.<subtype>' pair, else the subtype key.
 * @param {String} source source key (e.g. 'privilege')
 * @param {String} subtypeKey subtype key within the source (e.g. 'agentcore')
 * @param {Object} subtypeSchema subtype entry from the /agent/config sources object
 * @param {Array} ownerIds owner user ids for the application
 * @param {Object} [connectionValues] optional ingestion.connector.connection form values
 * @param {Object} [agentTemplateSourceArrays] per-template id -> sources array from the config
 * @returns {Object} createUnmanagedApplication payload
 */
export function buildAgentApplicationPayload(source, subtypeKey, subtypeSchema, ownerIds, connectionValues, agentTemplateSourceArrays) {
  const accountClass = subtypeSchema?.objectClasses?.find((objectClass) => objectClass.name === '__ACCOUNT__');
  const displayName = accountClass?.nativeName || subtypeKey;
  return {
    name: displayName,
    description: displayName,
    ownerIds,
    icon: '',
    datasourceId: 'disconnected',
    isDisconnected: true,
    authoritative: false,
    aiAgentSource: resolveAiAgentSource(agentTemplateSourceArrays, source, subtypeKey),
    ingestion: {
      connector: {
        type: source,
        subtype: subtypeKey,
        connection: buildAgentConnection(connectionValues),
      },
    },
    objectTypes: [buildAgentObjectType(subtypeSchema, source)],
  };
}

/**
 * Full-record update payload. The server purges the stored credential if the
 * payload drops apiSecretRef, so the app's own derived ref is echoed back.
 * @param {Object} existingApp the application's full record as returned by the API
 * @param {Object} connectionValues form values keyed by connection field
 * @returns {Object} updateApplication payload
 */
export function buildAgentUpdatePayload(existingApp, connectionValues) {
  const connection = buildAgentConnection(connectionValues);
  const existingRef = existingApp?.ingestion?.connector?.connection?.apiSecretRef;
  if (connection.apiSecret === undefined && typeof existingRef === 'string' && existingRef.startsWith('secret:')) {
    connection.apiSecretRef = existingRef;
  }
  return {
    ...existingApp,
    ingestion: {
      ...existingApp.ingestion,
      connector: {
        ...existingApp.ingestion?.connector,
        connection,
      },
    },
  };
}

/**
 * Account-attribute key a mapping entry points at: "icf" (template-matched),
 * "privilege" (discovered), legacy "system".
 * @param {Object} entry mapping entry of shape { iga, icf, privilege } (or legacy { iga, system })
 * @param {Object} application the agent's application object
 * @returns {String|undefined} the attribute key to read off the account record
 */
export function getMappingSystemKey(entry, application) {
  if (Object.prototype.hasOwnProperty.call(entry, 'icf')
    || Object.prototype.hasOwnProperty.call(entry, 'privilege')) {
    return application?.templateName ? entry.icf : entry.privilege;
  }
  return entry.system;
}

/**
 * Resolves the schema that drives the Agent Properties display: the /agent/config
 * response's top-level "schema" property when present, else the static backup.
 * @param {Array|undefined} configSchema the config response's schema property
 * @returns {Array} schema entries of shape { key, displayName, type }
 */
export function resolveAgentSchema(configSchema) {
  return Array.isArray(configSchema) && configSchema.length ? configSchema : agentConstants.AGENT_SCHEMA;
}

/**
 * Formats a schema-typed value for display (booleans localized, dates formatted,
 * arrays comma-joined, objects JSON).
 * @param {*} value raw record value
 * @param {String} type schema entry type ('string', 'date', 'boolean', 'string[]', ...)
 * @returns {String} formatted display value
 */
export function formatAgentPropertyValue(value, type) {
  if (value == null || value === '') return '';
  if (type === 'boolean') return i18n.global.t(value ? 'common.true' : 'common.false');
  if (type === 'date') return dayjs(value).format('MMM D, YYYY h:mm A');
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Builds the flat { key: displayValue } object the ObjectProperties card renders,
 * in schema order, joining each schema key to its account attribute via the mapping.
 * @param {Object} record the agent account record
 * @param {Array} schema entries of shape { key, displayName, type }
 * @param {Array} [mapping] entries of shape { iga, icf, privilege } (or legacy { iga, system })
 * @param {Object} [application] the agent's application object
 * @returns {Object} display map keyed by schema key, in schema order
 */
export function buildAgentPropertiesDisplay(record, schema, mapping = [], application = {}) {
  const mappingByIga = new Map(mapping.map((entry) => [entry.iga, entry]));
  return schema.reduce((acc, { key, type }) => {
    const entry = mappingByIga.get(key);
    const attribute = entry ? getMappingSystemKey(entry, application) : key;
    acc[key] = formatAgentPropertyValue(attribute ? get(record, attribute) : undefined, type);
    return acc;
  }, {});
}

/**
 * Builds the { key: displayName } label map the ObjectProperties card uses, from
 * the same schema. Order follows the schema array.
 * @param {Array} schema entries of shape { key, displayName, type }
 * @returns {Object} map of schema key -> display name
 */
export function buildAgentPropertiesSchema(schema) {
  return schema.reduce((acc, { key, displayName }) => {
    acc[key] = displayName;
    return acc;
  }, {});
}

/**
 * Classification task saved with every discovery-created agent application so its
 * accounts are immediately classified accountType = 'agent' without manual setup.
 */
export const AGENT_CLASSIFICATION_TASK = {
  type: 'applicationBulkOperation',
  name: 'Agent Classification',
  options: {
    readBatchSize: 500,
  },
  recurring: false,
  taskData: {
    targets: [
      { objectType: 'account' },
    ],
    action: {
      type: 'updateGlossary',
      overwrite: true,
      mappings: [
        {
          target: 'accountType',
          source: { type: 'static', value: 'agent' },
        },
      ],
    },
  },
};
