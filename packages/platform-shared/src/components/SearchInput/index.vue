<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
    class="fr-icon-input-holder">
    <i class="fr-icon-input-left material-icons-outlined">
      {{ prependIcon }}
    </i>
    <a
      tabindex="0"
      v-if="value.length > 0"
      @click.prevent="clearSearch()"
      href="#">
      <i
        class="fr-icon-input-right material-icons-outlined">
        {{ appendIcon }}
      </i>
    </a>
    <!--
      Emitted when pressing enter key to search
      @event search
     -->
    <BFormInput
      ref="searchInput"
      :placeholder="placeholder"
      @keydown.native.enter="$emit('search')"
      v-model="value"
      class="fr-icon-input mx-0" />
  </div>
</template>

<script>
import {
  BFormInput,
} from 'bootstrap-vue';

/**
 * Component that provides a left and right icon for a text input.
 */
export default {
  name: 'SearchInput',
  components: {
    BFormInput,
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
     * Placeholder text that is visibile when input value is empty string.
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
  },
  data() {
    return {
      value: '',
    };
  },
  methods: {
    clearSearch() {
      this.value = '';
      this.$refs.searchInput.$el.focus();
      /**
       * Emitted after clicking the append icon and input set to empty string.
       * @event clear
       */
      this.$emit('clear');
    },
  },
  watch: {
    value(newVal) {
      /**
       * Emmitted when input value changes.
       * @event input
       */
      this.$emit('input', newVal);
    },
  },
};
</script>
<style lang="scss" scoped>
.fr-icon-input-holder {
  position: relative;

  .fr-icon-input {
    padding-left: 3.75rem;
    padding-right: 3.75rem;
  }

  .material-icons-outlined {
    position: absolute;
    z-index: 1000;
    margin-top: 16px;

    &.fr-icon-input-left {
      margin-left: 20px;
    }

    &.fr-icon-input-right {
      right: 0;
      margin-right: 18px;
      cursor: pointer;
      color: $gray-500;

      &:hover {
        color: $gray-900;
      }
    }
  }
}
</style>
