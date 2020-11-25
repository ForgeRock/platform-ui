<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BAlert
    class="fr-alert ml-3"
    v-bind="$props">
    <template v-slot:dismiss>
      <i class="fr-alert-dismiss material-icons">
        close
      </i>
    </template>
    <i class="material-icons-outlined mr-2">
      {{ alertIcon }}
    </i>
    <!-- @slot Text that the alert will contain. -->
    <slot />
  </BAlert>
</template>

<script>
import { BAlert } from 'bootstrap-vue';

/**
 * Extends Bootstrap alert to provide alternative icon and styling
 */
export default {
  name: 'Alert',
  components: {
    BAlert,
  },
  props: {
    /**
     * Can be closed or dismissed by a user
     */
    dismissible: {
      type: Boolean,
      default: true,
    },
    /**
     * Will have a fade animation on dismiss
     */
    fade: {
      type: Boolean,
      default: true,
    },
    /**
     * Is visible on display
     */
    show: {
      type: Boolean,
      default: true,
    },
    /**
     * Type of alert. Available types: Primary, Secondary, Success, Danger, Warning, Information, Light, Dark'
     */
    variant: {
      type: String,
      default: 'primary',
    },
  },
  data() {
    return {};
  },
  computed: {
    alertIcon() {
      let icon;

      switch (this.variant) {
      case 'info':
      case 'primary':
        icon = 'info';
        break;
      case 'danger':
      case 'error':
        icon = 'error_outline';
        break;
      case 'warning':
        icon = 'warning';
        break;
      case 'success':
        icon = 'check_circle';
        break;
      default:
        icon = 'message';
      }

      return icon;
    },
  },
  methods: {
    collapse() {
      /**
       * Toggle alert collapse
       * @event toggle
       */
      this.$emit('toggle', true);
    },
  },
};
</script>

<style lang="scss" scoped>
  .fr-alert {
    display: flex;
    line-height: 1.25;

    &.alert-primary {
      border-left: 5px solid $primary;
      background-color: $fr-alert-primary-bg-color;
      color: $fr-alert-text-color;
    }

    &.alert-secondary {
      border-left: 5px solid $secondary;
      background-color: $fr-alert-secondary-bg-color;
      color: $fr-alert-text-color;
    }

    &.alert-success {
      border-left: 5px solid $success;
      background-color: $fr-alert-success-bg-color;
      color: $fr-alert-text-color;
    }

    &.alert-danger,
    &.alert-error {
      border-left: 5px solid $danger;
      background-color: $fr-alert-danger-bg-color;
      color: $fr-alert-text-color;
    }

    &.alert-warning {
      border-left: 5px solid $warning;
      background-color: $fr-alert-warning-bg-color;
      color: $fr-alert-text-color;
    }

    &.alert-info {
      border-left: 5px solid $info;
      background-color: $fr-alert-info-bg-color;
      color: $fr-alert-text-color;
    }

    &.alert-light {
      border-left: 5px solid $light;
      background-color: $fr-alert-light-bg-color;
      color: $fr-alert-text-color;
    }

    &.alert-dark {
      border-left: 5px solid $dark;
      color: $fr-alert-dark-text-color;
      background-color: $fr-alert-dark-bg-color;
    }

    /deep/ .close {
      height: 24px;
      padding: 0 12px 4px 0;
      outline: none;

      .fr-alert-dismiss {
        font-size: 16px;
      }
    }
  }
</style>
