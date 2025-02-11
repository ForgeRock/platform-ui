<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    no-body
    class="shadow-none p-0">
    <BCardBody class="d-flex p-3 text-left">
      <BRow
        no-gutters
        class="w-100">
        <BCol
          class="d-flex align-items-center"
          cols="10">
          <template v-if="settingId === 'parameters'">
            <BCardTitle
              class="h5 mb-0"
              title-tag="h4">
              {{ definition.parameterName }}
              <small class="d-block text-muted">
                {{ definition.source }}
              </small>
            </BCardTitle>
          </template>
          <template v-else-if="settingId === 'filter'">
            <BListGroup>
              <BListGroupItem class="border-0 p-0">
                <BCardText>
                  <FrIcon
                    icon-class="text-success mr-2"
                    name="check">
                    {{ $t('reports.template.filterActive') }}
                  </FrIcon>
                </BCardText>
              </BListGroupItem>
            </BListGroup>
          </template>
          <template v-else-if="settingId === 'aggregate'">
            <BCardTitle
              class="h5 mb-0"
              title-tag="h4"
              :class="!definition.label ? 'text-muted' : ''">
              {{ definition.label || $t('reports.template.labelRequired') }}
            </BCardTitle>
          </template>
          <template v-else-if="settingId === 'sort'">
            <BListGroup>
              <BListGroupItem class="border-0 p-0 text-break">
                <BCardText>
                  <FrIcon
                    icon-class="mr-2"
                    :name="definition.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'">
                    {{ $t('common.sortByLabel', { label: definition.value }) }}
                  </FrIcon>
                </BCardText>
              </BListGroupItem>
            </BListGroup>
          </template>
        </BCol>
        <BCol
          class="d-flex align-items-center justify-content-end"
          cols="2">
          <FrActionsCell
            :edit-option="false"
            @delete-clicked.stop="emit('delete-definition')"
            wrapper-class="pr-2">
            <template #custom-top-actions>
              <BDropdownItem @click.stop="$emit('edit-definition')">
                <FrIcon
                  icon-class="mr-2"
                  name="edit">
                  {{ editOptionLabel }}
                </FrIcon>
              </BDropdownItem>
            </template>
          </FrActionsCell>
        </BCol>
      </BRow>
    </BCardBody>
  </BCard>
</template>

<script setup>
/**
 * @description
 * Report settings definition component for parameters, filters, aggregates and sorting.
 */
import { computed } from 'vue';
import {
  BCard,
  BCardBody,
  BCardText,
  BCardTitle,
  BCol,
  BDropdownItem,
  BListGroup,
  BListGroupItem,
  BRow,
} from 'bootstrap-vue';
import { pluralizeSingular } from '@forgerock/platform-shared/src/utils/PluralizeUtils';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import i18n from '@/i18n';

const emit = defineEmits(['delete-definition', 'edit-definition']);
const props = defineProps({
  definition: {
    type: Object,
    default: () => ({}),
  },
  definitionIndex: {
    type: Number,
    default: -1,
  },
  settingId: {
    type: String,
    default: '',
    validator(value) {
      return [
        'entities',
        'parameters',
        'filter',
        'aggregate',
        'sort',
      ].includes(value);
    },
  },
  settingTitle: {
    type: String,
    default: '',
  },
});

// Computed
const editOptionLabel = computed(() => i18n.global.t('common.editObject', { object: pluralizeSingular(props.settingTitle) }));
</script>

<style lang="scss" scoped>
:deep(.card-body) {
  min-height: 68px;
}

:deep(.list-group-item) {
  cursor: default;
}
</style>
