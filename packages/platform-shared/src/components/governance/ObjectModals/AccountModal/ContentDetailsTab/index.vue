<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="!isNil(content)"
    class="p-4">
    <dl
      class="row"
      v-for="item in Object.keys(content)"
      :key="item">
      <dt class="col-lg-4">
        {{ item }}
      </dt>
      <dd class="col-lg-8 mb-4">
        {{ content[item] || blankValueIndicator }}
      </dd>
    </dl>
  </div>
</template>

<script>
import { isNil } from 'lodash';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';

export default {
  name: 'ContentDetailsTab',
  props: {
    content: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      blankValueIndicator,
    };
  },
  methods: {
    isNil,
  },
};
</script>
