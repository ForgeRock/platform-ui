<template>
  <BButton
    no-caret
    variant="outline-secondary"
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
};
</script>
