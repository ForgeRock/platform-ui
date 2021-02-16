<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BTab :title="$t('common.json.rawJson')">
    <div class="btn-toolbar p-3 justify-content-end flex-column flex-lg-row">
      <BButton
        variant="outline-primary"
        @click="copyValueToClipboard(jsonString)">
        <i
          class="material-icons-outlined mr-2"
          aria-hidden="true">
          file_copy
        </i>
        {{ $t('common.json.copyJson') }}
      </BButton>
    </div>
    <VuePrismEditor
      readonly
      language="json"
      line-numbers
      v-model="jsonString" />
  </BTab>
</template>

<script>
import {
  BButton,
  BTab,
} from 'bootstrap-vue';
import VuePrismEditor from 'vue-prism-editor';
import * as clipboard from 'clipboard-polyfill/text';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';

export default {
  name: 'JsonTab',
  components: {
    BButton,
    BTab,
    VuePrismEditor,
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
  methods: {
    copyValueToClipboard(value) {
      clipboard.writeText(value).then(() => {
        this.displayNotification('IDMMessages', 'success', this.$t('common.copySuccess'));
      }, (error) => {
        this.showErrorMessage(error, this.$t('common.copyFail'));
      });
    },
  },
};
</script>
