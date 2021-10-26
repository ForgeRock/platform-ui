<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BDropdown
      id="dropdown-locale"
      ref="locale"
      toggle-class="pl-0 text-dark"
      variant="link"
    >
      <template #button-content>
        {{ title || $t('locale.localeTitle') }}:
        <span class="font-weight-bold">
          {{ currentLanguage }}
        </span>
      </template>
      <BDropdownItem
        v-for="(obj, key) in dropdownItems"
        :active="obj.active"
        :key="key"
        class="dropdown-locale-item"
        @click="selectLocale(obj.locale)"
      >
        {{ obj.locale }}
      </BDropdownItem>
      <BDropdownDivider
        v-if="showAdd"
      />
      <BDropdownItem
        data-test-id="add-locale-button"
        id="add-button"
        v-if="showAdd"
        @click="addLocale"
      >
        <FrIcon
          class="mr-2"
          name="add" />
        {{ $t('locale.addLocale') }}
      </BDropdownItem>
    </BDropdown>
  </div>
</template>

<script>
import {
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

export default {
  name: 'LocaleDropdown',
  components: {
    BDropdown,
    BDropdownDivider,
    BDropdownItem,
    FrIcon,
  },
  computed: {
    currentLanguage() {
      const activeItem = this.dropdownItems.find((item) => item.active);
      return activeItem ? activeItem.locale : '';
    },
  },
  props: {
    showAdd: {
      default: false,
      type: Boolean,
    },
    dropdownItems: {
      default: () => [],
      type: Array,
    },
    title: {
      default: '',
      type: String,
    },
  },
  methods: {
    addLocale() {
      this.$emit('add-locale');
    },
    selectLocale(locale) {
      this.$emit('select-locale', locale);
    },
  },
};
</script>
