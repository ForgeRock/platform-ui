<!-- Copyright (c) 2022-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <slot
      name="button"
      :show-modal="showModal">
      <BButton
        variant="outline-secondary"
        @click="showModal.value = true">
        <FrIcon
          icon-class="md-24"
          name="view_column" />
      </BButton>
    </slot>
    <slot name="modal">
      <BModal
        v-model="showModal.value"
        body-class="p-0"
        cancel-variant="link"
        scrollable
        :title="modalTitle || $t('common.customizeObject', { object: $t('common.columns') })"
        :static="isTesting"
        :ok-title="$t('common.apply')"
        @hidden="resetList"
        @ok="applyChanges">
        <BListGroup flush>
          <BListGroupItem v-if="allowSearch">
            <FrSearchInput
              :value="searchQuery"
              placeholder="Search fields"
              @clear="searching = false"
              @search="searching = true"
              @input="changeSearchQuery" />
          </BListGroupItem>
          <Draggable
            :disabled="searching"
            ghost-class="ghost-item"
            :list="searchList || list"
            item-key="key">
            <template #item="{ element }">
              <BListGroupItem
                :key="element.key">
                <div class="d-flex justify-content-between">
                  <FrField
                    v-model="element.enabled"
                    type="checkbox"
                    @change="itemChanged(element)"
                    :label="element.label" />
                  <FrIcon
                    v-if="!searching"
                    icon-class="ml-4"
                    name="drag_indicator" />
                </div>
              </BListGroupItem>
            </template>
          </Draggable>
        </BListGroup>
      </BModal>
    </slot>
  </div>
</template>

<script>
import {
  BButton,
  BListGroup,
  BListGroupItem,
  BModal,
} from 'bootstrap-vue';
import {
  cloneDeep,
  findIndex,
  findLastIndex,
  reject,
  sortBy,
} from 'lodash';
import Draggable from 'vuedraggable';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';

Draggable.compatConfig = { MODE: 3 };

/**
 * Button that opens a modal which allows enabling and reordering of items in a list.
 */
export default {
  name: 'ListOrganizer',
  components: {
    BButton,
    BListGroup,
    BListGroupItem,
    BModal,
    Draggable,
    FrField,
    FrIcon,
    FrSearchInput,
  },
  props: {
    /**
     * Items to display in list. Each object needs to contain a key and enabled property
     */
    value: {
      type: Array,
      default: () => [],
    },
    /**
     * Title of modal
     */
    modalTitle: {
      type: String,
      default: '',
    },
    isTesting: {
      type: Boolean,
      default: false,
    },
    allowSearch: {
      type: Boolean,
      default: false,
    },
    moveAndReorderItemOnchange: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      list: [],
      lastEnabledIndex: null,
      showModal: { value: false },
      searchQuery: '',
      searching: false,
      searchList: null,
    };
  },
  methods: {
    applyChanges() {
      this.searching = false;
      this.searchList = null;
      this.$emit('list-reordered', this.list);
    },
    resetList() {
      this.list = cloneDeep(this.value);
    },
    setLastEnabledIndex() {
      this.lastEnabledIndex = findLastIndex(this.list, { enabled: true });
    },
    itemChanged(item) {
      if (this.moveAndReorderItemOnchange) {
        // when the item is enabled move it to the last enabled list item in the order
        const itemIndex = findIndex(this.list, { key: item.key });
        if (item.enabled) {
          // remove the item from this.list
          this.list.splice(itemIndex, 1);
          // add the item back after the last enabled itme
          this.list.splice(this.lastEnabledIndex + 1, 0, item);
        } else {
          // if the item is unchecked re-sort the list by enabled first then alphabetically on label
          // create enabled and disabled arrays
          // enabled stays in the same order disabled gets re-sorted by label
          const enabledArray = reject(this.list, { enabled: false });
          const disabledArray = sortBy(reject(this.list, { enabled: true }), ['label']);
          // update this.list with the new order
          this.list = enabledArray.concat(disabledArray);
        }
        this.setLastEnabledIndex();
      }
    },
    changeSearchQuery(val) {
      if (val.length) {
        this.searching = true;
        this.searchList = reject(this.list, (item) => !item.label.includes(val));
      } else {
        this.searchList = null;
        this.searching = false;
      }
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.list = cloneDeep(newVal);
        this.setLastEnabledIndex();
      },
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.list-group-flush .list-group-item:first-child) {
  border-top-width: 0 !important;
}

:deep(.list-group-flush:last-child .list-group-item:last-child) {
  border-bottom-width: 0 !important;
}

.ghost-item {
  opacity: 0.5;
  background-color: $light-blue;
}
</style>
