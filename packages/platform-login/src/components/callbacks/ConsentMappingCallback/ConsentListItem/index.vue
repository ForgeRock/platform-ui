<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <li class="list-group-item text-left">
    <BMedia>
      <template #aside>
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
