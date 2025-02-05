<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrSelectInput
    v-bind="$attrs"
    v-on="$listeners"
    sort-options
    show-selected-option-on-open>
    <template #singleLabel="{ option }">
      <div :class="[{'can-edit': showEdit(option)}, 'collapsed-option d-flex align-items-center justify-content-between w-100']">
        <div
          :title="option.text"
          class="text-truncate">
          {{ option.text }}
          <BBadge
            v-if="option.badgeText"
            variant="white"
            class="ml-1 border border-darkened select-with-actions-badge">
            {{ option.badgeText }}
          </BBadge>
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
          :aria-label="editLabelOrFallback"
          :title="editLabelOrFallback"
          size="sm"
          variant="light"
          data-testid="labelEditItemButton">
          <FrIcon name="edit" />
        </BButton>
      </div>
    </template>
    <template #beforeList>
      <div class="row-before-list cursor-default d-flex align-items-center justify-content-between pl-3 py-2">
        <h5
          class="mb-0"
          data-testid="beforeListText">
          {{ addRowTextOrFallback }}
        </h5>
        <!--
          Triggered on click, indicates user would like to add an item to the select list
          @event add-item-clicked
        -->
        <BButton
          @mousedown.stop
          @mouseup.stop
          @click.stop="$emit('add-item-clicked')"
          :aria-label="addLabelOrFallback"
          :title="addLabelOrFallback"
          size="sm"
          variant="light"
          data-testid="beforeListAddButton">
          <FrIcon name="add" />
        </BButton>
      </div>
    </template>
    <template #option="{ option }">
      <div class="d-flex align-items-center justify-content-between w-100">
        <div
          :title="option.text"
          class="text-truncate py-2 pl-3 pr-2">
          {{ option.text }}
          <BBadge
            v-if="option.badgeText"
            variant="white"
            class="ml-1 border border-darkened select-with-actions-badge">
            {{ option.badgeText }}
          </BBadge>
        </div>
        <!--
          Triggered on click, indicates user would like to view or edit this select list item
          @event edit-item-clicked
          @property {string} the value (id) of the item to view/edit
        -->
        <BButton
          @mouseup.stop
          @click.stop="$emit('edit-item-clicked', option.value)"
          v-if="option.value !== '[Empty]'"
          :aria-label="editLabelOrFallback"
          :title="editLabelOrFallback"
          size="sm"
          variant="light"
          data-testid="editItemButton">
          <FrIcon name="edit" />
        </BButton>
      </div>
    </template>
    <template
      v-for="(key, slotName) in $slots"
      #[slotName]="slotData">
      <slot
        :name="slotName"
        v-bind="slotData" />
    </template>
  </FrSelectInput>
</template>

<script>
import { BBadge, BButton } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSelectInput from '@forgerock/platform-shared/src/components/Field/SelectInputDeprecated';

/**
 *  Select input with actions for adding and editing items which fire events.
 *  Allows selection of one element in a dropdown.
 */
export default {
  name: 'SelectWithActions',
  components: {
    BBadge,
    BButton,
    FrSelectInput,
    FrIcon,
  },
  props: {
    /**
     * Text displayed for option to add
     */
    addRowText: {
      type: String,
      default: '',
      required: false,
    },
    /**
     * Add button label
     */
    addLabel: {
      type: String,
      default: '',
      required: false,
    },
    /**
     * Edit button label
     */
    editLabel: {
      type: String,
      default: '',
      required: false,
    },
    /**
     * Show edit button when dropdown is closed
     */
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
  computed: {
    addRowTextOrFallback() {
      return this.addRowText || this.$t('common.add');
    },
    addLabelOrFallback() {
      return this.addLabel || this.$t('common.add');
    },
    editLabelOrFallback() {
      return this.editLabel || this.$t('common.edit');
    },
  },
};
</script>

<style lang="scss" scoped>
.cursor-default {
  cursor: default;
}

:deep(.multiselect__tags > span.multiselect__single) {
  margin-top: 0;
}

.multiselect__single > .collapsed-option {
  margin-top: 4px;

  button {
    display: none;
    padding: 0.22rem 0.5rem;
  }
}

.multiselect__single:hover > .collapsed-option.can-edit,
.esv-input-wrapper:hover .multiselect__single > .collapsed-option.can-edit {
  margin-top: 0;

  button {
    display: block;
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

.select-with-actions-badge {
  font-size: 12px;
  font-weight: 400;
}
</style>
