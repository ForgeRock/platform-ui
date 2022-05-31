<!-- Copyright (c) 2019-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BAlert
    class="fr-alert"
    v-bind="$props"
    :data-testid="testId"
    aria-live="assertive">
    <template v-slot:dismiss>
      <FrIcon
        class="fr-alert-dismiss"
        :aria-label="$t('common.close')"
        :outlined="false"
        name="close" />
    </template>
    <FrIcon
      v-if="showIcon"
      class="mr-2"
      :name="alertIcon"
    />
    <!-- @slot Text that the alert will contain -->
    <slot />
  </BAlert>
</template>

<script>
import { BAlert } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
/**
 * Extends Bootstrap alert to provide alternative icon and styling
 */
export default {
  name: 'Alert',
  components: {
    BAlert,
    FrIcon,
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
     * Accessibility name
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * Type of alert
     * @values primary, secondary, success, danger, warning, information, light, dark
     */
    variant: {
      type: String,
      default: 'primary',
    },
    /**
     * Should the Alert component render an icon
     */
    showIcon: {
      type: Boolean,
      default: true,
    },
    testId: {
      type: String,
      default: 'FrAlert',
    },
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

    ::v-deep .close {
      height: 24px;
      padding: 0 12px 4px 0;
      outline: none;

      .fr-alert-dismiss {
        font-size: 16px;
      }
    }
  }
</style>
