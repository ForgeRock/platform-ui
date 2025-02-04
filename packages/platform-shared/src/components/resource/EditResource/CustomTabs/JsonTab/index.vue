<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BTab :title="$t('common.json.rawJson')">
    <div class="btn-toolbar p-3 justify-content-end flex-column flex-lg-row">
      <BButton
        variant="outline-primary"
        @click="copyValueToClipboard(jsonString)">
        <FrIcon
          icon-class="mr-2"
          name="file_copy">
          {{ $t('common.json.copyJson') }}
        </FrIcon>
      </BButton>
    </div>
    <VuePrismEditor
      readonly
      language="json"
      line-numbers
      v-model="json"
      :aria-label="$t('editor.accessibilityHelp')"
      :highlight="(code) => highlighter(code, 'json')"
      @keydown="blurOnEscape" />
  </BTab>
</template>

<script>
import {
  BButton,
  BTab,
} from 'bootstrap-vue';
import { PrismEditor as VuePrismEditor } from 'vue-prism-editor';
import * as clipboard from 'clipboard-polyfill/text';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import blurOnEscape, { highlighter } from '@forgerock/platform-shared/src/utils/codeEditor';

export default {
  name: 'JsonTab',
  components: {
    BButton,
    BTab,
    VuePrismEditor,
    FrIcon,
  },
  mixins: [
    NotificationMixin,
  ],
  props: {
    jsonString: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      json: this.jsonString,
    };
  },
  methods: {
    blurOnEscape,
    highlighter,
    copyValueToClipboard(value) {
      clipboard.writeText(value).then(() => {
        this.displayNotification('success', this.$t('common.copySuccess'));
      }, (error) => {
        this.showErrorMessage(error, this.$t('common.copyFail'));
      });
    },
  },
};
</script>
