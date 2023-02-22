<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4">
    <dl
      class="row"
      v-for="(detail, name) in user"
      :key="name">
      <dt class="col-lg-4">
        {{ $t(`common.user.${name}`) }}
      </dt>
      <dd class="col-lg-8 mb-4">
        {{ detail || '--' }}
      </dd>
    </dl>
  </div>
</template>

<script>
export default {
  name: 'UserDetailsTab',
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
};
</script>
