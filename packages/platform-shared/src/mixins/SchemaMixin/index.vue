<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<script>
import {
  get,
  each,
  keys,
  includes,
  isObject,
  map,
  mapKeys,
  omit,
} from 'lodash';
/**
 * @description Schema mixin used for generic schema interations
 */
export default {
  name: 'SchemaMixin',
  methods: {
    // return value of enum from schema based on model name
    getOptionsByModel(model, schema) {
      const dotLoc = model.indexOf('.');
      const schemaPath = `properties.${model.slice(0, dotLoc + 1)}properties${model.slice(dotLoc, model.length)}.enum`;

      return get(schema, schemaPath);
    },
    // remove extraneous properties from schema for ease of use
    removeSchemaProperties(schema, deleteList = ['title', 'description', 'propertyOrder', 'exampleValue', 'options', 'inherited']) {
      const removeProp = (schemaObj, propsToDelete) => {
        if (isObject(schemaObj)) {
          each(keys(schemaObj), (property) => {
            if (includes(propsToDelete, property)) {
              delete schemaObj[property];
            } else {
              if (property === 'required') {
                if (schemaObj[property]) {
                  schemaObj.isRequired = true;
                }
                delete schemaObj[property];
              }
              removeProp(schemaObj[property], propsToDelete);
            }
          });
        }
      };

      return removeProp(schema, deleteList);
    },

    filterRawSchema(schema) {
      const newSchema = {};

      mapKeys(schema.properties, (val, prop) => {
        const newObj = {};
        mapKeys(val.properties, (v, p) => {
          newObj[p] = omit(v, ['propertyOrder', 'type', 'exampleValue', 'properties', 'options']);
          newObj[p].type = v.properties && v.properties.value && v.properties.value.type ? v.properties.value.type : '';

          if (v.properties && v.properties.value && v.properties.value.required === true) {
            if (newObj.required && newObj.required.length) {
              newObj.required.push(`${p}`);
            } else {
              newObj.required = [`${p}`];
            }
          }

          if (v.enum && v.enumNames) {
            newObj[p].options = map(v.enum, (value, index) => ({
              name: v.enumNames[index],
              value,
            }));
          }
        });

        newSchema[prop] = newObj;
      });

      return newSchema;
    },
  },
};
</script>
