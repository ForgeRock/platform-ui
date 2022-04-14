<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import {
  delay,
  noop,
} from 'lodash';

export default {
  name: 'InputMixin',
  props: {
    /**
     * if field should be disabled.
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Input name.
     */
    fieldName: {
      type: String,
      default: '',
    },
    /**
     * Related text that displays underneath field.
     */
    helpText: {
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
     * Function used to validate data.
     */
    validator: {
      type: Function,
      default: () => noop,
    },
    /**
     * v-model value
     */
    value: {
      type: [Array, Object, Number, String, Boolean],
      default: '',
    },
    /**
     * Boolean to show the input as readonly.
     */
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      errorMessages: [],
      floatLabels: false,
      hideLabel: true,
      id: null,
      inputValue: '',
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
          this.floatLabels = true;
          this.inputValue = element.value;
        }
      } else if (navigator.userAgent.includes('Chrome')) {
        const node = this.$refs.input;
        try {
          const nativeMatches = node.matches || node.msMatchesSelector;
          if (nativeMatches.call(node, ':-webkit-autofill') && this.label) {
            this.floatLabels = true;
          }
        } catch (e) {
          noop();
        }
      }
      this.hideLabel = false;
    }, 500, this);

    this.setInputValue(this.value);
  },
  watch: {
    inputValue: {
      handler(newVal) {
        if (newVal !== undefined) {
          this.inputValueHandler(newVal);
        }
      },
      deep: true,
    },
    value(newVal) {
      this.setInputValue(newVal);
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
        this.inputValue = newVal;
      }
    },
    /**
    * Default inputValueHandler method. Overrides possible in components
    *
    * @param {Array|Object|Number|String} newVal value to be set for internal model
    */
    inputValueHandler(newVal) {
      if (newVal === null) {
        this.$emit('input', null);
      } else {
        // for select when value in a key in an object
        const value = typeof newVal === 'object' && Object.hasOwnProperty.call(newVal, 'value') ? newVal.value : newVal;
        this.floatLabels = value.toString().length > 0 && !!this.label;
        this.$emit('input', value);
      }
    },
  },
};
</script>
