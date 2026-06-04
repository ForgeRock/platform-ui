<!-- Copyright (c) 2022-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    class="password-field"
    v-bind="{...$attrs}"
    :is-required-aria="true"
    v-on="$listeners" />
</template>
<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'PasswordCallback',
  components: {
    FrField,
  },
};
</script>
<style lang="scss">
.password-field {
  input[type='text'],
  input[type='password'] {
    padding-right: 60px;
  }
}
</style>
