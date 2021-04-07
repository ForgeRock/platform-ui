<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import {
  delay,
  noop,
  cloneDeep,
  isEqual,
} from 'lodash';

export default {
  name: 'InputMixin',
  props: {
    /**
     * Autofocus field when rendered.
     */
    autofocus: {
      type: Boolean,
      default: false,
    },
    /**
     * if field should be disabled.
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * List of errors related to input value (mostly used for callback components)
     */
    errors: {
      type: Array,
      default: () => [],
    },
    /**
     * Input name.
     */
    name: {
      type: String,
      required: true,
    },
    /**
     * Related text that displays underneath field.
     */
    description: {
      type: String,
      default: '',
    },
    /**
     * Boolean to render label and help text as html.
     */
    isHtml: {
      type: Boolean,
      default: false,
    },
    /**
     * Placeholder value.
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * Boolean to show the input as readonly.
     */
    readonly: {
      type: Boolean,
      default: false,
    },
    /**
     * Vee-validate validation types to check against.
     */
    validation: {
      type: [String, Object],
      default: '',
    },
    /**
     * Whether error validation should happen when this component renders.
     */
    validationImmediate: {
      type: Boolean,
      default: false,
    },
    /**
     * v-model value
     */
    value: {
      type: [Array, Object, Number, String, Boolean],
      default: '',
    },
  },
  data() {
    return {
      errorMessages: [],
      floatLabels: false,
      id: null,
      inputValue: '',
      oldValue: null,
    };
  },
  beforeMount() {
    // eslint-disable-next-line no-underscore-dangle
    this.id = `floatingLabelInput${this._uid}`;
  },
  mounted() {
    delay(() => {
      if (navigator.userAgent.includes('Edge')) {
        const element = document.getElementById(`${this.id}`);
        if (element && element.value.length && this.label) {
          this.floatLabels = !!this.label;
          this.inputValue = element.value;
        }
      } else if (navigator.userAgent.includes('Chrome')) {
        const node = this.$refs.input;
        try {
          const nativeMatches = node.matches || node.msMatchesSelector;
          if (nativeMatches.call(node, ':-webkit-autofill') && this.label) {
            this.floatLabels = !!this.label;
          }
        } catch (e) {
          noop();
        }
      }
    }, 500, this);

    this.setInputValue(this.value);
  },
  watch: {
    value(newVal) {
      this.setInputValue(newVal);
    },
    inputValue: {
      handler(newVal) {
        if (newVal !== undefined && this.inputValueHandler) {
          this.inputValueHandler(newVal);
        }
      },
      deep: true,
    },
  },
  methods: {
    /**
    * Default setInputValue method. Overrides possible in components
    *
    * @param {Array|Object|Number|String} newVal value to be set for internal model
    */
    setInputValue(newVal) {
      if (newVal !== undefined && newVal !== null) {
        if (!isEqual(this.oldValue, newVal)) {
          this.inputValue = newVal;
          this.oldValue = cloneDeep(newVal);
        }
      }
    },
  },
};
</script>
