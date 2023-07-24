<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-25">
    <FrField
      @input="$emit('request-comment', $event);"
      name="addComment"
      type="textarea"
      validation="required"
      :label="$t('common.comment')" />
  </div>
</template>

<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'AddComment',
  components: { FrField },
};
</script>
<style scoped>
  .p-25{
    padding-bottom: 25px;
  }
</style>
