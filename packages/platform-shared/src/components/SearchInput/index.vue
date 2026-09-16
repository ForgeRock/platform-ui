<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-search-input-holder">
    <!-- The sr-only label supplies the accessible name without changing the
      visual design; the placeholder stays visible as a hint only (WCAG 3.3.2). -->
    <label
      :for="searchFieldId"
      class="sr-only">
      {{ placeholder }}
    </label>
    <BInputGroup :class="[{'bg-light': readOnly}]">
      <BInputGroupPrepend>
        <BInputGroupText :class="[{'bg-light': readOnly}, 'border-0']">
          <FrIcon :name="prependIcon" />
        </BInputGroupText>
      </BInputGroupPrepend>
      <!--
        Emitted when pressing enter key to search
        @event search
      -->
      <BFormInput
        ref="searchInput"
        :id="searchFieldId"
        :placeholder="placeholder"
        @focus="$emit('search-input-focus')"
        @blur="$emit('search-input-blur')"
        @keydown.enter="$emit('search')"
        @keydown.esc="clearSearch"
        v-model="value"
        class="pl-0 mx-0 border-0"
        :disabled="readOnly"
        type="search" />
      <slot
        name="append"
        v-if="!readOnly" />
      <BInputGroupAppend v-if="value.length">
        <BButton
          class="border-0"
          @click.prevent.stop="clearSearch()"
          variant="link"
          :aria-label="$t('common.clear')">
          <FrIcon :name="appendIcon" />
        </BButton>
      </BInputGroupAppend>
      <slot name="extra-buttons" />
    </BInputGroup>
  </div>
</template>

<script>
import {
  BButton,
  BFormInput,
  BInputGroup,
  BInputGroupAppend,
  BInputGroupPrepend,
  BInputGroupText,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { v4 as uuid } from 'uuid';

/**
 * Component that provides a left and right icon for a text input.
 */
export default {
  name: 'SearchInput',
  components: {
    BButton,
    BFormInput,
    BInputGroup,
    BInputGroupAppend,
    BInputGroupPrepend,
    BInputGroupText,
    FrIcon,
  },
  props: {
    /**
     * Material icon name to right of input that clears existing input.
     */
    appendIcon: {
      type: String,
      default: 'close',
    },
    /**
     * Placeholder text that is visible when input value is empty string.
     */
    placeholder: {
      type: String,
      default: 'Search',
    },
    /**
     * Material icon name to left of input used to indicate what field is for.
     */
    prependIcon: {
      type: String,
      default: 'search',
    },
    displayText: {
      type: String,
      default: '',
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      value: '',
      searchHasFocus: false,
      searchFieldId: `fr-search-input-${uuid()}`,
    };
  },
  methods: {
    /**
     * Clear the value from the input.
     */
    clearSearch() {
      this.value = '';
      this.$refs.searchInput.$el.focus();
      // Emitted after clicking the append icon and input set to empty string.
      this.$emit('clear');
    },
  },
  watch: {
    value(newVal) {
      /**
       * Emitted when input value changes.
       *
       * @param {String} newVal input value.
       */
      this.$emit('input', newVal);
    },
    displayText(newVal) {
      this.value = newVal;
    },
  },
};
</script>

<style lang="scss" scoped>
.fr-search-input-holder {
  .input-group {
    border: 1px solid $input-border-color;
    border-radius: 5px;

    .input-group-text {
      padding-left: 1.25rem;
      padding-right: 1.25rem;
    }

    .input-group-append .btn {
      color: $gray-900;
    }

    ::-webkit-search-cancel-button {
      display: none;
    }

    .form-control:focus {
      box-shadow: none !important;
      outline: none;
    }
  }
}
</style>
