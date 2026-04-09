/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  capitalize,
  cloneDeep,
  get,
  isEmpty,
  isNil,
} from 'lodash';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import i18n from '@/i18n';

/**
 * Obtains and parses the information from the column
 * @param {Object} data object with all the information in the column
 * @returns {String} parsed column data
 */
export function getCellData(data) {
  if (isEmpty(data)) {
    return blankValueIndicator;
  }
  const {
    field: {
      category,
      key,
    },
    item,
  } = data;
  const isGlossaryAttribute = key.includes('glossary');
  const sanitizedKey = isGlossaryAttribute
    ? key.split('.')[1]
    : key;
  // if it is a glossary attribute the correct path is used
  const attributePath = isGlossaryAttribute
    ? `glossary.idx./${category}.${sanitizedKey}`
    : `${category}.${sanitizedKey}`;
  const columnData = get(item, attributePath);
  // only returns blank value indicator if the column data is null or undefined
  return isNil(columnData) ? blankValueIndicator : columnData;
}

/**
 * Parse the column information to a format to be rendered by the component.
 * @param {Object} columnItem all column information
 * @param {String} category category name
 * @returns {Object} parsed column object
 */
function parseColumn(columnItem, category) {
  return {
    ...columnItem,
    category,
    class: 'text-truncate fr-access-cell',
    label: `${capitalize(category)} ${columnItem.displayName}`,
    noCategoryLabel: columnItem.displayName,
    show: false,
    sortable: false,
  };
}

/**
 * Returns all columns by category in the format to be rendered in the component
 * @param {Object} rawColumns All column information in the format returned by the backend
 * @returns {Object} object with all comuns by category
 */
export function formatColumns(rawColumns) {
  if (isEmpty(rawColumns)) {
    return {
      user: [],
      application: [],
      entitlement: [],
      account: [],
      role: [],
    };
  }
  const {
    user,
    application,
    entitlement,
    account,
    role,
  } = rawColumns;

  return {
    user: user?.map((column) => parseColumn(column, 'user'))
      ?.filter((column) => !column.label.includes('Generic')) || [],
    application: application?.map((column) => parseColumn(column, 'application')) || [],
    entitlement: entitlement?.map((column) => parseColumn(column, 'entitlement')) || [],
    account: account?.map((column) => parseColumn(column, 'account')) || [],
    role: role?.map((column) => parseColumn(column, 'role')) || [],
  };
}

const OOTBColumns = {
  user: {
    key: 'user',
    label: i18n.global.t('governance.certificationTask.user'),
    sortable: true,
    category: 'user',
    class: 'text-truncate fr-access-cell',
    show: true,
    showFor: ['accounts', 'entitlements', 'roles'],
    exportFields: ['user.userName', 'user.givenName', 'user.sn', 'user.mail'],
  },
  role: {
    key: 'role',
    label: i18n.global.t('common.role'),
    sortable: true,
    category: 'role',
    class: 'text-truncate fr-access-cell',
    show: true,
    showFor: ['roles'],
    exportFields: ['role.name'],
  },
  application: {
    key: 'application',
    label: i18n.global.t('governance.certificationTask.application'),
    sortable: true,
    category: 'application',
    class: 'text-truncate fr-access-cell',
    show: true,
    showFor: ['accounts', 'entitlements', 'entitlementComposition'],
    exportFields: ['application.name'],
  },
  entitlement: {
    key: 'entitlement',
    label: i18n.global.t('governance.certificationTask.entitlement'),
    sortable: true,
    category: 'entitlement',
    class: 'text-truncate fr-access-cell',
    show: true,
    showFor: ['entitlements', 'accountEntitlement', 'entitlementComposition'],
    exportFields: ['descriptor.idx./entitlement.displayName'],
  },
  account: {
    key: 'account',
    label: i18n.global.t('governance.certificationTask.account'),
    sortable: false,
    category: 'account',
    class: 'text-truncate fr-access-cell',
    show: true,
    showFor: ['accounts', 'entitlements'],
    exportFields: ['descriptor.idx./account.displayName'],
  },
  prediction: {
    key: 'prediction',
    label: i18n.global.t('governance.certificationTask.recommended'),
    sortable: true,
    category: 'review',
    class: 'w-175px text-truncate fr-access-cell',
    show: true,
    showFor: ['entitlements', 'accountEntitlement'],
    autoId: true,
    exportFields: ['prediction.confidence'],
  },
  flags: {
    key: 'flags',
    label: i18n.global.t('governance.certificationTask.flags'),
    sortable: false,
    category: 'review',
    class: 'w-175px text-truncate fr-access-cell',
    show: true,
    showFor: ['accounts', 'entitlements', 'roles', 'accountEntitlement', 'entitlementComposition'],
  },
  comments: {
    key: 'comments',
    label: i18n.global.t('governance.certificationTask.comments'),
    sortable: false,
    category: 'review',
    class: 'w-140px fr-access-cell',
    show: true,
    showFor: ['accounts', 'entitlements', 'roles', 'accountEntitlement', 'entitlementComposition'],
  },
  actions: {
    key: 'actions',
    class: 'w-200px cert-actions border-left fr-access-cell fr-no-resize sticky-right',
    label: i18n.global.t('common.actions'),
    sortable: false,
    show: true,
    showFor: ['accounts', 'entitlements', 'roles', 'accountEntitlement', 'entitlementComposition'],
  },
};

/**
 * Retrieves a copy of the column data from OOTBColumns that matches the specified category and key.
 *
 * @param {string} category - The category to match in the column data.
 * @param {string} key - The key to match in the column data.
 * @returns {Object|null} A shallow copy of the matching column data object, or null if no match is found.
 */
function getOOTBColumn(category, key) {
  const columnData = Object.values(OOTBColumns).find((col) => (col.key === key && col.category === category));
  return columnData ? { ...columnData } : null;
}

/**
 * Retrieves a column object from a list of column categories based on the specified category and key.
 *
 * @param {Array<Object>} columnCategories - The array of column category objects.
 * @param {string} category - The name of the category to search within.
 * @param {string} key - The key of the column to find within the specified category.
 * @returns {Object|null} A shallow copy of the found column object, or null if not found.
 */
function getFilterPropertyColumn(columnCategories, category, key) {
  const columnData = columnCategories
    ?.find((group) => (group.name === category))?.items
    ?.find((col) => (col.key === key));
  return columnData ? { ...columnData } : null;
}

/**
 * Generates a list of custom column definitions based on provided columns and column categories.
 *
 * For each column string (in the format "category.key"), attempts to retrieve its definition
 * from OOTB (Out-Of-The-Box) columns or filter property columns. If not found, returns a default
 * column definition. Always appends an "actions" column at the end.
 *
 * @param {string[]} columns - Array of column identifiers in the format "category.key".
 * @param {Object} columnCategories - Object containing column category definitions.
 * @returns {Object[]} Array of column definition objects, each with properties such as key, label, sortable, class, category, and show.
 */
function getCustomColumns(columns, columnCategories) {
  const customColumns = columns.map((column) => {
    const parsedString = column.split('.');
    const category = parsedString[0];
    const key = parsedString.slice(1).join('.');

    // Get column if it is an OOTB column or Filter Property column
    const colData = getOOTBColumn(category, key) || getFilterPropertyColumn(columnCategories, category, key);
    // If the column is not found in OOTB or custom columns, return a default column
    return colData || {
      key,
      label: key,
      sortable: false,
      class: 'text-truncate fr-access-cell',
      category,
      show: true,
    };
  });

  // This column is always shown
  customColumns.push({ ...OOTBColumns.actions });

  // Remove column metadata and set show to true
  customColumns.forEach((column) => {
    column.show = true;
    delete column.showFor;
  });

  return customColumns;
}

/**
 * Retrieves the initial fields configuration for a certification table based on the provided parameters.
 *
 * @param {string} grantType - The type of grant (e.g., 'accounts', 'entitlements', 'roles').
 * @param {string|null} entitlementUserId - The ID of the entitlement user, if applicable.
 * @param {boolean} showAccountDrilldown - Flag indicating whether account drilldown is enabled.
 * @param {Object} customColumnConfig - Custom column configuration object keyed by grant type.
 * @param {Object} columnCategories - Categories of columns used for custom column filtering.
 * @param {Object} autoIdSettings - IGA Config for auto id recommendations
 * @returns {Array<Object>} An array of field objects representing the initial columns for the certification table.
 */
export function getInitialColumns(grantType, entitlementUserId, showAccountDrilldown, customColumnConfig, columnCategories, autoIdSettings) {
  const accountEntitlement = !!entitlementUserId;

  if (!showAccountDrilldown && !accountEntitlement && customColumnConfig?.[grantType]?.length) {
    return getCustomColumns(customColumnConfig[grantType], columnCategories);
  }

  const fields = [
    { ...OOTBColumns.role },
    { ...OOTBColumns.user },
    { ...OOTBColumns.application },
    { ...OOTBColumns.entitlement },
    { ...OOTBColumns.account },
    { ...OOTBColumns.prediction },
    { ...OOTBColumns.flags },
    { ...OOTBColumns.comments },
    {
      key: 'actions',
      class: `${showAccountDrilldown ? 'w-230px' : 'w-200px'} cert-actions border-left fr-access-cell fr-no-resize sticky-right`,
      label: i18n.global.t('common.actions'),
      sortable: false,
      show: true,
      showFor: ['accounts', 'entitlements', 'roles', 'accountEntitlement', 'entitlementComposition'],
    },
  ];

  const type = accountEntitlement ? 'accountEntitlement' : grantType || 'accounts';
  const autoIdEnabled = autoIdSettings?.enableAutoId;
  const filteredFields = fields.filter((field) => field.showFor.includes(type) && (autoIdEnabled || !field.autoId));
  filteredFields.forEach((field) => {
    delete field.showFor;
    delete field.autoId;
  });

  return filteredFields;
}

const categories = [
  {
    name: 'review',
    header: i18n.global.t('governance.certificationTask.columns.review'),
    showFor: ['accounts', 'entitlements', 'roles'],
    items: [
      { ...OOTBColumns.prediction },
      { ...OOTBColumns.flags },
      { ...OOTBColumns.comments },
    ],
  },
  {
    name: 'user',
    header: i18n.global.t('governance.certificationTask.columns.user'),
    showFor: ['accounts', 'entitlements', 'roles'],
    items: [
      { ...OOTBColumns.user },
    ],
  },
  {
    name: 'application',
    header: i18n.global.t('governance.certificationTask.columns.application'),
    showFor: ['accounts', 'entitlements'],
    items: [
      { ...OOTBColumns.application },
    ],
  },
  {
    name: 'entitlement',
    header: i18n.global.t('governance.certificationTask.columns.entitlement'),
    showFor: ['entitlements'],
    items: [
      { ...OOTBColumns.entitlement },
    ],
  },
  {
    name: 'role',
    header: i18n.global.t('common.role'),
    showFor: ['roles'],
    items: [
      { ...OOTBColumns.role },
    ],
  },
  {
    name: 'account',
    header: i18n.global.t('governance.certificationTask.columns.account'),
    showFor: ['accounts', 'entitlements'],
    items: [
      { ...OOTBColumns.account },
    ],
  },
];

/**
 * Retrieves and customizes field categories based on the specified grant type and filter properties.
 *
 * @param {string} grantType - The type of grant used to filter relevant categories.
 * @param {Object} filterProperties - An object containing properties to format into additional columns.
 * @param {Object} autoIdSettings - IGA Config for auto id recommendations
 * @returns {Array<Object>} - An array of category objects customized for the specified grant type.
 */
export function getAllColumnCategories(grantType = 'accounts', filterProperties, autoIdSettings) {
  const filterPropertyColumns = formatColumns(filterProperties);
  const clonedCategories = cloneDeep(categories);
  const autoIdEnabled = autoIdSettings?.enableAutoId;

  // only include columns relevant to the grant type
  const categoriesForGrantType = clonedCategories.filter((category) => category.showFor.includes(grantType));

  // Add customized columns to the categories
  categoriesForGrantType.forEach((category) => {
    if (filterPropertyColumns[category.name]) {
      category.items = [
        ...category.items,
        ...filterPropertyColumns[category.name],
      ];
    }
    category.items = category.items.filter((item) => autoIdEnabled || !item.autoId);
    category.items.forEach((item) => {
      delete item.autoId;
    });
    delete category.showFor;
  });

  return categoriesForGrantType;
}

/**
 * Updates the `show` property of items in each category based on selected columns.
 *
 * @param {Array<Object>} columnCategories - The array of category objects, each containing an `items` array.
 * @param {Array<Object>} selectedColumns - The array of selected column objects, each with a `key` property.
 * @returns {Array<Object>} A deep-cloned array of categories with updated `show` properties for each item.
 */
export function setSelectedCategories(columnCategories, selectedColumns) {
  const clonedCategories = cloneDeep(columnCategories);
  clonedCategories.forEach((category) => {
    category.items.forEach((item) => {
      item.show = selectedColumns.findIndex((col) => col.key === item.key) !== -1;
    });
  });
  return clonedCategories;
}

// Default fields to always export with certification items
const DEFAULT_EXPORT_FIELDS = [
  'decision.certification.decision',
  'decision.certification.status',
  'decision.certification.decisionDate',
  'decision.certification.decisionBy.userName',
  'decision.certification.completionDate',
  'decision.certification.completedBy.userName',
  'id',
];

/**
 * Converts an array of active column strings (in the format "category.key") to an array of query field strings for export.
 *
 * @param {Array<string>} activeColumnStrings - An array of active column strings (category + key).
 * @returns {Array<string>} An array of strings representing the query fields corresponding to the active columns.
 */
export function convertColumnsToQueryFields(activeColumnStrings) {
  const columnFields = activeColumnStrings.flatMap((columnString) => {
    const categoryIndex = columnString.indexOf('.');
    const category = columnString.substring(0, categoryIndex);
    const key = columnString.substring(categoryIndex + 1);

    const ootbColumn = Object.values(OOTBColumns).find((c) => `${c.category}.${c.key}` === columnString);

    if (ootbColumn) {
      // If it's an OOTB column, return exportFields if they exist, otherwise return empty array
      // this takes a field formatted in the UI e.g. "user" and converts it to the appropriate query fields for export e.g. ["user.userName", "user.givenName", "user.sn", "user.mail"]
      return ootbColumn.exportFields || [];
    }

    if (['selector'].includes(key)) { return []; } // Ignore virtual fields

    // If it's not an OOTB column, return category.key which is the value to query for (handling glossary special case)
    if (key.startsWith('glossary.')) {
      const glossaryKey = key.substring('glossary.'.length);
      return `glossary.idx./${category}.${glossaryKey}`;
    }
    return columnString;
  });

  // Always include default export fields
  columnFields.push(...DEFAULT_EXPORT_FIELDS);
  return columnFields;
}

/**
 * Generates a mapping of field keys to their corresponding labels so that the export file can have display friendly headers
 *
 * @param {Array<Object>} currentColumns - An array of column objects representing the current columns.
 * @returns {Object} An object mapping field keys to their labels.
 */
function getLabelsForFields(currentColumns) {
  const fieldLabels = {};
  const allColumns = { ...OOTBColumns, ...currentColumns };
  // Iterate over all OOTB and currently selected columns
  Object.values(allColumns).forEach((col) => {
    // Add main field label
    fieldLabels[`${col.category}.${col.key}`] = col.label;

    // If present, add export field labels
    if (col.exportFields) {
      if (col.exportFields.length === 1) {
        // Use the main label for fields with single exports
        fieldLabels[col.exportFields[0]] = col.label;
      } else {
        // For fields with multiple export fields, create labels based on the main label and the specific export field
        col.exportFields.forEach((exportField) => {
          fieldLabels[exportField] = i18n.global.t(`governance.certificationTask.exportModal.defaultColumns.${exportField.replace(/\./g, '_')}`);
        });
      }
    }
  });

  // Add labels for default export fields
  DEFAULT_EXPORT_FIELDS.forEach((exportField) => {
    if (!fieldLabels[exportField]) {
      fieldLabels[exportField] = i18n.global.t(`governance.certificationTask.exportModal.defaultColumns.${exportField.replace(/\./g, '_')}`);
    }
  });
  return fieldLabels;
}

/**
 * Processes an array of items for export by flattening nested objects and omitting specified keys.
 *
 * @param {Array<Object>} items - The array of items to process for export.
 * @param {Array<string>} fields - An array of field strings (category.key) representing the active columns, used to determine which fields to include in the export.
 * @param {Array<Object>} columnList - An array of column objects representing the active columns, used to determine labels to include in the export.
 * @param {Array<string>} omitKeys - An optional array of keys to omit from the root level of the flattened objects. Defaults to ['permissions'].
 * @returns {Array<Object>} An array of processed items ready for export, with nested objects flattened and specified keys omitted.
 */
export function processItemsForExport(items, fields, columnList, omitKeys = ['permissions']) {
  const ignoreSet = new Set(omitKeys);
  const fieldLabels = getLabelsForFields(columnList);
  const sortedFields = [ // Push default export fields to end of list to preserve order of user provided columns
    ...fields.filter((field) => !DEFAULT_EXPORT_FIELDS.includes(field)),
    ...fields.filter((field) => DEFAULT_EXPORT_FIELDS.includes(field)),
  ];

  // Transform each certification item by flattening all properties to top level keys
  const transformItem = (item) => {
    const flatten = (obj, prefix = '', res = {}) => {
      const entries = Object.entries(obj);
      entries.forEach(([key, val]) => {
        if (!prefix && ignoreSet.has(key)) { return; } // Skip keys in the root object that are in the omit list
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (Array.isArray(val)) {
          res[newKey] = JSON.stringify(val);
        } else if (val && typeof val === 'object') {
          flatten(val, newKey, res);
        } else {
          res[newKey] = val;
        }
      });

      return res;
    };
    const flattenedItem = flatten(item);

    // Creates a new object, converting the flattened keys to the user friendly display labels
    const returnItem = {};
    sortedFields.forEach((field) => {
      const label = fieldLabels[field] || field;
      returnItem[label] = flattenedItem[field] ?? null;
    });
    return returnItem;
  };

  return items.map((item) => transformItem(item));
}
