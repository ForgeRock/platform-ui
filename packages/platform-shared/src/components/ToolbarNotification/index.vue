<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BNavItemDropdown
    class="fr-notification-icon align-self-center mr-4"
    right>
    <template slot="button-content">
      <i class="material-icons-outlined mr-2 md-24">
        notifications
      </i>
      <span
        v-if="notifications.length > 0"
        class="badge badge-pill badge-danger">
        {{ notifications.length }}
      </span>
    </template>
    <BDropdownHeader class="border-bottom py-3">
      <div class="fr-notification-header">
        <span>{{ $t('pages.app.notifications.title') }} ({{ notifications.length }})</span>
        <a
          v-if="notifications.length > 0"
          @click.prevent="clearAll()"
          class="float-right"
          href="#">
          {{ $t('pages.app.notifications.clearAll') }}
        </a>
      </div>
    </BDropdownHeader>

    <template v-if="notifications.length > 0">
      <div
        class="scrollbox"
        is="transition-group"
        name="notification-list">
        <div
          v-for="(notification, index) in notifications"
          :class="[
            `${notification.notificationType}-notification`,
            { 'border-bottom': (index + 1) < notifications.length }, 'dropdown-item', 'py-3', 'fr-notification-item']"
          :key="notification._id">
          <div class="media">
            <div class="media-body">
              <h6 class="my-0">
                {{ notification.message }}
              </h6>
              <small class="text-muted">
                {{ notification.createDate | cleanDate }}
              </small>
            </div>
            <BButton
              @click.prevent="clearOne(index)"
              variant="sm"
              type="button"
              class="btn btn-link my-auto">
              <i class="material-icons-outlined text-muted md-24">
                delete
              </i>
            </BButton>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="mt-4 mb-3 fr-no-notifications fr-notification-item">
        <div class="media">
          <div class="media-body align-self-center">
            <h6 class="text-center">
              {{ $t('pages.app.notifications.noNotifications') }}
            </h6>
          </div>
        </div>
      </div>
    </template>
  </BNavItemDropdown>
</template>

<script>
import {
  delay,
  isNull,
  sortBy,
} from 'lodash';
import {
  BNavItemDropdown,
  BDropdownHeader,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { mapState } from 'vuex';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';

dayjs.extend(utc);

/**
 * Display for system notifications for the logged in user
 *
 * notificationType supported:
 * danger
 * warning
 * success
 * info
 *
 * @fires GET /managed/resourceName/ID?_fields=_notifications/* - Retrieve all notifications for a specific resource
 * @fires DELETE /internal/notification - Remove one specific notification based on the notifications ID
 * @fires POST /notification?_action=deleteNotificationsForTarget&target=Id - Removes all notifications for a resource (e.g. managed/user/userID)
 */
export default {
  name: 'ToolbarNotification',
  components: {
    BNavItemDropdown,
    BDropdownHeader,
  },
  mixins: [
    NotificationMixin,
    RestMixin,
  ],
  data() {
    return {
      notifications: [],
      timeoutId: null,
    };
  },
  mounted() {
    this.loadData();
  },
  filters: {
    cleanDate(value) {
      return `${dayjs.utc(value).format('MMMM D, YYYY h:mm A')} UTC`;
    },
  },
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userId,
      internalUser: (state) => state.UserStore.internalUser,
      managedResource: (state) => state.UserStore.managedResource,
    }),
  },
  methods: {
    resetPolling() {
      if (!isNull(this.timeoutId)) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    },
    startPolling() {
      const pollingDelay = 3000;

      this.timeoutId = delay(() => {
        this.loadData();
      }, pollingDelay);
    },
    clearAll() {
      this.notifications = [];

      const target = this.internalUser ? 'internal/user/openidm-admin' : `${this.managedResource}/${this.userId}`;

      this.resetPolling();

      this.getRequestService()
        .post(`/notification?_action=deleteNotificationsForTarget&target=${target}`)
        .then(() => {
          this.displayNotification('IDMMessages', 'success', this.$t('pages.app.notifications.removedAll'));

          if (isNull(this.timeoutId)) {
            this.startPolling();
          }
        })
        .catch(() => {
          this.displayNotification('IDMMessages', 'error', this.$t('pages.app.notifications.failedToClear'));
        });
    },
    clearOne(index) {
      const notificationId = this.notifications[index]._id;

      this.resetPolling();
      this.notifications.splice(index, 1);
      this.getRequestService()
        .delete(`/internal/notification/${notificationId}`)
        .then(() => {
          this.displayNotification('IDMMessages', 'success', this.$t('pages.app.notifications.removed'));

          if (isNull(this.timeoutId)) {
            this.startPolling();
          }
        })
        .catch(() => {
          this.displayNotification('IDMMessages', 'error', this.$t('pages.app.notifications.failedToRemove'));
        });
    },
    loadData() {
      if (!isNull(this.userId)) {
        this.getRequestService({ headers: { 'Cache-Control': 'no-store, no-cache' } })
          .get(`/${this.managedResource}/${this.userId}?_fields=_notifications/*`)
          .then(({ data }) => {
            /* eslint no-underscore-dangle: 0 */
            if (data._notifications) {
              this.notifications = this.sortByDate(data._notifications);
            } else {
              this.notifications = [];
            }
            this.startPolling();
          })
          .catch(() => {});
      } else {
        this.startPolling();
      }
    },
    /**
     * Sorts input data by creation date, with newest at the top. Currently separated
     * into own method to allow for testing
     */
    sortByDate(data) {
      return sortBy(data, 'createDate').reverse();
    },
  },
};
</script>

<style lang="scss">
.fr-notification-icon {
  .fr-notification-item {
    transition: opacity 0.5s;
    width: 275px;
    border-bottom: inherit;

    &.info-notification {
      border-left: solid 4px $primary;
    }

    &.success-notification {
      border-left: solid 4px $success;
    }

    &.danger-notification {
      border-left: solid 4px $danger;
    }

    &.warning-notification {
      border-left: solid 4px $warning;
    }

    &.fr-no-notifications {
      border-bottom: 0;
    }
  }

  .badge-danger {
    position: absolute;
    margin-left: -20px;
    vertical-align: super;
  }

  .dropdown-menu {
    right: auto;
    left: -165px;
    padding-bottom: 0;

    .scrollbox {
      max-height: 14.1875rem;
      overflow-y: auto;
    }
  }

  .dropdown-item {
    white-space: inherit;
  }
}

@media (min-width: 768px) {
  .fr-notification-icon {
    .fr-notification-item {
      width: 325px;
    }

    .dropdown-menu {
      right: 0;
      left: auto;
    }
  }
}

// Animation
.notification-list-enter,
.notification-list-leave-to {
  opacity: 0;
}
</style>
