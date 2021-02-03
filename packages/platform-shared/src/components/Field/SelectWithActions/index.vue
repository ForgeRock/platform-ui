<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrSelect
    v-bind="$attrs"
    v-on="$listeners">
    <template v-slot:beforeList>
      <div class="d-flex align-items-center justify-content-between pl-3 pr-2 py-2">
        <h5 class="mb-0">
          {{ addRowText }}
        </h5>
        <!--
          Triggered on click, indicates user would like to add an item to the select list
          @event add-item-clicked
        -->
        <BButton
          @click="$emit('add-item-clicked')"
          :aria-label="addLabel"
          :title="addLabel"
          size="sm"
          variant="light">
          <i
            aria-hidden="true"
            class="material-icons-outlined">
            add
          </i>
        </BButton>
      </div>
    </template>
    <template v-slot:option="{ option }">
      <div class="d-flex align-items-center justify-content-between w-100 pr-2">
        <div
          :title="option.text"
          class="text-truncate py-2 pl-3 pr-2">
          {{ option.text }}
        </div>
        <!--
          Triggered on click, indicates user would like to view or edit this select list item
          @event edit-item-clicked
          @property {string} the value (id) of the item to view/edit
        -->
        <BButton
          @click.stop="$emit('edit-item-clicked', option.value)"
          v-if="option.value !== '[Empty]'"
          :aria-label="editLabel"
          :title="editLabel"
          size="sm"
          variant="light">
          <i
            aria-hidden="true"
            class="material-icons-outlined">
            edit
          </i>
        </BButton>
      </div>
    </template>
  </FrSelect>
</template>

<script>
import { BButton } from 'bootstrap-vue';
import Select from '@forgerock/platform-shared/src/components/Field/Select';

/**
 *  Select input with actions for adding and editing items which fire events.
 *  Allows selection of one element in a dropdown.
 */
export default {
  name: 'SelectWithActions',
  components: {
    BButton,
    FrSelect: Select,
  },
  props: {
    addRowText: {
      type: String,
      default() {
        return this.$t('common.add');
      },
      required: false,
    },
    addLabel: {
      type: String,
      default() {
        return this.$t('common.add');
      },
      required: false,
    },
    editLabel: {
      type: String,
      default() {
        return this.$t('common.edit');
      },
      required: false,
    },
  },
};
</script>
