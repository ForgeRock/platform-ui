<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BTab :title="$t('common.json.rawJson')">
    <div class="btn-toolbar p-3 justify-content-end flex-column flex-lg-row">
      <BButton
        variant="outline-primary"
        @click="copyValueToClipboard(jsonString)">
        <FrIcon
          class="mr-2"
          name="file_copy"
        />
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
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

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
