<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <slot
      name="button"
      :showModal="showModal">
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
        :ok-title="$t('common.apply')"
        @hidden="resetList"
        @ok="applyChanges">
        <BListGroup flush>
          <Draggable
            ghost-class="ghost-item"
            :list="list">
            <BListGroupItem
              v-for="listItem in list"
              :key="listItem.key">
              <div class="d-flex justify-content-between">
                <FrField
                  v-model="listItem.enabled"
                  type="checkbox"
                  :label="listItem.label" />
                <FrIcon
                  class="ml-4"
                  name="drag_indicator" />
              </div>
            </BListGroupItem>
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
::v-deep .list-group-flush .list-group-item:first-child {
  border-top-width: 0 !important;
}

::v-deep .list-group-flush:last-child .list-group-item:last-child {
  border-bottom-width: 0 !important;
}

.ghost-item {
  opacity: 0.5;
  background-color: $light-blue;
}
</style>
