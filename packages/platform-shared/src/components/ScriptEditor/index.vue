<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="form-group">
    <div class="d-flex justify-content-end align-items-center">
      <label class="flex-grow-1 mb-0">
        {{ $t('scriptEditor.title') }}
      </label>
      <div class="d-flex align-items-center">
        <label
          v-show="showScriptType"
          class="mr-1 mb-0">
          {{ $t('scriptEditor.type') }}
        </label>
        <FrField
          v-show="showScriptType"
          v-model="scriptType.value"
          name="scriptType"
          type="select"
          :options="scriptType.options"
          :searchable="false"
          @input="emitScriptValue" />
        <FrField
          v-model="uploadFileToggle"
          type="boolean"
          :label="$t('scriptEditor.uploadFile')"
          size="sm" />
      </div>
    </div>
    <VuePrismEditor
      v-if="uploadFileToggle === false"
      v-model="code"
      :aria-label="$t('editor.accessibilityHelp')"
      :language="scriptType.value.split('/')[1]"
      :line-numbers="showLineNumbers"
      @input="emitScriptValue"
      @keydown="blurOnEscape" />
    <BFormFile
      v-show="uploadFileToggle === true"
      @change="onFileChange"
      accept=".js, .groovy"
      :placeholder="fieldPlaceholder">
      <template v-slot:file-name>
        <FrField
          v-model="filePathModel"
          class="file-import-floating-label"
          :label="$t('scriptEditor.uploadFile')" />
      </template>
    </BFormFile>
    <div class="justify-content-between pt-3">
      <BButton
        v-if="selectedVariables.length === 0 && !jsonEditToggle"
        variant="link"
        @click="addVariable('', '', 0)">
        <FrIcon
          name="add"
        />
        {{ $t('common.addObject', {object: $t('scriptEditor.variables')}) }}
      </BButton>
      <template v-else>
        <div class="d-flex align-items-center">
          <label class="flex-grow-1">
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
            type="boolean"
            :label="$t('scriptEditor.json')"
            size="sm"
            @change="jsonEditorToggle($event)" />
        </div>
        <template v-if="jsonEditToggle">
          <VuePrismEditor
            v-model="variablesJsonCode"
            language="json"
            :aria-label="$t('editor.accessibilityHelp')"
            :line-numbers="true"
            @input="checkIfCodeIsParsable($event.target.innerText)"
            @keydown="blurOnEscape" />
        </template>
        <template v-else>
          <ValidationObserver ref="validationObserver">
            <div
              v-for="(selectedVariable, index) in selectedVariables"
              :key="selectedVariable.index">
              <div :class="[{'pt-3': index}, 'd-flex']">
                <div class="flex-grow-1 pr-3">
                  <div class="form-row">
                    <FrField
                      v-model="selectedVariable.name"
                      class="px-1 col-6"
                      validation="required"
                      :label="$t('common.name')"
                      @input="emitScriptValue" />
                    <FrField
                      v-model="selectedVariable.value.value"
                      class="px-1 col-6"
                      validation="required"
                      :label="$t('scriptEditor.value')"
                      :type="selectedVariable.type"
                      @input="emitScriptValue" />
                  </div>
                </div>
                <BButton
                  variant="outline-secondary mr-1"
                  class="max-height-50"
                  @click="removeVariable(index)">
                  <FrIcon
                    name="remove"
                  />
                </BButton>
                <BButton
                  variant="outline-secondary mr-1"
                  class="max-height-50"
                  @click="addVariable('', '', index + 1)">
                  <FrIcon
                    name="add"
                  />
                </BButton>
              </div>
            </div>
          </ValidationObserver>
        </template>
        <small>
          {{ $t('scriptEditor.defineCustom') }}
        </small>
      </template>
    </div>
  </div>
</template>

<script>
import {
  BButton,
  BFormFile,
} from 'bootstrap-vue';
import { debounce } from 'lodash';
import { ValidationObserver } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import blurOnEscape from '@forgerock/platform-shared/src/utils/codeEditor';
import 'prismjs';
import 'prismjs/components/prism-groovy';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
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
    BFormFile,
    VuePrismEditor,
    FrField,
    FrIcon,
    ValidationObserver,
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
  },
  data() {
    return {
      jsonStructured: true,
      code: '',
      currentJSONCode: '',
      fieldPlaceholder: this.$t('scriptEditor.uploadFile'),
      filePathModel: '',
      jsonEditToggle: false,
      variablesJsonCode: '',
      scriptType: {
        value: 'text/javascript',
        options: [
          { text: 'Javascript', value: 'text/javascript' },
          { text: 'Groovy', value: 'text/groovy' },
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
      if (this.$refs.validationObserver) {
        this.$refs.validationObserver.validate().then((isValid) => {
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
      delete this.value.file;
      const file = event.target.files[0];
      const fileComponents = file.name.split('.');
      if (fileComponents[fileComponents.length - 1] === 'js') {
        this.scriptType.value = 'text/javascript';
      } else if (fileComponents[fileComponents.length - 1] === 'text/groovy') {
        this.scriptType.value = 'text/groovy';
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
      if (this.value && this.value.file) {
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
        // If the script type is not 'text/javascript' or 'text/groovy' prepend it with 'text/'
        this.scriptType.value = !newValue.type.startsWith('text/') ? `text/${newValue.type}` : newValue.type;
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

::v-deep {
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
}
</style>
