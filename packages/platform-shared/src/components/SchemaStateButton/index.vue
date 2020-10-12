<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BDropdown
    variant="outline-secondary"
    class="dropdown-toggle"
    toggle-class="pr-5">
    <template
      v-slot:button-content>
      <i
        v-if="value === $t('common.active')"
        class="material-icons-outlined mr-md-2 text-success">
        check_circle
      </i>
      <span>{{ value }}</span>
    </template>

    <BDropdownItem
      v-for="item in dropdownOptions"
      @click="changeState(item.value)"
      :key="item.value">
      <i
        v-if="item.icon"
        :class="`material-icons-outlined mr-md-2 ${item.textClass}`">
        {{ item.icon }}
      </i>
      <span>{{ item.text }}</span>
    </BDropdownItem>
  </BDropdown>
</template>

/**
 * A component for switching json schema defined items (applications, Agent/gateway config etc) between active and inactive states (and others).
 * Takes the type of schema to use from the store and the location within that model of the status value and options as props.
 */
<script>
import {
  BDropdown,
  BDropdownItem,
} from 'bootstrap-vue';
import {
  get,
} from 'lodash';

export default {
  name: 'SchemaStateButton',
  components: {
    BDropdown,
    BDropdownItem,
  },
  props: {
    schemaType: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      default: 'status',
    },
  },
  data() {
    return {
      value: get(this.$store.state.ApplicationStore.jsonSchemaData[this.schemaType], `${this.model}.value`),
      options: get(this.$store.state.ApplicationStore.jsonSchemas[this.schemaType], `${this.model}.options`),
    };
  },
  computed: {
    dropdownOptions() {
      return this.options
        .filter((option) => option.value !== this.value)
        .map((option) => {
          option.textClass = '';
          if (option.text === this.$t('common.active')) {
            option.icon = 'check_circle';
            option.textClass = 'text-success';
          } else if (option.text === this.$t('common.inactive')) {
            option.icon = 'power_settings_new';
          }

          return option;
        });
    },
  },
  methods: {
    changeState(newValue) {
      this.$store.commit('ApplicationStore/setSchemaDataPropertyValue', {
        schemaType: this.schemaType,
        model: this.model,
        value: newValue,
      });
      this.value = newValue;
    },
  },
};
</script>
