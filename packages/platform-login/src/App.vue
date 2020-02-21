<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div id="app">
    <div
      id="appContentWrapper"
      class="h-100">
      <Transition
        name="fade"
        mode="out-in">
        <RouterView :key="this.$route.fullPath" />
      </Transition>
    </div>
    <!-- Application View -->
    <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
    <notifications
      group="IDMMessages"
      position="bottom left"
      width="320"
      :duration="400000">
      <template
        slot="body"
        slot-scope="props">
        <FrAlert
          class="w-50 m-3"
          :variant="props.item.type"
          show>
          {{ props.item.text }}
        </FrAlert>
      </template>
    </notifications>
  </div>
</template>

<script>
import Alert from '@forgerock/platform-components/src/components/Alert/';

export default {
  name: 'App',
  components: {
    FrAlert: Alert,
  },
};
</script>

<style lang="scss">
@import 'scss/main';
@import '~bootstrap/scss/bootstrap.scss';

#app {
  transition: all 0.2s ease;
  height: 100%;

  .container,
  .container-fluid {
    @media (min-width: 768px) {
      padding-left: $grid-gutter-width;
      padding-right: $grid-gutter-width;
    }
  }
}
</style>
