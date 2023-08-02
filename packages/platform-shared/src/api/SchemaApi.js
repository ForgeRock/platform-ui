/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  has,
  isArray,
  isEmpty,
  reject,
  startsWith,
} from 'lodash';
import { generateIdmApi } from './BaseApi';
import { getConfig } from './ConfigApi';

const setSchemaProperties = (schema) => {
  if (has(schema, 'properties') && !isEmpty(schema.properties)) {
    schema.order.forEach((propName) => {
      const prop = schema.properties[propName];

      if (prop) {
        // If the property is nullable type will be an array so we need to grab the first array item that is not null to determine property type
        if (isArray(prop.type)) {
          prop.isNullable = true;
          [prop.type] = reject(prop.type, 'null');
        }
      }
    });
  }
};

/**
  * @returns {Promise}
  */
// eslint-disable-next-line import/prefer-default-export
export function getSchema(obj, requestOverride) {
  if (startsWith(obj, 'system/')) {
    const objParts = obj.split('/');
    // objParts looks like ["system","ldap","account"]
    return getConfig(`provisioner.openicf/${objParts[1]}`).then((response) => {
      const connectorObjectTypes = response.data ? response.data.objectTypes : {};
      const schema = connectorObjectTypes[objParts[2]];
      // add the order to the schema if it doesn't exist
      if (schema && !schema.order && schema.properties) {
        schema.order = Object.keys(schema.properties);
      }
      if (response.data.connectorRef) {
        schema.connectorRef = response.data.connectorRef;
      }
      return {
        data: schema,
      };
    });
  }

  return generateIdmApi(requestOverride).get(`/schema/${obj}`).then((response) => {
    if (has(response, 'data.result')) {
      // response.data.result means this is a result of a query so we need to loop over each schema and handle nullable properties
      response.data.result.forEach((schema) => {
        setSchemaProperties(schema);
      });
    } else {
      // handle nullable properties
      setSchemaProperties(response.data);
    }

    return response;
  });
}
