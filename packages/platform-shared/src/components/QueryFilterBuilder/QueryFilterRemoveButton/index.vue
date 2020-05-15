<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BButton
    no-caret
    variant="outline-secondary"
    :disabled="disabled"
    @click="$emit('click')">
    <i class="material-icons-outlined">
      remove
    </i>
  </BButton>
</template>

<script>
import { BButton } from 'bootstrap-vue';

export default {
  name: 'RemoveButton',
  components: {
    BButton,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
