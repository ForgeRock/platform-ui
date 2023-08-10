<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BDropdown
    right
    no-caret
    variant="link"
    boundary="scrollParent"
    menu-class="w-100"
    :toggle-class="`text-decoration-none ${isWithinInput ? '' : 'py-0 px-1'}`"
    :class="`field-type-${fieldType}`"
    data-testid="esv-dropdown">
    <template #button-content>
      <FrIcon
        class="placeholder-dropdown"
        name="token" />
      <span class="sr-only">
        {{ $t('esvInput.title') }}
      </span>
    </template>
    <BDropdownText>
      <h5 class="my-0">
        {{ secretsVisible ? $t('esvInput.secretsAndVariables') : $t('common.variables') }}
      </h5>
    </BDropdownText>
    <BDropdownForm @submit.stop.prevent>
      <FrSearchInput
        v-model="query"
        :placeholder="secretsVisible ? $t('esvInput.searchSecretsAndVariables') : $t('esvInput.searchVariables')"
        class="border-bottom border-top"
      />
    </BDropdownForm>
    <BDropdownItem
      v-for="item in filteredEsvs"
      :key="item._id"
      class="text-monospace"
      @click="esvClicked(item)">
      {{ item.placeholder }}
    </BDropdownItem>
    <template v-if="!filteredEsvs.length">
      <BDropdownText>
        <span
          class="text-muted">
          {{ secretsVisible ? $t('esvInput.noSecretsOrVariables') : $t('esvInput.noVariables') }}
        </span>
      </BDropdownText>
    </template>
  </BDropdown>
</template>

<script>
import {
  BDropdown,
  BDropdownForm,
  BDropdownText,
  BDropdownItem,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import { ref } from 'vue';
import useFilteredEsvs from '@forgerock/platform-shared/src/composables/filteredEsvs';
import { showEsvSecretsForField } from '@forgerock/platform-shared/src/utils/esvUtils';

export default {
  name: 'EsvDropdown',
  components: {
    BDropdown,
    BDropdownForm,
    BDropdownText,
    BDropdownItem,
    FrIcon,
    FrSearchInput,
  },
  props: {
    fieldType: {
      type: String,
      required: true,
    },
    isWithinInput: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const query = ref('');
    const { filteredEsvs } = useFilteredEsvs(query, props.fieldType);
    const secretsVisible = showEsvSecretsForField(props.fieldType);

    function esvClicked(esvItem) {
      context.emit('esv-selected', esvItem.placeholder);
    }

    return {
      query,
      secretsVisible,
      esvClicked,
      filteredEsvs,
    };
  },
};
</script>

<style lang="scss" scoped>
.placeholder-dropdown {
  color: $gray-600;
}

:deep(.dropdown-menu) {
  width: auto;
  max-width: none;
  min-width: 276px;
  max-height: 400px;
  overflow-y: auto;
}

:deep(.dropdown-toggle::after) {
  margin-left: 0 !important;
}

.b-dropdown-text {
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
}

.b-dropdown-form {
  padding: 0;
}

:deep(.fr-search-input-holder) {
  .input-group {
    border: 0;
  }
}
</style>
