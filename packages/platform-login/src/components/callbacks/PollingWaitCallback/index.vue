<template>
  <div
    class="polling-spinner-container row justify-content-center">
    <FrSpinner
      class="polling-spinner mb-4"
      label="Spinning" />
    <div class="text-center text-muted w-100">
      {{ message }}
    </div>
  </div>
</template>
<script>
import Spinner from '@forgerock/platform-shared/src/components/Spinner/';

export default {
  components: {
    FrSpinner: Spinner,
  },
  props: {
    callback: {
      type: Object,
      required: true,
    },
    nextStep: {
      type: Function,
      required: true,
    },
  },
  data() {
    return { message: '' };
  },
  mounted() {
    this.message = this.callback.getMessage();
    setTimeout(() => {
      this.nextStep(null, true);
    }, this.callback.getWaitTime());
  },
};
</script>
