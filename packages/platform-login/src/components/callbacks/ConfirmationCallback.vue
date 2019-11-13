<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="row text-left ml-1 mb-2">
    <BButton
      v-for="(option, index) in options"
      :key="index"
      class="btn btn btn-block btn-lg btn-primary mt-3"
      variant="primary"
      @click="setValue(index)">
      {{ option }}
    </BButton>
  </div>
</template>

<script>
import { BButton } from 'bootstrap-vue';

export default {
  components: {
    BButton,
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
  mounted() {
    this.options = this.callback.getOptions();
  },
  data() {
    return {
      options: [],
    };
  },
  methods: {
    setValue(value) {
      this.callback.setInputValue(value);
      this.nextStep();
    },
  },
};
</script>
