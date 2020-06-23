<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <li class="list-group-item text-left">
    <BMedia>
      <template v-slot:aside>
        <BImg
          :alt="displayName"
          :src="icon"
          height="24"
          width="24"
          @error="failedImageHandler" />
      </template>
      <h5 class="mb-0">
        {{ displayName }}
      </h5>
    </BMedia>
  </li>
</template>

<script>
import { BMedia, BImg } from 'bootstrap-vue';
import defaultAppImg from '@forgerock/platform-shared/src/assets/images/default-app.svg';

export default {
  name: 'ConsentMappingCallback',
  components: {
    BMedia, BImg,
  },
  computed: {
    displayName() {
      return this.callback.getOutputByName('displayName');
    },
    icon() {
      return this.callback.getOutputByName('icon') || defaultAppImg;
    },
  },
  props: {
    callback: {
      type: Object,
      required: true,
    },
  },
  methods: {
    failedImageHandler(e) {
      e.target.src = defaultAppImg;
    },
  },
};
</script>
