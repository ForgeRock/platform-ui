<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BFormTags
    v-model="inputValue"
    :autofocus="autofocus"
    :disabled="disabled"
    :class="[{'fr-error': false}, 'fr-tags']">
    <template v-slot="{ tags, inputAttrs, inputHandlers, addTag, removeTag }">
      <Draggable
        v-model="inputValue"
        class="d-flex flex-wrap w-100"
        ghost-class="ghost-tag">
        <div
          class="mt-1 mr-1 fr-tag"
          v-for="tag in tags"
          :key="tag"
          body-class="py-1 pr-2 text-nowrap">
          <span class="fr-tag-text">
            {{ tag }}
          </span>
          <span @click="removeTag(tag)">
            <i
              class="material-icons-outlined pl-2"
              style="font-size: 10px; font-weight: 900;">
              close
            </i>
          </span>
        </div>
      </Draggable>
      <input
        v-bind="inputAttrs"
        @blur="addTag()"
        v-on="inputHandlers"
        :placeholder="$t('common.addObject', {object: fieldTitle})"
        :class="[{'show': !tags.length}, 'fr-input']">
    </template>
  </BFormTags>
</template>

<script>
import {
  BFormTags,
} from 'bootstrap-vue';
import Draggable from 'vuedraggable';

export default {
  name: 'FrTag',
  components: {
    BFormTags,
    Draggable,
  },
  data() {
    return {
      inputValue: this.value,
    };
  },
  props: {
    /**
     * Autofocus field.
     */
    autofocus: {
      type: Boolean,
      default: false,
    },
    /**
     * Flag to disable this field
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Title of field
     */
    fieldTitle: {
      type: String,
      default: '',
    },
    /**
     * Binding to v-model
     */
    value: {
      type: [String, Array],
      default: '',
    },
  },
  watch: {
    inputValue(newVal) {
      this.$emit('input', newVal);
    },
    value(newVal) {
      if (!this.inputValue) {
        this.inputValue = newVal;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.fr-tags {
  display: flex;
  flex-wrap: wrap;
  line-height: 1em;
  padding: 10px;
  min-height: 54px;

  .fr-tag {
    border-radius: 4px;
    display: flex;
    padding: 3px 5px;
    margin: 2px;
    font-size: 0.85em;
    background-color: $light-blue;
    color: $gray-900;
    cursor: move;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;

    .material-icons-outlined {
      cursor: pointer;
    }
  }

  .ghost-tag {
    opacity: 0.3;
  }

  .fr-input {
    opacity: 0;
    padding: 0;
    height: 0;
    transition: all 0.15s;
    outline: 0;
    width: 100%;
    border: 0;
  }

  &:hover > .fr-input,
  .fr-input:focus,
  .show {
    opacity: 1;
    height: 2rem;
  }

  .fr-tag-text {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>
