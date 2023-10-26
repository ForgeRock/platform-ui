<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :id="modalId"
    ok-variant="primary"
    cancel-variant="secundary"
    @ok="applyCustomization"
    :ok-title="$t('common.apply')"
    :title="$t('governance.certificationTask.customizeColumns')">
    <BListGroup>
      <Draggable
        class="d-flex flex-column w-100"
        ghost-class="ghost-tag"
        :list="draggedColumnsList">
        <BListGroupItem
          v-for="column in draggedColumnsList"
          class="py-1 p-2 justify-content-between align-items-center"
          :class="column.label !== '' ? 'd-flex' : 'd-none'"
          :key="column.key"
          :id="`fr-columns-task-${column.key}`">
          <div
            class="d-flex align-items-center p-2">
            <FrField
              v-model="column.show"
              name="columnSelected"
              type="checkbox" />
            <span class="fr-tag-text">
              {{ column.label }}
            </span>
          </div>
          <FrIcon
            class="pl-2"
            name="drag_indicator"
          />
        </BListGroupItem>
      </Draggable>
    </BListGroup>
  </BModal>
</template>

<script>
import {
  BModal,
  BListGroupItem,
  BListGroup,
} from 'bootstrap-vue';
import Draggable from 'vuedraggable';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import {
  cloneDeep,
} from 'lodash';

export default {
  name: 'SortModal',
  components: {
    BModal,
    BListGroupItem,
    BListGroup,
    Draggable,
    FrField,
    FrIcon,
  },
  props: {
    /**
     * this is the list of columns shown in the task list
    */
    taskListColumns: {
      type: Array,
      default: () => [],
    },
    modalId: {
      type: String,
      default: 'CertificationTaskSortConfirmAccountModal',
    },
  },
  methods: {
    applyCustomization() {
      this.$emit('update-columns', this.draggedColumnsList);
      this.$root.$emit('bv::hide::modal', this.modalId);
    },
  },
  data() {
    return {
      draggedColumnsList: [],
    };
  },
  watch: {
    taskListColumns(newVal) {
      const columList = newVal.filter((col) => col.key !== 'selector');
      this.draggedColumnsList = cloneDeep(columList);
    },
  },
};
</script>
