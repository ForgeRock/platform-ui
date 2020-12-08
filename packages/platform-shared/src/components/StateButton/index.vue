<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BDropdown
    variant="outline-secondary"
    data-testid="schema-state">
    <template
      v-if="active"
      v-slot:button-content>
      <i
        class="material-icons-outlined mr-md-2 text-success">
        check_circle
      </i>
      <span>{{ $t('common.active') }}</span>
    </template>
    <template
      v-else
      v-slot:button-content>
      <span>{{ $t('common.inactive') }}</span>
    </template>

    <template
      v-if="active">
      <BDropdownItem
        @click="changeState(false)"
      >
        <i
          class="material-icons-outlined mr-md-2">
          power_settings_new
        </i>
        <span>{{ $t('common.deactivate') }}</span>
      </BDropdownItem>
    </template>
    <template
      v-else>
      <BDropdownItem
        @click="changeState(true)"
      >
        <i
          class="material-icons-outlined mr-md-2 text-success">
          check_circle
        </i>
        <span>{{ $t('common.activate') }}</span>
      </BDropdownItem>
    </template>
  </BDropdown>
</template>

<script>
import {
  BDropdown,
  BDropdownItem,
} from 'bootstrap-vue';

export default {
  name: 'StateButton',
  components: {
    BDropdown,
    BDropdownItem,
  },
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    schemaType: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      default: 'status',
    },
  },
  methods: {
    changeState(newValue) {
      this.$emit('change', newValue);
    },
  },
};
</script>
