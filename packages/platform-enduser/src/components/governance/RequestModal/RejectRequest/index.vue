<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-25">
    <div class="p-25">
      {{ subtitle() }}
    </div>
    <FrField
      @input="$emit('request-comment', $event);"
      class="mb-4"
      type="textarea"
      validation="required"
      name="rejectComment"
      :label="$t('governance.requestModal.reject.justification')"
      :description="$t('governance.requestModal.reject.footer')" />
  </div>
</template>

<script>

import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'RejectRequest',
  components: { FrField },
  methods: {
    subtitle() {
      return this.$t('governance.requestModal.subtitle', { modal: this.$t('common.reject').toLowerCase() });
    },
  },
};
</script>
<style scoped>
  .p-25 {
    padding-bottom: 25px;
  }
</style>
