<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrEditResource />
</template>

<script>
import EditResource from '@forgerock/platform-shared/src/components/resource/EditResource';

/**
 * @description View for edit resource component
 *
 */
export default {
  name: 'EditResourceView',
  components: {
    FrEditResource: EditResource,
  },
};
</script>
