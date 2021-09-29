<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
const overridePrefix = 'overrides';

export default {
  name: 'TranslationMixin',
  methods: {
    /**
     * Checks if a translation value exists for a given path.
     * If a translation path does not exist in i18n, the path is returned
     *
     * @param {String} path path to check for a translation key
     * @returns {Boolean} if the key exists
     */
    translationExists(path) {
      return this.$t(path) !== path;
    },
    /**
     * Remove non alphanumeric characters from string
     * to get a valid i18n translation key
     *
     * @param {String} text string to convert to i18n key
     * @returns {String} text with all non-alphanumeric characters removed
     */
    toTranslationKey(text) {
      const key = text.replace(/[\W_]/g, '');
      return key;
    },
    /**
     * Attempt to get a translation for a given string.
     * If a translation exists, return that. Else return the string.
     * Non-alphanumeric characters are removed
     *
     * @param {String|String[]} text text to attempt to translate
     * @returns {String|String[]} translated text if found, original text if not
     */
    getTranslation(text) {
      if (!text) {
        return text;
      }

      // handle an array of strings
      if (Array.isArray(text)) {
        return text.map((x) => (this.getTranslation(x)));
      }

      // append the translationPrefix because overrides are not stored at the root level
      const key = `${overridePrefix}.${this.toTranslationKey(text)}`;
      if (this.translationExists(key)) {
        return this.$t(key);
      }
      // return the unaltered text parameter if no translation is found
      return text;
    },
  },
};
</script>
