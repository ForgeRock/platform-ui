<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrSelect
    v-bind="$attrs"
    v-on="$listeners"
    sort-options
    show-selected-option-on-open>
    <template v-slot:singleLabel="{ option }">
      <div :class="[{'can-edit': showEdit(option)}, 'collapsed-option d-flex align-items-center justify-content-between w-100']">
        <div
          :title="option.text"
          class="text-truncate">
          {{ option.text }}
        </div>
        <!--
          Triggered on click, indicates user would like to view or edit this select list item
          @event edit-item-clicked
          @property {string} the value (id) of the item to view/edit
        -->
        <BButton
          @mousedown.stop
          @click.stop="$emit('edit-item-clicked', option.value)"
          v-if="showEdit(option)"
          :aria-label="editLabel"
          :title="editLabel"
          size="sm"
          variant="light">
          <FrIcon
            outlined
            name="edit" />
        </BButton>
      </div>
    </template>
    <template v-slot:beforeList>
      <div class="row-before-list cursor-default d-flex align-items-center justify-content-between pl-3 py-2">
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
          <FrIcon
            outlined
            name="add" />
        </BButton>
      </div>
    </template>
    <template v-slot:option="{ option }">
      <div class="d-flex align-items-center justify-content-between w-100">
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
          <FrIcon
            outlined
            name="edit" />
        </BButton>
      </div>
    </template>
  </FrSelect>
</template>

<script>
import { BButton } from 'bootstrap-vue';
import Icon from '@forgerock/platform-shared/src/components/Icon';
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
    FrIcon: Icon,
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
    showCollapsedEdit: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    showEdit(option) {
      return this.showCollapsedEdit && option.value !== '[Empty]';
    },
  },
};
</script>

<style lang="scss" scoped>
.cursor-default {
  cursor: default;
}

/deep/ .multiselect__tags > span.multiselect__single {
  margin-top: 0;
}

.multiselect__single > .collapsed-option {
  margin-top: 4px;

  button {
    display: none;
    padding: 0.22rem 0.5rem;
  }

  &.can-edit:hover {
    margin-top: 0;

    button {
      display: block;
    }
  }
}

.row-before-list {
  position: sticky;
  top: 0;
  padding-right: 12px;
  z-index: 10;
  background: $white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.13);
}
</style>
