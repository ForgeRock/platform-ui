<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="form-group mb-0 h-100 d-flex flex-column">
    <div
      v-if="scriptTitle!=='' || showFileUpload || showScriptType"
      class="d-flex justify-content-between align-items-center">
      <label class="mb-0 mr-2 py-2">
        {{ scriptTitle === null ? $t('scriptEditor.title') : scriptTitle }}
      </label>
      <div class="d-flex align-items-center py-2">
        <label
          v-show="showScriptType"
          class="mr-1 mb-0">
          {{ $t('scriptEditor.type') }}
        </label>
        <FrField
          v-show="showScriptType"
          :value="scriptType.value"
          @input="scriptType.value = $event; emitScriptValue()"
          class="mt-2"
          :disabled="disabled"
          name="scriptType"
          type="select"
          :options="scriptType.options"
          :searchable="false" />
        <FrField
          v-if="showFileUpload"
          v-model="uploadFileToggle"
          :disabled="disabled"
          type="boolean"
          :label="$t('scriptEditor.uploadFile')"
          size="sm" />
      </div>
    </div>
    <div class="fr-script-editor w-100">
      <div class="d-flex w-100 h-100 fr-script-editor-sidebar-nav position-relative">
        <VuePrismEditor
          v-if="uploadFileToggle === false"
          :code="code"
          @change="code = $event; emitScriptValue()"
          :aria-label="$t('editor.accessibilityHelp')"
          :language="scriptType.value.split('/')[1]"
          :line-numbers="showLineNumbers"
          :readonly="readonly"
          @keydown="blurOnEscape" />
      </div>
    </div>
    <BFormFile
      v-show="uploadFileToggle === true"
      :disabled="disabled"
      @change="onFileChange"
      accept=".js, .groovy"
      :placeholder="fieldPlaceholder"
      :browse-text="$t('common.browse')">
      <template #file-name>
        <FrField
          v-model="filePathModel"
          class="file-import-floating-label"
          :disabled="disabled"
          :label="$t('scriptEditor.uploadFile')" />
      </template>
    </BFormFile>
    <div
      v-if="showVariables"
      class="fr-script-editor fr-script-editor-vars pb-0 px-3">
      <div class="pb-3">
        <BButton
          v-if="selectedVariables.length === 0 && !jsonEditToggle"
          class="my-2 float-right"
          :disabled="disabled"
          variant="link"
          size="sm"
          @click="addVariable('', '', 0)">
          <FrIcon
            icon-class="mr-2"
            name="add">
            {{ $t('common.variables') }}
          </FrIcon>
        </BButton>
        <template v-else>
          <div class="d-flex align-items-center">
            <label class="flex-grow-1 h6 text-uppercase mt-3">
              {{ $t('scriptEditor.variables') }}
            </label>
            <label
              v-if="!jsonStructured"
              class="text-secondary">
              {{ $t('scriptEditor.jsonNotStructured') }}
            </label>
            <FrField
              v-else
              v-model="jsonEditToggle"
              :disabled="disabled"
              type="boolean"
              :label="$t('scriptEditor.json')"
              size="sm"
              @change="jsonEditorToggle($event)" />
          </div>
          <VuePrismEditor
            v-if="jsonEditToggle"
            :code="variablesJsonCode"
            @change="variablesJsonCode = $event; checkIfCodeIsParsable($event)"
            language="json"
            :aria-label="$t('editor.accessibilityHelp')"
            :line-numbers="true"
            :readonly="readonly"
            @keydown="blurOnEscape" />
          <template v-else>
            <BFormRow
              class="pb-1"
              style="padding-right: 90px;">
              <BCol cols="6">
                <small>{{ $t('common.name') }}</small>
              </BCol>
              <BCol cols="6">
                <small>{{ $t('scriptEditor.value') }}</small>
              </BCol>
            </BFormRow>
            <VeeForm
              ref="observer"
              as="span">
              <div
                v-for="(selectedVariable, index) in selectedVariables"
                :key="selectedVariable.index"
                :class="[{'pt-2': index}, 'd-flex']">
                <div class="flex-grow-1 pr-3">
                  <BFormRow class="align-items-start">
                    <FrField
                      :value="selectedVariable.name"
                      @input="selectedVariable.name = $event; emitScriptValue()"
                      class="col-6"
                      :disabled="disabled"
                      input-class="form-control-sm form-control-dark"
                      validation="required"
                      :name="`${$t('common.name')}-${selectedVariable.index}`" />
                    <FrField
                      :value="selectedVariable.value.value"
                      @input="selectedVariable.value.value = $event; emitScriptValue()"
                      class="col-6"
                      :disabled="disabled"
                      input-class="form-control-sm form-control-dark"
                      validation="required"
                      :name="`${$t('common.value')}-${selectedVariable.index}`"
                      :type="selectedVariable.type" />
                  </BFormRow>
                </div>
                <div class="d-flex">
                  <BButton
                    variant="link"
                    class="max-height-50 mr-1"
                    :disabled="disabled"
                    size="sm"
                    @click="removeVariable(index)">
                    <FrIcon name="remove" />
                  </BButton>
                  <BButton
                    variant="link"
                    class="max-height-50 mr-1"
                    :disabled="disabled"
                    size="sm"
                    @click="addVariable('', '', index + 1)">
                    <FrIcon name="add" />
                  </BButton>
                </div>
              </div>
            </VeeForm>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {
  BButton,
  BCol,
  BFormFile,
  BFormRow,
} from 'bootstrap-vue';
import { debounce } from 'lodash';
import { Form as VeeForm } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import blurOnEscape from '@forgerock/platform-shared/src/utils/codeEditor';
import 'prismjs';
import 'prismjs/components/prism-groovy';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';
import VuePrismEditor from 'vue-prism-editor';
import 'vue-prism-editor/dist/VuePrismEditor.css';

/**
 * Component that takes both past and new backend data and allows user to add/edit
 * script and variables
 */
export default {
  name: 'ScriptEditor',
  components: {
    BButton,
    BCol,
    BFormFile,
    BFormRow,
    VuePrismEditor,
    FrField,
    FrIcon,
    VeeForm,
  },
  props: {
    /**
     * @model Contains all relevant script information
     */
    value: {
      type: Object,
      default: () => ({
        type: 'text/javascript',
        globals: {},
        source: '',
      }),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    showFileUpload: {
      type: Boolean,
      default: true,
    },
    scriptTitle: {
      type: String,
      default: null,
    },
    showVariables: {
      type: Boolean,
      default: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      jsonStructured: true,
      code: '',
      currentJSONCode: '',
      fileChanged: false,
      fieldPlaceholder: this.$t('scriptEditor.uploadFile'),
      filePathModel: '',
      jsonEditToggle: false,
      variablesJsonCode: '',
      scriptType: {
        value: 'text/javascript',
        options: [
          { text: 'Javascript', value: 'text/javascript' },
          { text: 'Groovy', value: 'groovy' },
        ],
      },
      selectedVariables: [],
      uniqueVariables: 0,
      uploadFileToggle: false,
      showScriptType: true,
    };
  },
  computed: {
    showLineNumbers() {
      return this.code.length > 0;
    },
  },
  mounted() {
    if (this.value) {
      this.setPropValues(this.value);
      this.emitScriptValue = debounce(this.emitScriptValue, 100);
    }
    // Hide script type option in the cloud
    if (this.$store.state.isFraas) {
      this.showScriptType = false;
    }
  },
  methods: {
    /**
     * Adds new and existing variable to array at bottom of component
     *
     * @param {String} name - name of new variable
     * @param {String} value - shows current value of new variable
     * @param {String} index - where in variable array to add new variable
     */
    addVariable(name, value, index) {
      let type = 'string';
      if (typeof value === 'object' && value !== null) {
        type = 'textarea';
      }
      this.selectedVariables.splice(index, 0, {
        name,
        value: {
          value,
          type,
        },
        index: this.uniqueVariables,
      });
      this.uniqueVariables += 1;
      this.$emit('disableSave', true);
    },
    /**
     * Validates code string can be parsed back if desired
     *
     * @param {String} code - current code string
     */
    checkIfCodeIsParsable(code) {
      // Current solution to avoid cursor not moving with entered code if JSON is
      // not properly formed
      setTimeout(() => {
        this.currentJSONCode = code;
        try {
          const globals = JSON.parse(code);
          this.jsonStructured = true;
          this.sendEmit(this.scriptType.value, globals);
          /**
           * triggered when script can be parsed
           * @property {Boolean} false script is not invalid
           */
          this.$emit('disableSave', false);
        } catch (e) {
          this.jsonStructured = false;
          /**
           * triggered when script cannot be parsed
           * @property {Boolean} true script is invalid
           */
          this.$emit('disableSave', true);
        }
      }, 0);
    },
    blurOnEscape,
    /**
     * Checks if variables are filled in properly and calls emit if so
     */
    emitScriptValue() {
      if (this.$refs.observer) {
        this.$refs.observer.validate().then((isValid) => {
          if (isValid) {
            const globals = {};
            this.selectedVariables.forEach((variable) => {
              globals[variable.name] = this.tryParse(variable.value.value);
            });
            this.$emit('disableSave', false);
            this.sendEmit(this.scriptType.value, globals);
          } else {
            this.$emit('disableSave', true);
          }
        });
      } else if (this.jsonEditToggle) {
        this.checkIfCodeIsParsable(this.currentJSONCode);
      } else {
        this.$emit('disableSave', false);
        this.sendEmit(this.scriptType.value, {});
      }
    },
    /**
     * Constructs globals object into object or string depending on toggle
     *
     * @param {Boolean} toggle - whether JSON editor toggle is enabled
     */
    jsonEditorToggle(toggle) {
      if (toggle) {
        const globals = {};
        this.selectedVariables.forEach((selectedVariable) => {
          globals[selectedVariable.name] = this.tryParse(selectedVariable.value.value);
        });
        this.variablesJsonCode = JSON.stringify(globals, null, 2);
      } else {
        // convert JSON object into object with key/value pairs from variablesJsonCode
        const parsedJson = this.tryParse(this.currentJSONCode);
        this.selectedVariables.length = 0;
        Object.keys(parsedJson).forEach((name, index) => {
          const value = parsedJson[name];
          this.addVariable(name, value, index);
        });
      }
    },
    /**
     * Splices out a variable from the variable array at the index selected
     *
     * @param {Number} variableIndex - index of variable we want to remove
     */
    removeVariable(variableIndex) {
      this.selectedVariables.splice(variableIndex, 1);
      this.emitScriptValue();
    },
    /**
     * Pulls in code string and plugs into code edit window, as well as switches
     * view back to code edit window
     *
     * @param {Object} event - metadata containing details of selected file
     */
    onFileChange(event) {
      this.fileChanged = true;
      const file = event.target.files[0];
      const fileComponents = file.name.split('.');
      if (fileComponents[fileComponents.length - 1] === 'js') {
        this.scriptType.value = 'text/javascript';
      } else if (fileComponents[fileComponents.length - 1] === 'text/groovy') {
        this.scriptType.value = 'groovy';
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.code = e.target.result;
        this.emitScriptValue();
      };
      reader.readAsText(file);
      this.filePathModel = event.target.files[0].name;
      this.uploadFileToggle = false;
    },
    /**
     * Builds current save object and emits out to parent that uses this component
     *
     * @param {String} type script type
     * @param {Object} globals script global variables
     */
    sendEmit(type, globals) {
      const scriptObject = {
        type,
        globals,
      };
      if (this.value?.file && !this.fileChanged) {
        scriptObject.file = this.value.file;
      } else {
        scriptObject.source = this.code;
      }
      /**
       * triggered whenever script is edited and has been validated
       * @property scriptObject the current script values (type, globals, file, source)
       */
      this.$emit('input', scriptObject);
    },
    /**
     * Sets prop values based on passed in value object
     *
     * @param {Object} newValue - saved metadata from backend
     * {
     *  type: javascript or groovy file type,
     *  globals: selected variable names and values,
     *  source: saved code if code method was selected,
     *  file: saved file path if file method was selected,
     * }
     */
    setPropValues(newValue) {
      this.selectedVariables.length = 0;
      if (newValue.type) {
        // If the script type is javascript and doesn't start with 'text/', prepend it with 'text/'
        this.scriptType.value = (newValue.type.includes('javascript') && !newValue.type.startsWith('text/')) ? `text/${newValue.type}` : newValue.type;
      }
      Object.keys(newValue.globals || {}).forEach((name, index) => {
        const globalValue = newValue.globals[name];
        this.addVariable(name, globalValue, index + 1);
      });
      if (newValue.file) {
        this.uploadFileToggle = true;
        this.fieldPlaceholder = newValue.file;
      } else if (newValue.source) {
        this.code = newValue.source;
      }
    },
    /**
     * Attempts to parse value
     *
     * @param {any} value - value we want to try to parse
     *
     * @returns parsed value on success, original value on fail
     */
    tryParse(value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    },
  },
  watch: {
    /**
     * Seems to be the only way I can currently catch command-z code changes
     */
    variablesJsonCode(code) {
      if (this.currentJSONCode !== code) {
        this.checkIfCodeIsParsable(code);
      }
    },
    code() {
      this.emitScriptValue();
    },
  },
};
</script>

<style lang="scss" scoped>
.max-height-50 {
  max-height: 50px;
}

:deep {
  .file-import-floating-label {
    margin: -13px;
  }

  .fr-field label {
    margin-bottom: 0 !important;
  }

  .multiselect {
    border: none;
    background: none;

    .multiselect__select::before {
      border: none;
      content: 'expand_more';
      font-family: 'Material Icons Outlined', sans-serif;
      color: $blue;
      top: 35%;
    }

    @supports (content: 'expand_more' / '') {
      .multiselect__select::before {
        content: 'expand_more' / '';
      }
    }

    .multiselect__single {
      margin-left: initial;
      color: $blue;
    }

    &.no-multiselect-label .multiselect__tags {
      padding-top: 0.6rem !important;
      border: none;
    }

    .multiselect__tags,
    .multiselect__single,
    .multiselect__input {
      background: none;
    }
  }

  .fr-script-editor-vars {
    background-color: #1a1e22;
    border-top: 1px solid $black;
    color: $gray-400;
    .btn-link,
    .h6 {
      color: $gray-400;
    }
  }
  .prism-editor-wrapper,
  code[class*="language-"],
  pre[class*="language-"] {
    background-color: $gray-900 !important;
    text-shadow: none;
    line-height: 1.75;
  }
  .language-css .token.string,
  .style .token.string,
  .token.entity,
  .token.operator,
  .token.url {
    background: transparent;
  }

  .form-control.form-control-dark {
    color: $white;
    background-color: #30373f;
    border-color: $gray-800;
  }
}

</style>
