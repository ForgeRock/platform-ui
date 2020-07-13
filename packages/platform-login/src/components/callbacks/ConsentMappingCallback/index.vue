<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <ul class="m-0 p-0">
    <ConsentListItem
      v-for="( callback, index ) in callbacks"
      :key="`${callback.payload.type }-${ index }`"
      :callback="callback"
    />
    <li
      class="list-group-item text-left bg-light">
      <BFormCheckbox v-model="checked">
        {{ consentMessage }}
      </BFormCheckbox>
    </li>
  </ul>
</template>

<script>
import {
  BFormCheckbox,
} from 'bootstrap-vue';
import ConsentListItem from '@/components/callbacks/ConsentMappingCallback/ConsentListItem';

export default {
  name: 'ConsentContainer',
  components: {
    BFormCheckbox,
    ConsentListItem,
  },
  computed: {
    consentMessage() {
      return this.callbacks[0].getOutputByName('message');
    },
  },
  data() {
    return {
      checked: false,
    };
  },
  props: {
    callbacks: {
      required: true,
      type: Array,
    },
    isRequired: {
      required: true,
      type: Boolean,
    },
  },
  methods: {
    onCheckboxChange(isChecked) {
      const consentResponse = isChecked;
      const canProceed = !(this.isRequired && !isChecked);
      this.$emit('canProceed', canProceed);
      this.$emit('didConsent', consentResponse);
    },
  },
  watch: {
    checked(isChecked) {
      this.onCheckboxChange(isChecked);
    },
  },
};
</script>
