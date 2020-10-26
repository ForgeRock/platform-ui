<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BTab :title="$t('common.json.rawJson')">
    <div class="btn-toolbar p-3 justify-content-end flex-column flex-lg-row">
      <BButton
        variant="outline-primary"
        @click="copyValueToClipboard(jsonString)">
        <i class="material-icons-outlined mr-2">
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
