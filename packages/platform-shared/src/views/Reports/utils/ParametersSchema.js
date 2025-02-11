/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { FIELD_TYPE_MAP } from './constants';
import DATA_CONTROLLER from './DataController';
import ReportParameter from './ReportParameter';
import store from '@/store';

/**
  * @description Defines the schema for the report parameters.
  * @param {Object} reportConfig Report template config parameters
  * @param {Boolean} isPrePackagedReport Determines if the report is pre-packaged (out-of-the-box)
  */

export default function ParametersSchema(reportConfig, isPrePackagedReport) {
  const isPlatformAdmin = store.state.SharedStore.currentPackage === 'admin';
  const { parameters: configParameters } = reportConfig;
  const configParameterKeys = configParameters ? Object.keys(configParameters) : [];

  if (configParameterKeys.length) {
    return configParameterKeys.map((_key) => {
      const {
        attribute,
        description = '',
        entity = '',
        enum: enums,
        label = _key,
        source,
        type = 'string',
      } = configParameters[_key];
      const SERVICE = Object.keys(DATA_CONTROLLER).find((key) => (
        Object.keys(DATA_CONTROLLER[key]).includes(entity)
      ));
      const entityOverrides = SERVICE ? DATA_CONTROLLER[SERVICE][entity] : {};
      const attributeOverrides = entityOverrides[attribute] || {};
      const { canQuery, endUserCanFetch } = entityOverrides;
      const hasEnums = !!enums?.length;
      const hasTaggableOverride = attributeOverrides.taggable === true || entityOverrides.taggable === true;
      const isSelectField = type === 'string' && (hasEnums || source === 'datasource');
      const canFetch = !!(SERVICE && !hasEnums && (isPlatformAdmin || endUserCanFetch));
      const fieldType = isSelectField ? 'select' : FIELD_TYPE_MAP[type];
      const fieldIsADropdown = fieldType === 'select' || fieldType === 'multiselect';
      const internalSearch = fieldIsADropdown && (canFetch === false || canQuery === false);
      const isUnmappedEntity = !SERVICE && source === 'datasource' && !hasEnums;
      const sourceIsBasicOrUserProvided = source === 'basic' || source === 'user_provided';
      const taggable = fieldIsADropdown && (sourceIsBasicOrUserProvided || !isPlatformAdmin || hasTaggableOverride || isUnmappedEntity);

      let model = '';
      let component = 'FrField';

      if (fieldType === 'boolean') model = false;
      if (fieldType === 'multiselect') model = [];
      if (fieldType === 'number') model = null;
      // The only real hard-coded exception here is for original out-of-the-box
      // reports needing to map to a custom component for the date range.
      if (isPrePackagedReport && _key === 'startDate') component = 'FrTimeframeField';
      if (isPrePackagedReport && _key === 'endDate') component = null;

      return {
        [_key]: new ReportParameter({
          _id: _key,
          component,
          description,
          internalSearch,
          label,
          model,
          taggable,
          type: fieldType,
          // conditional properties
          ...(hasEnums && { enums }),
          ...(canFetch && {
            request: {
              attribute,
              entity,
              data: [],
              fetch: DATA_CONTROLLER[SERVICE].fetch,
              mutation: (data, attr) => data.map((obj) => obj[attr] || obj),
              ...entityOverrides,
              ...attributeOverrides,
            },
          }),
        }),
      };
    }).reduce((a, c) => ({ ...a, ...c }), {}); // Merges the array of objects into a single object
  }
  return {};
}
