<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ul
    v-if="index === 1"
    class="m-0 p-0">
    <ConsentListItem
      v-for="( callback, key ) in callbacks"
      :key="`${callback.payload.type }-${ key }`"
      :callback="callback"
    />
    <li
      class="list-group-item text-left bg-light">
      <BFormCheckbox
        data-testid="consent-mapping-checkbox"
        v-model="checked"
        @input="onCheckboxChange">
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
      isRequired: false,
    };
  },
  props: {
    callbacks: {
      required: true,
      type: Array,
    },
    index: {
      required: true,
      type: Number,
    },
  },
  methods: {
    onCheckboxChange(isChecked) {
      const consentResponse = isChecked;
      const disableNextButton = this.isRequired && !isChecked;
      this.$emit('disable-next-button', disableNextButton);
      this.$emit('did-consent', consentResponse);
    },
  },
  mounted() {
    if (this.index === 1) {
      this.isRequired = this.callbacks[0].getOutputByName('isRequired');
      this.$emit('disable-next-button', this.isRequired);
    }
  },
};
</script>
