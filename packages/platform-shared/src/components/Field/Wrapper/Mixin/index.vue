<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<script>
import {
  bind,
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
      type: [Array, Object, Number, String],
      default: '',
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
    delay(bind(() => {
      if (navigator.userAgent.includes('Edge')) {
        const element = document.getElementById(`${this.id}`);
        if (element && element.value.length && this.label) {
          this.floatLabels = true;
          this.inputValue = element.value;
        }
      } else if (navigator.userAgent.includes('Chrome')) {
        if (document.querySelectorAll(`#${this.id}:-webkit-autofill`).length > 0 && this.label) {
          this.floatLabels = true;
        }
      }
      this.hideLabel = false;
    }, this), 400);

    this.setInputValue(this.value);

    // Browser consistent focus fix
    if (this.autofocus) {
      delay(() => this.$refs.input.focus(), 100);
    }
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
      // for select when value in a key in an object
      const value = typeof newVal === 'object' && Object.hasOwnProperty.call(newVal, 'value') ? newVal.value : newVal;
      this.floatLabels = value.toString().length > 0 && !!this.label;
      this.$emit('input', value);
    },
  },
};
</script>
