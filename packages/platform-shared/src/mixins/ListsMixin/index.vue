<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<script>
import {
  capitalize,
  has,
  keys,
  lowerCase,
} from 'lodash';

/**
 * @description Mixin for sharing common methods and computed properties between lists components
 */
export default {
  name: 'ListsMixin',
  methods: {
    isValidJSONString(str) {
      try {
        JSON.parse(JSON.stringify(str, null, 2));
      } catch (e) {
        return false;
      }
      return true;
    },
    validateCurrentJson() {
      try {
        const field = JSON.parse(this.currentJson);
        this.isValidJason = true;
        this.$emit('disable-save-button', false);
        this.$emit('update-field', field);
      } catch (e) {
        this.isValidJason = false;
        this.$emit('disable-save-button', true);
      }
    },
    getValueBasedOnType(obj) {
      if (obj.type === 'boolean') {
        return false;
      }
      if (obj.type === 'number') {
        return 0;
      }
      if (obj.type === 'array' && obj.items.type !== 'array' && obj.items.type !== 'object') {
        return [];
      }
      if (obj.type === 'array') {
        return [this.getValueBasedOnType(obj.items)];
      }
      if (obj.type === 'object') {
        return this.createObject(obj.properties);
      }

      return '';
    },
    // build object from schema
    createObject(properties) {
      // creates object with appropriate keys
      return keys(properties).reduce((accum, current) => {
        accum[current] = this.getValueBasedOnType(properties[current]);
        return accum;
      }, {});
    },
    /**
     * populate list of objects with new member.  Set defaults for boolean and number properties
     */
    addObjectToList(fieldNumber, index, list) {
      const emptyObjectWithKeys = this.createObject(list[fieldNumber].items.properties);

      // array of object value for unpopulated valued is empty string
      if (list[fieldNumber].value === '' || !has(list[fieldNumber], 'value')) {
        list[fieldNumber].value = [];
      }

      list[fieldNumber].value.splice(index + 1, 0, emptyObjectWithKeys);
    },
    /**
     * add empty list to list of lists component after index
     */
    addElementToList(fieldNumber, index, list) {
      const { items } = list[fieldNumber];
      const newElement = this.getValueBasedOnType(items);

      // set value to empty array instead of string
      if (list[fieldNumber].value === '' || !has(list[fieldNumber], 'value')) {
        list[fieldNumber].value = [];
      }

      if (list[fieldNumber].value.length === 0) {
        list[fieldNumber].value.push(newElement);
      } else {
        list[fieldNumber].value.splice(index + 1, 0, newElement);
      }

      if (list[fieldNumber].value === []) {
        list[fieldNumber].value = '';
      }
    },
    /**
     * remove list from list of lists component at index
     */
    removeElementFromList(fieldNumber, index, list) {
      list[fieldNumber].value.splice(index, 1);

      if (list[fieldNumber].value.length === 0) {
        list[fieldNumber].value = '';
      }
    },
  },
  computed: {
    lineCount() {
      if (this.field && this.field.value) {
        return this.stringifiedValue.split(/\r\n|\r|\n/).length;
      }
      return 1;
    },
    stringifiedValue: {
      get() {
        if (this.field && this.field.value) {
          return JSON.stringify(this.field.value, null, 4);
        }
        return '';
      },
      set(newValue) {
        return JSON.stringify(newValue, null, 4);
      },
    },
    description() {
      if (this.field && this.field.description) {
        return capitalize(this.field.description);
      } if (this.field && this.field.title) {
        return capitalize(this.field.title);
      }
      return capitalize(lowerCase(this.field.key));
    },
    readOnly() {
      return this.expanded === false;
    },
  },
};
</script>
