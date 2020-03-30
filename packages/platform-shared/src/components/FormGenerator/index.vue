<template>
  <div class="fr-generated-schema-holder">
    <form
      class="fr-generated-schema-body">
      <template v-for="(display, index) in populatedUISchema">
        <StringDisplay
          :key="index"
          :ui-schema="display"
          :save-model="display.model"
          v-if="safeCompare(display.type, 'string') && showField(display)"
          @update:model="updateSaveModel" />

        <ArrayDisplay
          :key="index"
          :ui-schema="display"
          :save-model="display.model"
          v-else-if="safeCompare(display.type, 'array') && showField(display)"
          @update:model="updateSaveModel" />

        <BooleanDisplay
          :key="index"
          :ui-schema="display"
          :save-model="display.model"
          :is-html="display.renderHTML"
          v-else-if="safeCompare(display.type, 'boolean') && showField(display)"
          @update:model="updateSaveModel" />

        <NumberDisplay
          :key="index"
          :ui-schema="display"
          :save-model="display.model"
          v-else-if="safeCompare(display.type, 'integer') && showField(display)"
          @update:model="updateSaveModel" />

        <RadioDisplay
          :key="index"
          :ui-schema="display"
          :save-model="display.model"
          v-else-if="safeCompare(display.type, 'radio') && showField(display)"
          @update:model="updateSaveModel" />
      </template>
    </form>
  </div>
</template>

<script>
import {
  assign,
  has,
  map,
  get,
  isObject,
} from 'lodash';

import ArrayDisplay from './renderers/ArrayDisplay';
import BooleanDisplay from './renderers/BooleanDisplay';
import NumberDisplay from './renderers/NumberDisplay';
import RadioDisplay from './renderers/RadioDisplay';
import StringDisplay from './renderers/StringDisplay';


export default {
  name: 'FormGenerator',
  components: {
    ArrayDisplay,
    BooleanDisplay,
    NumberDisplay,
    RadioDisplay,
    StringDisplay,
  },
  data() {
    return {};
  },
  props: {
    schema: {
      type: Object,
      default() {
        return {};
      },
    },
    uiSchema: {
      type: Array,
      default() {
        return [];
      },
    },
    model: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    populatedUISchema() {
      return map(this.uiSchema, (fieldObj) => {
        const schemaObj = assign(get(this.schema, fieldObj.model), fieldObj);
        const currentValue = has(get(this.model, fieldObj.model), 'value')
          ? get(this.model, fieldObj.model).value
          : get(this.model, fieldObj.model);

        schemaObj.value = schemaObj.value || currentValue;
        if (!has(schemaObj, 'type')) {
          schemaObj.type = typeof schemaObj.value || 'string';
        } else if (has(schemaObj, 'type') && schemaObj.type === 'array') {
          if (has(schemaObj, 'value') && !has(schemaObj.enum)) {
            schemaObj.options = schemaObj.value;
          } else if (has(schemaObj, 'value') && !has(schemaObj.enum)) {
            schemaObj.options = schemaObj.enum;
          }
        }

        if (schemaObj.type === 'string' && isObject(schemaObj.value)) {
          schemaObj.value = '';
        }
        return schemaObj;
      });
    },
  },
  methods: {
    /**
     * @param value - Received value passed in from the user
     * @param check - Expected value for the editor
     *
     * Preforms a case insensitive check of values
     */
    safeCompare(value, check) {
      return value.toLowerCase() === check;
    },
    showField(obj) {
      if (has(obj, 'show')) {
        return get(this.$store.state.ApplicationStore.oauthSaveObj, obj.show).value || false;
      }
      return true;
    },
    updateSaveModel(payload) {
      this.$store.dispatch('ApplicationStore/setOauthSaveObjPropertyValue', payload);
    },
  },
};
</script>
