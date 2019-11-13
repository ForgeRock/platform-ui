<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="row">
    <div class="col pr-0">
      <hr>
    </div>
    <div
      class="col-auto pt-1"
      v-html="insert">
      {{ insert }}
    </div>
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

<style lang="scss" scoped>
</style>
