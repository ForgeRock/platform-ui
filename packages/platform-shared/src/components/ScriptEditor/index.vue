<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="form-group">
    <div class="d-flex justify-content-end align-items-center">
      <label class="flex-grow-1 mb-0">
        {{ $t('scriptEditor.title') }}
      </label>
      <div class="d-flex align-items-center">
        <label class="mr-1 mb-0">
          {{ $t('scriptEditor.type') }}
        </label>
        <FrField
          :field="scriptType"
          @valueChange="emitScriptValue" />
        <FrField :field="uploadFileToggle" />
      </div>
    </div>
    <VuePrismEditor
      v-if="uploadFileToggle.value === false"
      v-model="code"
      :language="scriptType.value"
      :line-numbers="true"
      @input="emitScriptValue" />
    <BFormFile
      v-show="uploadFileToggle.value === true"
      @change="onFileChange"
      accept=".js, .groovy"
      :placeholder="fieldPlaceholder">
      <template v-slot:file-name>
        <FrField
          :field="filePathModel"
          class="file-import-floating-label" />
      </template>
    </BFormFile>
    <div class="justify-content-between pt-3">
      <BButton
        v-if="selectedVariables.length === 0"
        variant="link"
        @click="addVariable('', '', 0)">
        <i class="material-icons-outlined">
          add
        </i>
        {{ $t('common.add') }} {{ $t('scriptEditor.variables') }}
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
            :field="jsonEditToggle"
            @valueChange="jsonEditorToggle($event.value)" />
        </div>
        <template v-if="jsonEditToggle.value">
          <VuePrismEditor
            v-model="variablesJsonCode"
            language="json"
            :line-numbers="true"
            @input="checkIfCodeIsParsable($event.target.innerText)" />
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
                      :field.sync="selectedVariable.name"
                      class="px-1 col-6"
                      @valueChange="emitScriptValue" />
                    <FrField
                      :field.sync="selectedVariable.value"
                      class="px-1 col-6"
                      @valueChange="emitScriptValue" />
                  </div>
                </div>
                <BButton
                  variant="outline-secondary mr-1"
                  class="max-height-50"
                  @click="removeVariable(index)">
                  <i class="material-icons-outlined">
                    remove
                  </i>
                </BButton>
                <BButton
                  variant="outline-secondary mr-1"
                  class="max-height-50"
                  @click="addVariable('', '', index + 1)">
                  <i class="material-icons-outlined">
                    add
                  </i>
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
    ValidationObserver,
  },
  props: {
    /**
     * Binding to v-model
     */
    value: {
      type: Object,
      default: () => ({
        type: 'javascript',
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
      filePathModel: {
        title: this.$t('scriptEditor.uploadFile'),
        value: '',
      },
      jsonEditToggle: {
        title: this.$t('scriptEditor.json'),
        type: 'boolean',
        value: false,
        height: 17,
        width: 28,
      },
      variablesJsonCode: '',
      scriptType: {
        type: 'select',
        value: 'javascript',
        options: [
          { text: 'Javascript', value: 'javascript' },
          { text: 'Groovy', value: 'groovy' },
        ],
      },
      selectedVariables: [],
      uniqueVariables: 0,
      uploadFileToggle: {
        title: this.$t('scriptEditor.uploadFile'),
        type: 'boolean',
        value: false,
        height: 17,
        width: 28,
      },
    };
  },
  mounted() {
    this.setPropValues(this.value);
    this.emitScriptValue = debounce(this.emitScriptValue, 100);
  },
  methods: {
    /**
     * Adds new and existing variable to array at bottom of component
     *
     * @property {string} name - current value which shows the name of new variable
     * @property {string} value - shows current value of new variable
     * @property {string} index - where in variable array to add new variable
     */
    addVariable(name, value, index) {
      let type = 'string';
      if (typeof value === 'object' && value !== null) {
        type = 'textarea';
      }
      this.selectedVariables.splice(index, 0, {
        name: {
          title: this.$t('common.name'),
          value: name,
          validation: 'required',
        },
        value: {
          title: this.$t('scriptEditor.value'),
          value: value !== '' ? JSON.stringify(value, null, 2) : value,
          validation: 'required',
          type,
        },
        index: this.uniqueVariables,
      });
      this.uniqueVariables += 1;
    },
    /**
     * Validates code string can be parsed back if desired
     *
     * @property {string} code - current code string
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
        } catch (e) {
          this.jsonStructured = false;
        }
      }, 0);
    },
    /**
     * Checks if variables are filled in properly and calls emit if so
     */
    emitScriptValue() {
      if (this.$refs.validationObserver) {
        this.$refs.validationObserver.validate().then((isValid) => {
          if (isValid) {
            const globals = {};
            this.selectedVariables.forEach((variable) => {
              globals[variable.name.value] = this.tryParse(variable.value.value);
            });
            this.sendEmit(this.scriptType.value, globals);
          }
        });
      } else if (this.jsonEditToggle.value) {
        this.checkIfCodeIsParsable(this.currentJSONCode);
      } else {
        this.sendEmit(this.scriptType.value, {});
      }
    },
    /**
     * Constructs globals object into object or string depending on toggle
     *
     * @property {boolean} toggle - whether JSON toggle is enabled
     */
    jsonEditorToggle(toggle) {
      if (toggle) {
        const globals = {};
        this.selectedVariables.forEach((selectedVariable) => {
          globals[selectedVariable.name.value] = this.tryParse(selectedVariable.value.value);
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
     * @property {Number} variableIndex - index of variable we want to remove
     */
    removeVariable(variableIndex) {
      this.selectedVariables.splice(variableIndex, 1);
      this.emitScriptValue();
    },
    /**
     * Pulls in code string and plugs into code edit window, as well as switches
     * view back to code edit window
     *
     * @property {Object} event - metadata containing details of selected file
     */
    onFileChange(event) {
      delete this.value.file;
      const file = event.target.files[0];
      const fileComponents = file.name.split('.');
      if (fileComponents[fileComponents.length - 1] === 'js') {
        this.scriptType.value = 'javascript';
      } else if (fileComponents[fileComponents.length - 1] === 'groovy') {
        this.scriptType.value = 'groovy';
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.code = e.target.result;
        this.emitScriptValue();
      };
      reader.readAsText(file);
      this.filePathModel.value = event.target.files[0].name;
      this.uploadFileToggle.value = false;
    },
    /**
     * Builds current save object and emits out to parent that uses this component
     */
    sendEmit(type, globals) {
      const scriptObject = {
        type,
        globals,
      };
      if (this.value.file) {
        scriptObject.file = this.value.file;
      } else {
        scriptObject.source = this.code;
      }
      this.$emit('input', scriptObject);
    },
    /**
     * Sets prop values based on passed in value object
     *
     * @property {Object} newValue - saved metadata from backend
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
        this.scriptType.value = newValue.type;
      }
      Object.keys(newValue.globals).forEach((name, index) => {
        const globalValue = newValue.globals[name];
        this.addVariable(name, globalValue, index + 1);
      });
      if (newValue.file) {
        this.uploadFileToggle.value = true;
        this.fieldPlaceholder = newValue.file;
      } else if (newValue.source) {
        this.code = newValue.source;
      }
    },
    /**
     * Attempts to parse value
     *
     * @property {any} value - value we want to try to parse
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
  },
};
</script>

<style lang="scss" scoped>
.max-height-50 {
  max-height: 50px;
}

/deep/ {
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

    .multiselect__tags,
    .multiselect__single,
    .multiselect__input {
      background: none;
    }
  }

  .prism-editor-wrapper {
    background-color: $gray-100;
  }

  pre[class*=language-] {
    padding: 1rem;
    background-color: $gray-100;
    font-size: 14px;
  }
}
</style>
