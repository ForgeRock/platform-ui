<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrAgentsDetails
    :read-only="false"
    :is-end-user="false"
    :is-lcm="true" />
</template>

<script setup>
import FrAgentsDetails from '@forgerock/platform-shared/src/views/Governance/Agents/AgentsDetails/AgentsDetails';
</script>
