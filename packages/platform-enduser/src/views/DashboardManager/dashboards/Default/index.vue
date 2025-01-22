<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BContainer fluid="true">
      <BRow
        v-if="widgets.length"
        class="mx-4">
        <div
          v-for="(widget, index) in widgets"
          :class="{'col-sm-4': widget.size === 'small', 'col-sm-6': widget.size === 'medium', 'col-sm-12': widget.size === 'large', 'mt-4': true}"
          :key="widget.type + index">
          <Component
            :is="widget.type"
            :details="widget.details"
            :display-compact-header="myApplications.length > 0"
          />
        </div>
      </BRow>
      <BJumbotron
        v-else
        class="mt-4 text-center">
        <div class="d-flex justify-content-center mt-3">
          <FrIcon
            icon-class="mr-4 md-64"
            name="donut_large" />
          <div class="flex-fow-1">
            <h1 class="h2">
              {{ $t('pages.dashboard.noWidget') }}
            </h1>
            <p v-html="$t('pages.dashboard.noWidgetSubText')" />
          </div>
        </div>
      </BJumbotron>
    </BContainer>
    <BContainer v-if="myApplications.length">
      <BCol>
        <section class="my-applications-wrapper">
          <ListGroup :title="$t('pages.dashboard.applications.heading')">
            <ul class="list-unstyled ml-4 mr-4 mb-4 my-applications-tiles">
              <FrConsumerApplications
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
import {
  BCol,
  BContainer,
  BJumbotron,
  BRow,
} from 'bootstrap-vue';
import { omit } from 'lodash';
import { mapState } from 'vuex';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ListGroup from '@forgerock/platform-shared/src/components/ListGroup/';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrConsumerApplications from '@/views/DashboardManager/dashboards/Default/ConsumerApplications';
import Welcome from '@/views/DashboardManager/dashboards/widgets/WelcomeWidget';
import Workflow from '@/views/DashboardManager/dashboards/widgets/WorkflowControlWidget';

/**
 * @description Controlling component for the dashboard
 * @event GET
 */
export default {
  name: 'DefaultDashboard',
  mixins: [
    RestMixin,
    NotificationMixin,
  ],
  components: {
    BCol,
    BContainer,
    BJumbotron,
    BRow,
    FrConsumerApplications,
    FrIcon,
    ListGroup,
    Welcome,
    Workflow,
  },
  data() {
    return {
      myApplications: [],
      widgets: [],
    };
  },
  computed: {
    ...mapState({
      workflow: (state) => state.workflow,
      realm: (state) => state.realm,
    }),
  },
  mounted() {
    this.loadWidgets();
    if (this.$store.state.SharedStore.workforceEnabled === false) {
      this.loadConsumerApplications();
    }
  },
  methods: {
    /**
     * @description Provides a list of Widgets from config file ui-dashboard.json
     * @fires GET config/ui/dashboard
     * @return void
     * */
    loadWidgets() {
      this.getRequestService().get('config/ui/dashboard')
        .then(({ data }) => {
          this.widgets = data.dashboard.widgets;
          if (this.workflow && this.$store.state.isFraas === false) {
            this.widgets.push({
              type: 'Workflow',
              size: 'large',
            });
          }
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('pages.dashboard.errorGetApplications'));
        });
    },
    /**
     * @description Loads a list of permitted applications
     * @fires GET realms/root/realms/<current-realm>/dashboard/assigned
     * @return void
     * */
    loadConsumerApplications() {
      this.getRequestService({
        context: 'AM',
      })
        .get(`realms/root/realms/${this.realm}/dashboard/assigned`, { withCredentials: true })
        .then(({ data }) => {
          const apps = omit(data, ['_id', '_rev']);
          // Alpha sorted by name
          this.myApplications = Object.values(apps).sort((a, b) => a.dashboardDisplayName[0].localeCompare(b.dashboardDisplayName[0]));
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('pages.dashboard.errorGetApplications'));
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
