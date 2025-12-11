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
  },
  role: {
    key: 'role',
    label: i18n.global.t('common.role'),
    sortable: true,
    category: 'role',
    class: 'text-truncate fr-access-cell',
    show: true,
    showFor: ['roles'],
  },
  application: {
    key: 'application',
    label: i18n.global.t('governance.certificationTask.application'),
    sortable: true,
    category: 'application',
    class: 'text-truncate fr-access-cell',
    show: true,
    showFor: ['accounts', 'entitlements', 'entitlementComposition'],
  },
  entitlement: {
    key: 'entitlement',
    label: i18n.global.t('governance.certificationTask.entitlement'),
    sortable: true,
    category: 'entitlement',
    class: 'text-truncate fr-access-cell',
    show: true,
    showFor: ['entitlements', 'accountEntitlement', 'entitlementComposition'],
  },
  account: {
    key: 'account',
    label: i18n.global.t('governance.certificationTask.account'),
    sortable: false,
    category: 'account',
    class: 'text-truncate fr-access-cell',
    show: true,
    showFor: ['accounts', 'entitlements'],
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
