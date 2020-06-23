<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
