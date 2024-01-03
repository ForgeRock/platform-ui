<!-- Copyright (c) 2022-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <slot
      name="button"
      :show-modal="showModal">
      <BButton
        variant="outline-secondary"
        @click="showModal = true">
        <FrIcon
          class="md-24"
          name="view_column" />
      </BButton>
    </slot>
    <slot name="modal">
      <BModal
        v-model="showModal"
        body-class="p-0"
        cancel-variant="link"
        scrollable
        :title="modalTitle || $t('common.customizeObject', { object: $t('common.columns') })"
        :static="isTesting"
        :ok-title="$t('common.apply')"
        @hidden="resetList"
        @ok="applyChanges">
        <BListGroup flush>
          <Draggable
            ghost-class="ghost-item"
            :list="list"
            item-key="key">
            <template #item="{ element }">
              <BListGroupItem
                :key="element.key">
                <div class="d-flex justify-content-between">
                  <FrField
                    v-model="element.enabled"
                    type="checkbox"
                    :label="element.label" />
                  <FrIcon
                    class="ml-4"
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
} from 'lodash';
import Draggable from 'vuedraggable';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

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
  },
  data() {
    return {
      list: [],
      showModal: false,
    };
  },
  methods: {
    applyChanges() {
      this.$emit('list-reordered', this.list);
    },
    resetList() {
      this.list = cloneDeep(this.value);
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.list = cloneDeep(newVal);
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
