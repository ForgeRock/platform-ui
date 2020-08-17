<template>
  <div>
    <div
      v-if="populatedField.items && populatedField.items.type && (populatedField.items.type === 'string' || populatedField.items.type === 'number' || populatedField.items.type === 'boolean')"
      class="mb-4"
      :key="'managedResource' + index">
      <FrField
        :field="{
          value: populatedField.value,
          type: 'tag',
          title: populatedField.title,
          disabled: populatedField.disabled,
          validation: populatedField.validation
        }"
        v-on="$listeners" />
    </div>
    <div
      v-else-if="populatedField.items && populatedField.items.type && populatedField.items.type === 'object'"
      class="mb-4"
      :key="'managedResource' + index">
      <FrListOfObjects
        :field="field"
        v-on="$listeners"
      />
    </div>
    <div
      v-else-if="populatedField.items && populatedField.items.type && populatedField.items.type === 'array'"
      class="mb-4"
      :key="'managedResource' + index">
      <FrListOfLists
        :field="field"
        v-on="$listeners"
      />
    </div>
  </div>
</template>

<script>
import {
  clone,
} from 'lodash';
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
    field: {
      type: Object,
      default: () => {},
    },
    index: {
      type: Number,
      default: () => 0,
    },
  },
  mixins: [
    ListsMixin,
  ],
  computed: {
    populatedField() {
      const fieldClone = clone(this.field);

      if (!fieldClone.value || fieldClone.value === '') {
        fieldClone.value = [];
      }

      if (fieldClone.items.type === 'boolean') {
        fieldClone.validation = 'oneOf:true,false';
      } else if (fieldClone.items.type === 'number') {
        fieldClone.validation = 'numeric';
      }
      return fieldClone;
    },
  },
};
</script>
