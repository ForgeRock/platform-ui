<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BAlert
    show
    variant="danger">
    <i class="material-icons-outlined">
      error_outline
    </i>
    {{ $t('autoAccess.access.dataSources.errorMessages.invalidJSONL') }}
  </BAlert>
</template>
<script>
import { BAlert } from 'bootstrap-vue';

export default {
  name: 'PreviewFileJSON',
  components: {
    BAlert,
  },
};
</script>
