<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BDropdown
    right
    no-caret
    variant="link"
    boundary="window"
    toggle-class="text-decoration-none py-0 px-1">
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
        {{ $t('common.variables') }}
      </h5>
    </BDropdownText>
    <BDropdownForm @submit.stop.prevent>
      <FrSearchInput
        v-model="query"
        :placeholder="$t('esvInput.searchVariables')"
        class="border-bottom border-top"
      />
    </BDropdownForm>
    <template v-if="filteredVariables.length">
      <BDropdownItem
        v-for="item in filteredVariables"
        :key="item._id"
        class="text-monospace"
        @click="esvClicked(item)">
        {{ item.placeholder }}
      </BDropdownItem>
    </template>
    <template v-else>
      <BDropdownText>
        <span class="text-muted">
          {{ $t('esvInput.noVariables') }}
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
  },
  setup(props, context) {
    const query = ref('');
    const { filteredVariables } = useFilteredEsvs(query, props.fieldType);

    function esvClicked(esvItem) {
      context.emit('esv-selected', esvItem.placeholder);
    }

    return {
      query,
      filteredVariables,
      esvClicked,
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
