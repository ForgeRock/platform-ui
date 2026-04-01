<!-- Copyright 2023 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BModal
    id="runPublishedTemplateModal"
    title-class="h5"
    title-tag="h2"
    :static="isTesting"
    :title="$t('governance.templates.runNow')">
    <div>
      {{ $t('governance.templates.runPublishedTemplateConfirm') }}
    </div>
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        class="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        variant="primary"
        data-testid="run-action"
        @click="$emit('run-published-template')">
        {{ $t('governance.templates.runNow') }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import {
  BButton,
  BModal,
} from 'bootstrap-vue';

export default {
  name: 'RunTemplateModal',
  components: {
    BButton,
    BModal,
  },
  data() {
    return {
      isTesting: false,
    };
  },
};
</script>
