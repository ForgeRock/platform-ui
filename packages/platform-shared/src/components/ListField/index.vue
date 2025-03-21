<!-- Copyright (c) 2021-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div
      class="mb-4"
      :key="`managedResource${index}`">
      <FrField
        v-if="items.type === 'string' || items.type === 'number' || items.type === 'boolean' || isEnumFormat"
        v-bind="$attrs"
        v-on="$listeners"
        :type="isEnumFormat ? 'multiselect' : 'tag'"
        :disabled="disabled"
        :label="label"
        :options="isEnumFormat ? items.enum : items"
        :validation="validation" />
      <FrListOfObjects
        v-else-if="items.type === 'object'"
        v-bind="$attrs"
        v-on="$listeners"
        :disabled="disabled"
        :properties="items.properties"
        :label="label" />
      <FrListOfLists
        v-else-if="items.type === 'array'"
        v-bind="$attrs"
        v-on="$listeners"
        :disabled="disabled"
        :items="items"
        :label="label" />
    </div>
  </div>
</template>

<script>
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrListOfLists from '@forgerock/platform-shared/src/components/ListOfLists';
import FrListOfObjects from '@forgerock/platform-shared/src/components/ListOfObjects';
import ListsMixin from '@forgerock/platform-shared/src/mixins/ListsMixin';

export default {
  name: 'ListField',
  components: {
    FrField,
    FrListOfLists,
    FrListOfObjects,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    index: {
      type: Number,
      default: 0,
    },
    items: {
      type: [Array, Object],
      default: () => [],
    },
    label: {
      type: String,
      default: '',
    },
  },
  mixins: [
    ListsMixin,
  ],
  computed: {
    inputValue() {
      if (this.$attrs.value === '') {
        return [];
      }
      return this.$attrs.value;
    },
    isEnumFormat() {
      return this.items.enum?.length;
    },
    validation() {
      if (this.items.type === 'boolean') {
        return 'oneOf:true,false';
      }
      if (this.items.type === 'number') {
        return 'numeric';
      }
      return '';
    },
  },
};
</script>
