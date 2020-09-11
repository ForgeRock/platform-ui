<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<script>
import {
  mapKeys,
  omit,
  has,
} from 'lodash';
/**
 * @description Schema mixin used for filtering and mapping json schema information to be consumed by schema driven components such as FormGenerator.
 */
export default {
  name: 'SchemaMixin',
  methods: {
    /**
     * Takes current schema object and calculates all render types and collects all options for populating arrays
     * @param schema - current schema defined by AM
     */
    filterAndMapRawSchema(schema) {
      const newSchema = {};

      // The useful schema information is always stored under the 'properties' at the top level
      mapKeys(schema.properties, (propertyValue, propertyKey) => {
        newSchema[propertyKey] = this.filterAndMapSchemaProperty(propertyValue);
      });

      return newSchema;
    },
    /**
     * Determines if a schema property is nested
     * @param schemaProperty - the schema property to evaluate
     */
    isNestedProperty(schemaProperty) {
      if (!schemaProperty.properties) {
        return false;
      }

      const propertyKeys = Object.keys(schemaProperty.properties);
      if (propertyKeys.length === 2 && propertyKeys.includes('value') && propertyKeys.includes('inherited')) {
        return false;
      }
      return true;
    },
    /**
     * Recursively filters and maps a potentially nested json schema representation
     * of a field onto something that can be consumed by the FormGenerator component.
     * @param schemaProperty - the property to evaluate
     */
    filterAndMapSchemaProperty(schemaProperty) {
      // If the property is nested, recursively map sub properties
      if (this.isNestedProperty(schemaProperty)) {
        const newObj = {};
        mapKeys(schemaProperty.properties, (prop, name) => {
          newObj[name] = this.filterAndMapSchemaProperty(prop);

          if (newObj[name].required) {
            if (newObj.required && newObj.required.length) {
              newObj.required.push(name);
            } else {
              newObj.required = [name];
            }
          }
        });
        return newObj;
      }

      // if the property is not nested, map it directly
      return this.filterAndMapBaseLevelSchemaProperty(schemaProperty);
    },
    /**
     * Filters and maps a non-nested json schema field onto something that can be
     * consumed by the FormGenerator component.
     * @param prop - the property to evaluate
     */
    filterAndMapBaseLevelSchemaProperty(prop) {
      const mappedProp = omit(prop, ['propertyOrder', 'type', 'exampleValue', 'properties', 'options', 'inherited']);
      mappedProp.type = prop.properties && prop.properties.value && prop.properties.value.type ? prop.properties.value.type : '';

      const hasType = has(mappedProp, 'type');
      const hasEnumNames = has(mappedProp, 'enumNames');
      const hasItems = has(mappedProp, 'items');
      const hasEnumNamesInItems = hasItems && has(mappedProp.items, 'enumNames');
      const enumNamesLengthIs2 = hasEnumNames && mappedProp.enumNames.length === 2;

      if (!hasType) {
        mappedProp.type = prop.type || 'string';
      }

      // assign render type  and array subtype to schema object
      if (enumNamesLengthIs2) {
        mappedProp.type = 'radio';
        mappedProp.options = mappedProp.enumNames.map((text, index) => ({ text, value: mappedProp.enum[index] }));
        delete mappedProp.enum;
        delete mappedProp.enumNames;
      } else if (hasEnumNames) {
        mappedProp.arrayType = 'selectOne';
        mappedProp.type = 'array';
      } else if (hasEnumNamesInItems) {
        mappedProp.arrayType = 'selectMany';
        mappedProp.type = 'array';
        mappedProp.enum = mappedProp.items.enum;
        mappedProp.enumNames = mappedProp.items.enumNames;
        delete mappedProp.items;
      } else if (hasItems) {
        mappedProp.arrayType = 'addMany';
        mappedProp.type = 'array';
        mappedProp.options = [];
        delete mappedProp.items;
      }

      if (prop.properties && prop.properties.value && prop.properties.value.required === true) {
        mappedProp.required = true;
      }
      return mappedProp;
    },
  },
};
</script>
