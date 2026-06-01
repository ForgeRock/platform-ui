<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="add-filter"
    size="lg"
    no-close-on-backdrop
    no-close-on-esc
    title-class="h5"
    title-tag="h2"
    header-class="p-3"
    @show="setInitialOption"
    :title="$t(`common.addFilterTitle`, {objectType: capitalize(selectedItem)})"
    :static="isTesting">
    <FrField
      @select="selectTarget"
      :label="$t('common.selectFilterProperty')"
      name="columnSelected"
      type="select"
      :options="filterSchema[selectedItem] || []"
      :searchable="false"
      :value="filterSchema[selectedItem]?.[0]">
      <template #singleLabel="{ option }">
        <span class="text-dark">
          {{ option.text.displayName }}
        </span>
      </template>
      <template #option="{ option }">
        <span class="text-dark">
          {{ option.text.displayName }}
        </span>
      </template>
    </FrField>
    <template #modal-footer="{ hide }">
      <BButton
        class="mt-4"
        variant="link"
        @click="hide">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        class="mt-4"
        variant="primary"
        :disabled="noSelectedFilter"
        @click="buildNewFilter()">
        {{ $t('common.add') }}
      </BButton>
    </template>
  </BModal>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue';
import { BButton, BModal } from 'bootstrap-vue';
import { isEmpty, capitalize } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';

import i18n from '@/i18n';

const props = defineProps({
  selectedItem: {
    type: String,
    default: '',
  },
  filterSchema: {
    type: Object,
    default: () => ({}),
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});
const selectedFilter = ref({});
const operatorPath = ref('');
const noSelectedFilter = computed(() => isEmpty(selectedFilter.value));

const emit = defineEmits([
  'add-filter',
]);

function getOperator() {
  switch (selectedFilter.value.type) {
    case 'string':
      return 'CONTAINS';
    case 'number':
    case 'managedObject':
      return 'EQUALS';
    default:
      return 'EXISTS';
  }
}

function getObjectType(type) {
  switch (type) {
    case 'user':
    case 'alpha_user':
      return 'alpha_user';
    case 'role':
    case 'alpha_role':
      return 'alpha_role';
    case 'application':
    case 'alpha_application':
      return 'alpha_application';
    default:
      return type;
  }
}
function getFields(type) {
  switch (type) {
    case 'alpha_user':
      return ['givenName', 'sn', 'userName', 'profileImage'];
    case 'alpha_group':
      return ['_id'];
    default:
      return ['name'];
  }
}

function getComponents() {
  const defaultType = 'checkbox';
  if (selectedFilter.value.type === 'managedObject') {
    const objType = getObjectType(selectedFilter.value.managedObjectType.split('/')[3]);
    const fields = getFields(objType);
    return {
      id: operatorPath,
      component: FrGovResourceSelect,
      modelKey: operatorPath.value,
      props: {
        fields,
        class: 'mb-4 pt-2',
        label: selectedFilter.value.displayName,
        'filter-schema': true,
        'resource-path': objType,
        'initial-data': {
          id: '',
        },
        'first-option': {
          id: '',
          name: '',
          templateName: '',
          text: '',
          value: '',
        },
        value: false,
        name: operatorPath.value,
      },
    };
  }
  const componentProps = selectedFilter.value.type === 'string' || selectedFilter.value.type === 'number' ? {
    'display-text': selectedFilter.value.displayName,
    placeholder: i18n.global.t(`${selectedFilter.value.displayName}`),
    class: 'w-100 mb-4 pt-2',
    name: operatorPath.value,
  } : {
    value: false,
    type: defaultType,
    class: 'mr-2 mb-4 pt-2',
    label: selectedFilter.value.displayName,
    name: operatorPath.value,
  };
  return {
    id: operatorPath.value,
    component: selectedFilter.value.type === 'string' || selectedFilter.value.type === 'number' ? FrSearchInput : FrField,
    modelKey: operatorPath.value,
    props: componentProps,
  };
}

function getPath() {
  if (selectedFilter.value.key.startsWith('glossary')) {
    const values = selectedFilter.value.key.split('.');
    return `glossary.idx./${props.selectedItem}.${values[1]}`;
  }
  if (`${props.selectedItem}.${selectedFilter.value.key}` === 'account.displayName' || `${props.selectedItem}.${selectedFilter.value.key}` === 'entitlement.displayName') {
    return `descriptor.idx./${props.selectedItem}.displayName`;
  }
  return `${props.selectedItem}.${selectedFilter.value.key}`;
}

function buildNewFilter() {
  const filt = {
    name: i18n.global.t(`governance.access.filter.${props.selectedItem}`),
    type: operatorPath.value,
    filters: {
      [operatorPath.value]: {
        operator: getOperator(),
        path: getPath(),
      },
    },
    components: [
      getComponents(),
    ],
  };
  if (filt.filters[operatorPath.value].operator !== 'CONTAINS') filt.filters[operatorPath.value].value = null;
  emit('add-filter', filt, props.selectedItem);
}

function setOperatorPath() {
  operatorPath.value = `${props.selectedItem}-${selectedFilter.value.key}`;
}

function selectTarget(selectValue) {
  selectedFilter.value = selectValue.value;
  setOperatorPath();
}

async function setInitialOption() {
  await nextTick();
  const [firstOption] = props.filterSchema[props.selectedItem] || [];

  if (firstOption) {
    selectedFilter.value = firstOption.value ?? firstOption;
    setOperatorPath();
  }
}
</script>
