<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BDropdown variant="outline-secondary">
    <template #button-content>
      <FrIcon
        :icon-class="`${translatedValue === $t('common.active') ? 'mr-2' : ''} text-success`"
        :name="translatedValue === $t('common.active') ? 'check_circle' : ''">
        {{ translatedValue }}
      </FrIcon>
    </template>

    <BDropdownItem
      v-for="item in dropdownOptions"
      @click="changeState(item.value)"
      :key="item.value">
      <FrIcon
        :icon-class="`${item.icon ? 'mr-2' : ''} ${item.textClass}`"
        :name="item.icon || ''">
        {{ getTranslation(item.text) }}
      </FrIcon>
    </BDropdownItem>
  </BDropdown>
</template>

<script>
import {
  BDropdown,
  BDropdownItem,
} from 'bootstrap-vue';
import {
  get,
} from 'lodash';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';

/**
 * A component for switching json schema defined items (applications, Agent/gateway config etc) between active and inactive states (and others).
 * Takes the schema, model and field name as props and uses these to generate the state options and current state
 */
export default {
  name: 'SchemaStateButton',
  components: {
    BDropdown,
    BDropdownItem,
    FrIcon,
  },
  mixins: [
    TranslationMixin,
  ],
  props: {
    /**
     * Schema data
     */
    schema: {
      type: Object,
      default: () => {},
    },
    /**
     * Model data
     */
    model: {
      type: Object,
      default: () => {},
    },
    /**
     * Name of field to read from schema and model
     */
    field: {
      type: String,
      default: 'status',
    },
  },
  data() {
    return {
      value: get(this.model, `${this.field}.value`),
      options: get(this.schema, `${this.field}.options`),
      translatedValue: this.getTranslation(get(this.model, `${this.field}.value`)),
    };
  },
  computed: {
    dropdownOptions() {
      return this.options
        .filter((option) => option.value !== this.value)
        .map((option) => {
          option.textClass = '';
          if (this.getTranslation(option.text) === this.$t('common.active')) {
            option.icon = 'check_circle';
            option.textClass = 'text-success';
          } else if (this.getTranslation(option.text) === this.$t('common.inactive')) {
            option.icon = 'power_settings_new';
          }

          return option;
        });
    },
  },
  methods: {
    /**
     * Change to selected value and emit change event
     */
    changeState(newValue) {
      this.value = newValue;
      this.translatedValue = this.getTranslation(newValue);
      /**
       * triggered when a new value is selected from the dropdown
       * @param {string} newValue new selected value
       */
      this.$emit('change', newValue);
    },
  },
};
</script>
