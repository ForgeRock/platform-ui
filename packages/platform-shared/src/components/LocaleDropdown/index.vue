<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

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
        <span
          data-test-id="selected-language"
          class="font-weight-bold">
          <span data-test-id="selected-language-text">
            {{ currentLanguage }}
          </span>
          <div
            v-if="currentLanguage === defaultLocale"
            data-test-id="selected-language-badge"
            class="ml-1 badge badge-white font-weight-normal border border-darkened">
            Default
          </div>
        </span>
      </template>
      <BDropdownItem
        v-for="(obj, key) in dropdownItems"
        :active="obj.active"
        :key="key"
        class="dropdown-locale-item"
        :class="{'is-editable': showEdit }"
        @click.prevent="selectLocale(obj.locale)"
      >
        <div class="d-flex align-items-center justify-content-between w-100 pr-2">
          <div class="text-truncate pl-3 pr-2 py-2 label">
            {{ obj.locale }}
            <div
              v-if="obj.locale === defaultLocale"
              class="ml-1 badge badge-white font-weight-normal border border-darkened">
              Default
            </div>
          </div>
          <BButton
            type="button"
            class="btn-sm btn-edit"
            variant="primary"
            @click.stop.prevent="editLocale(obj.locale)">
            <FrIcon
              name="edit" />
          </BButton>
        </div>
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
  BButton,
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

export default {
  name: 'LocaleDropdown',
  components: {
    BButton,
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
    defaultLocale: {
      default: '',
      type: String,
    },
    showEdit: {
      default: false,
      type: Boolean,
    },
  },
  methods: {
    addLocale() {
      this.$emit('add-locale');
    },
    selectLocale(locale) {
      this.$emit('select-locale', locale);
    },
    editLocale(locale) {
      this.$emit('edit-locale', locale);
    },
  },
};
</script>

<style lang="scss" scoped>
.btn-edit {
  display: none;
}

.dropdown-locale-item {
  width: 200px;

  &:hover.is-editable {
    .btn-edit {
      display: block;
    }

    ::v-deep .dropdown-item::after {
      display: none;
    }
  }

  ::v-deep .dropdown-item {
    padding: 0;
  }
}
</style>
