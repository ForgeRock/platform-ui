<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

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
                {{ definition.parameterType }}
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
            <BFormGroup
              class="m-0"
              :label-for="definition.name">
              <BFormCheckbox
                v-model="aggregateModel"
                :id="definition.name">
                {{ definition.name }}
              </BFormCheckbox>
            </BFormGroup>
          </template>
          <template v-else-if="settingId === 'sort'">
            <BListGroup>
              <BListGroupItem class="border-0 p-0">
                <BCardText>
                  <FrIcon
                    icon-class="mr-2"
                    :name="definition.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'">
                    {{ $t('common.sortByLabel', {label: definition.sortBy}) }}
                  </FrIcon>
                </BCardText>
              </BListGroupItem>
            </BListGroup>
          </template>
        </BCol>
        <BCol
          class="d-flex align-items-center justify-content-end"
          cols="2">
          <FrSpinner
            v-if="isSaving && definitionBeingUpdated === definition._id"
            class="opacity-50 mr-2"
            size="sm" />
          <FrActionsCell
            v-else
            :edit-option="false"
            @delete-clicked.stop="$emit('delete-definition')"
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
  BFormCheckbox,
  BFormGroup,
  BListGroup,
  BListGroupItem,
  BRow,
} from 'bootstrap-vue';
import { pluralizeSingular } from '@forgerock/platform-shared/src/utils/PluralizeUtils';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import i18n from '@/i18n';

const emit = defineEmits([
  'delete-definition',
  'edit-definition',
  'set-aggregate',
]);
const props = defineProps({
  definition: {
    type: Object,
    default: () => ({}),
  },
  definitionBeingUpdated: {
    type: String,
    default: '',
  },
  isSaving: {
    type: Boolean,
    default: false,
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

const editOptionLabel = computed(() => i18n.global.t('common.editObject', { object: pluralizeSingular(props.settingTitle) }));
const aggregateModel = computed({
  get() {
    // Boolean
    return props.definition.checked;
  },
  /**
   * Aggregate checkbox selection
   * @param {Boolean} checked selection
   */
  set(checked) {
    emit('set-aggregate', checked);
  },
});
</script>

<style lang="scss" scoped>
:deep(.card-body) {
  min-height: 68px;
}

:deep(.list-group-item) {
  cursor: default;
}

:deep(.custom-checkbox) {
  width: 100%;

  .custom-control-label {
    width: 100%;

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
