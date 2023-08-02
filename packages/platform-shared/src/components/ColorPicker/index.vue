<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="color-picker d-flex align-items-stretch">
      <BButton
        class="w-100 p-0"
        href="#"
        variant="outline-secondary"
        :id="`color-picker-${id}`">
        <div class="d-flex align-items-stretch">
          <div class="color-swatch d-flex align-items-center justify-content-center">
            <div class="swatch">
              <span
                :style="{backgroundColor: pickerColor.hex}"
                class="swatch-color" />
            </div>
          </div>
          <div class="color-input pl-3 flex-grow-1">
            <label class="color-label mb-0 p-0 text-secondary">
              {{ label }}
            </label>
            <div class="color-value">
              {{ pickerColor.hex }}
            </div>
          </div>
        </div>
      </BButton>
      <BPopover
        :container="container"
        triggers="focus"
        boundary="window"
        placement="left"
        :target="`color-picker-${id}`">
        <ChromePicker v-model="pickerColor" />
      </BPopover>
    </div>
    <small
      v-if="description"
      class="form-text">
      {{ description }}
    </small>
  </div>
</template>

<script>
import {
  BButton,
  BPopover,
} from 'bootstrap-vue';
import { Chrome } from 'vue-color';

/**
 * Input that allows a user to select a color
 */
export default {
  name: 'ColorPicker',
  components: {
    BButton,
    BPopover,
    ChromePicker: Chrome,
  },
  props: {
    /**
     * Hex represenation of a color
     */
    color: {
      type: String,
      default: '#ffffff',
    },
    /**
     * Input label
     */
    label: {
      type: String,
      default: 'Color',
    },
    /**
     * Container element to append the rendered popover to when visible
     */
    container: {
      type: String,
      default: '',
    },
    /**
     * Text displayed under input
     */
    description: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      pickerColor: { hex: this.color },
      id: '',
    };
  },
  created() {
    // generate unique ids based on Vue uid for multiple color pickers on one page
    this.id = this._uid;
  },
  watch: {
    /**
     * Watch color prop for dynamic changes
     */
    color(color) {
      this.pickerColor = { hex: color };
    },
    /**
     * Relies on .sync to bind a variable to the changed color
     */
    pickerColor(color) {
      /**
        * triggers when selecting a color or entering a valid hex value
        *
        * @property {string} color.hex hex representation of color
        */
      this.$emit('update:color', color.hex);
    },
  },
};
</script>

<style lang="scss" scoped>
.color-picker {
  .btn {
    border-width: 0;
    text-align: left;

    &:hover,
    &:active {
      background-color: transparent;
    }

    .color-swatch {
      .swatch {
        display: inline-block;
        border: 1px solid $gray-400;
        border-radius: 5px 0 0 5px;
        width: 52px;
        height: 100%;
        padding: 14px 14px 14px 14px;

        .swatch-color {
          display: inline-block;
          border: 1px solid $gray-400;
          height: 100%;
          width: 100%;
        }
      }
    }

    .color-input {
      border-width: 1px 1px 1px 0;
      border-color: $gray-400;
      border-style: solid;

      .color-label {
        font-size: 12px;
      }

      .color-value {
        color: $gray-900;
        padding-bottom: 0.25rem;
      }
    }
  }
}
</style>
