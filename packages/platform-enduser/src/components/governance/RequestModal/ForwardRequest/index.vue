<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrForwardModalContent
      :description-text="$t('governance.requestModal.forward.description')"
      :comment-label="$t('governance.certificationTask.actionsModal.comment')"
      @request-comment="updateComment"
      @request-update-actors="updateActors"
    />
  </div>
</template>

<script>
import FrForwardModalContent from '@forgerock/platform-shared/src/views/Governance/ForwardModalContent';

export default {
  name: 'RequestForward',
  components: {
    FrForwardModalContent,
  },
  methods: {
    updateActors(value) {
      this.$emit('request-update-actors', value);
    },
    updateComment(value) {
      this.$emit('request-comment', value);
    },
  },
};
</script>
