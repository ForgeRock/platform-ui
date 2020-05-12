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
  mapKeys,
  omit,
  has,
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
    // remove extraneous properties from schema
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
    /**
     * @param schema - current schema defined by AM
     *
     * Takes current schema object and calculates all render types and collects all options for populating arrays
     */
    filterRawSchema(schema) {
      const newSchema = {};

      mapKeys(schema.properties, (val, prop) => {
        const newObj = {};

        mapKeys(val.properties, (v, p) => {
          newObj[p] = omit(v, ['propertyOrder', 'type', 'exampleValue', 'properties', 'options', 'inherited']);
          newObj[p].type = v.properties && v.properties.value && v.properties.value.type ? v.properties.value.type : '';

          const hasType = has(newObj[p], 'type');
          const hasEnumNames = has(newObj[p], 'enumNames');
          const hasItems = has(newObj[p], 'items');
          const hasEnumNamesInItems = hasItems && has(newObj[p].items, 'enumNames');
          const enumNamesLengthIs2 = hasEnumNames && newObj[p].enumNames.length === 2;

          if (!hasType) {
            newObj[p].type = v.type || 'string';
          }

          // assign render type  and array subtype to schema object
          if (enumNamesLengthIs2) {
            newObj[p].type = 'radio';
            newObj[p].options = newObj[p].enumNames.map((text, index) => ({ text, value: newObj[p].enum[index] }));
            delete newObj[p].enum;
            delete newObj[p].enumNames;
          } else if (hasEnumNames) {
            newObj[p].arrayType = 'selectOne';
            newObj[p].type = 'array';
          } else if (hasEnumNamesInItems) {
            newObj[p].arrayType = 'selectMany';
            newObj[p].type = 'array';
            newObj[p].enum = newObj[p].items.enum;
            newObj[p].enumNames = newObj[p].items.enumNames;
            delete newObj[p].items;
          } else if (hasItems) {
            newObj[p].arrayType = 'addMany';
            newObj[p].type = 'array';
            newObj[p].options = [];
            delete newObj[p].items;
          }

          // create required array
          if (v.properties && v.properties.value && v.properties.value.required === true) {
            if (newObj.required && newObj.required.length) {
              newObj.required.push(`${p}`);
            } else {
              newObj.required = [`${p}`];
            }
          }
        });

        newSchema[prop] = newObj;
      });

      return newSchema;
    },
  },
};
</script>
