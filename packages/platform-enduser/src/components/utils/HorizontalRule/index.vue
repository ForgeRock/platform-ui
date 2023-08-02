<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="row">
    <div class="col pr-0">
      <hr>
    </div>
    <div
      class="col-auto pt-1"
      v-html="insert" />
    <div class="col pl-0">
      <hr>
    </div>
  </div>
</template>

<script>
/**
 * @description Component for making a horizontal rule line with text in the middle
 *
 * */
export default {
  name: 'HorizontalRule',
  props: {
    insert: {
      type: String,
      default: () => '',
    },
  },
};
</script>
