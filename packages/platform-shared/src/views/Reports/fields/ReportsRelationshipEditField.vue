<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrRelationshipEdit
    class="mb-3"
    :close-on-select="closeOnSelect"
    :hide-field-description="hideFieldDescription"
    :index="index"
    :label="label"
    :query-filter-extension="queryFilterExtension"
    :relationship-property="relationshipProperty"
    :show-time-constraints-switch="showTimeConstraintsSwitch"
    @resource-selections="$emit('relationship-property-update', $event)" />
</template>

<script setup>
/**
 * @description Displays the Relationship Edit field for running reports
 */
import FrRelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';

defineProps({
  closeOnSelect: {
    type: Boolean,
    default: true,
  },
  hideFieldDescription: {
    type: Boolean,
    default: true,
  },
  index: {
    type: Number,
    default: 0,
  },
  label: {
    type: String,
    default: '',
  },
  queryFilterExtension: {
    type: String,
    default: '',
  },
  relationshipProperty: {
    type: Object,
    default: () => ({}),
  },
  showTimeConstraintsSwitch: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['relationship-property-update']);
</script>
