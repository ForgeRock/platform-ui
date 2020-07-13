<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->
<template>
  <li
    class="my-applications-list-item"
    data-test-id="my-applications-item">
    <ListItem :collapsible="collapsible">
      <template v-slot:list-item-header>
        <a
          class="pt-1 pb-1"
          data-test-id="my-applications-link"
          :href="applicationLoginLink"
          target="_blank">
          <div
            class="my-applications-list-item-brand-logo-wrapper mr-3"
            data-test-id="my-applications-list-item-brand-logo">
            <FallbackImage
              fallback="exit_to_app"
              :src="applicationIcon"
              :alt="applicationIconAltText" />
          </div>
          <span
            class="my-applications-list-item-text"
            data-test-id="my-applications-link-text">
            {{ applicationName }}
          </span>
        </a>
      </template>
    </ListItem>
  </li>
</template>

<script>
import ListItem from '@forgerock/platform-shared/src/components/ListItem/';
import FallbackImage from '@/components/utils/FallbackImage';
/**
 * @description Widget that provides a welcome message for the managed resource, also provides a button to directly access editing the resources profile.
 * */
export default {
  name: 'MyApplicationsListItem',
  extends: ListItem,
  props: {
    applicationDetails: {
      type: Object,
      default: () => ({
        dashboardDisplayName: '',
        dashboardLogin: '',
        dashboardIcon: '',
        brandLogoAltText: '',
      }),
    },
  },
  computed: {
    applicationName() {
      return this.applicationDetails.dashboardDisplayName[0];
    },
    applicationIcon() {
      return `${window.location.origin}/am/XUI/${this.applicationDetails.dashboardIcon[0]}`;
    },
    applicationIconAltText() {
      return `${this.applicationName} ${this.$t('pages.dashboard.applications.listItemBrandIconAltText')}`;
    },
    applicationLoginLink() {
      return this.applicationDetails.dashboardLogin[0];
    },
  },
  components: {
    ListItem,
    FallbackImage,
  },
};
</script>

<style lang="scss" scoped>
.my-applications-list-item {
  /deep/ .list-group-item.noncollapse {
    border: $border-width solid $gray-200;
    display: flex;
    flex-direction: column;
    border-radius: $border-radius;
    box-shadow: none;

    .media {
      flex: 1;

      a {
        flex: 1;
        display: flex;
        min-width: 100%;

        .my-applications-list-item-brand-logo-wrapper,
        .my-applications-list-item-text {
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .my-applications-list-item-brand-logo-wrapper {
          img {
            height: 1.5em;
            width: auto;
            border-radius: $border-radius;
            flex: 1;
          }
        }

        .my-applications-list-item-text {
          flex-direction: column;
          font-weight: $headings-font-weight;
          font-size: 1rem;
          color: $black;
          flex: 2;
        }
      }
    }
  }
}

</style>
