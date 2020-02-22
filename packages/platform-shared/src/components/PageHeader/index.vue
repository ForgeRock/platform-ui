<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <h1>
      {{ title }}
    </h1>
    <p class="font-weight-light text-muted mb-4">
      {{ subtitle }}
    </p>
  </div>
</template>

<script>
/**
 * @description Standard page header
 *
 * */
export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
  },
  data() {
    return {};
  },
};
</script>
