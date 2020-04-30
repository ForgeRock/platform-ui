<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <BContainer fluid="true">
      <BRow v-if="widgets.length">
        <div
          v-for="(widget, index) in widgets"
          :class="{'col-sm-4': widget.size === 'small', 'col-sm-6': widget.size === 'medium', 'col-sm-12': widget.size === 'large', 'mt-4': true}"
          :key="widget.type + index">
          <Component
            :is="widget.type"
            :user-details="userDetails"
            :details="widget.details" />
        </div>
      </BRow>
      <BJumbotron
        v-else
        class="mt-4 text-center">
        <div class="d-flex justify-content-center mt-3">
          <i class="material-icons-outlined mr-4 md-64">
            donut_large
          </i>
          <div class="flex-fow-1">
            <h2>{{ $t('pages.dashboard.noWidget') }}</h2>
            <p v-html="$t('pages.dashboard.noWidgetSubText')" />
          </div>
        </div>
      </BJumbotron>
    </BContainer>
    <BContainer v-if="myApplications.length">
      <BCol>
        <section
          data-test-id="my-applications"
          class="my-applications-wrapper">
          <ListGroup
            :title="$t('pages.dashboard.applications.heading')"
          >
            <ul
              class="list-unstyled ml-4 mr-4 mb-4 my-applications-tiles"
              data-test-id="my-applications-list">
              <FrMyApplicationsListItem
                v-for="application in myApplications"
                :key="application.dashboardDisplayName[0]"
                :application-details="application" />
            </ul>
          </ListGroup>
        </section>
      </BCol>
    </BContainer>
  </div>
</template>

<script>
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import Welcome from '@/components/dashboard/widgets/WelcomeWidget';
import FrMyApplicationsListItem from '@/components/dashboard/applications/MyApplicationsListItem';
import ListGroup from '@forgerock/platform-shared/src/components/ListGroup/';

/**
 * @description Controlling component for the dashboard
 * @event GET
 */
export default {
  name: 'Dashboard',
  mixins: [
    RestMixin,
    NotificationMixin,
  ],
  components: {
    FrMyApplicationsListItem,
    Welcome,
    ListGroup,
  },
  data() {
    return {
      widgets: [],
      myApplications: [],
      userDetails: this.$store.getters['UserStore/getUserState'],
    };
  },
  mounted() {
    this.loadWidgets();
    this.loadMyApplications();
  },
  methods: {
    /**
     * @description Loads a list of permitted applications
     * @fires GET realms/root/realms/root/dashboard/assigned
     * @return void
     * */
    loadMyApplications() {
      this.getRequestService({
        context: 'AM',
        apiVersion: 'protocol=1.1,resource=1.0',
      })
        .get('realms/root/realms/root/dashboard/assigned', { withCredentials: true })
        .then(({ data }) => {
          // Alpha sorted by name
          this.myApplications = Object.values(data).sort((a, b) => a.dashboardDisplayName[0].localeCompare(b.dashboardDisplayName[0]));
        });
    },
    /**
     * @description Provides a list of Widgets from config file ui-dashboard.json
     * @fires GET config/ui/dashboard
     * @return void
     * */
    loadWidgets() {
      this.getRequestService().get('config/ui/dashboard')
        .then(({ data }) => {
          this.widgets = data.dashboard.widgets;
        })
        .catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
  .my-applications {
    &-wrapper {
      background-color: $white;
      border-radius: $border-radius;
      box-shadow: $box-shadow;
    }

    &-tiles {
      display: grid;
      grid-template-columns: 1fr;
      grid-gap: 1.5rem  $grid-gutter-width;
      grid-auto-flow: row dense;

      @include media-breakpoint-up('md') {
        grid-template-columns: repeat(2, 1fr);
      }

      @include media-breakpoint-up('lg') {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
  }
</style>
