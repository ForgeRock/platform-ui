<template>
  <div>
    <div
      class="code-editor position-relative"
      :class="{
        expanded: expanded,
        'error-state': !isValidJason
      }"
      @mouseover="hover = true"
      @mouseleave="hover = false">
      <VuePrismEditor
        language="json"
        v-model="stringifiedValue"
        :line-numbers="true"
        :readonly="readOnly"
        @input="validateCurrentJson($event.target.innerText)"
      />
      <div class="d-flex justify-content-center w-100 position-absolute py-2 code-editor-expander no-pointer-events">
        <button
          v-if="hover"
          class="btn btn-outline-secondary btn-sm pointer-events"
          @click.prevent="expanded = !expanded">
          <span v-if="expanded">
            {{ $t('listTypesShared.collapse') }}
          </span>
          <span v-else>
            {{ $t('listTypesShared.expand') }} ({{ lineCount }})
          </span>
        </button>
      </div>
    </div>
    <div>
      <p
        v-if="!isValidJason"
        class="text-danger">
        {{ $t('listTypesShared.invalidJson') }}
      </p>
    </div>
  </div>
</template>
<script>
import VuePrismEditor from 'vue-prism-editor';
import 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
import 'vue-prism-editor/dist/VuePrismEditor.css';

/**
 * @description Component that creates a JSON editor when data is overly complex
 *
 */
export default {
  name: 'InlineJsonEditor',
  components: {
    VuePrismEditor,
  },
  props: {
    value: {
      type: Array,
      default: () => '',
    },
    lineCount: {
      type: Number,
      default: () => 1,
    },
    readOnly: {
      type: Boolean,
      default: () => true,
    },
  },
  data() {
    return {
      hover: false,
      expanded: false,
      isValidJason: true,
    };
  },
  computed: {
    stringifiedValue: {
      get() {
        if (this.value) {
          return JSON.stringify(this.value, null, 2);
        }
        return '';
      },
      set(newValue) {
        return JSON.stringify(newValue, null, 2);
      },
    },
  },
  methods: {
    validateCurrentJson(newValue) {
      try {
        const field = JSON.parse(newValue);
        this.isValidJason = true;
        this.$emit('disable-save-button', false);
        this.$emit('update-field', field);
      } catch (e) {
        this.isValidJason = false;
        this.$emit('disable-save-button', true);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.error-state {
  border: 1px solid $red;
}

.code-editor {
  transition: height 0.2s ease;
  height: 110px;
}

.code-editor-expander {
  bottom: 0;
  height: 45px;
}

.code-editor.expanded {
  height: auto;
}

.code-editor .code-editor-expander {
  background: linear-gradient(180deg, rgba(246, 248, 250, 0), $gray-100);
}

.no-pointer-events {
  pointer-events: none;
}

.pointer-events {
  pointer-events: initial;
}
</style>
