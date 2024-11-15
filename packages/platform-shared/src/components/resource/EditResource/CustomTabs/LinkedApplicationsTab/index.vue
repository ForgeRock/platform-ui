<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BTab
    v-if="linkedApplications.length"
    :title="tabName">
    <template>
      <div>
        <BCardHeader class="p-0">
          <div class="justify-content-between p-3 border-bottom-0">
            <FrSearchInput
              :value="searchQuery"
              :placeholder="$t('common.search')"
              @input="search"
            />
          </div>
        </BCardHeader>

        <div
          v-if="!filteredApplications.length"
          class="col-lg-8 offset-lg-2">
          <div
            class="text-center mt-2 mb-5 py-5">
            <h5>{{ $t('pages.linkedApplications.noLinkedApplicationsFound') }}</h5>
            <p class="mb-4">
              {{ $t('listResource.noResultsHelp') }}
            </p>
            <slot />
          </div>
        </div>
        <BTable
          v-else
          class="mb-0"
          hover
          id="linked-apps-table"
          :items="filteredApplications"
          :fields="fields"
          :per-page="perPage"
          :current-page="currentPage"
          @row-clicked="viewLinkedApplicationDetails($event)">
          <template
            #cell(name)="data">
            <BMedia no-body>
              <BImg
                class="mt-1 mr-4 size-28"
                :src="require(`@forgerock/platform-shared/src/assets/images/connectors/${data.item.image}`)"
                :alt="$t('common.logo')"
                fluid />
              <div class="media-body align-self-center">
                <h5 class="m-0">
                  {{ data.item.name }}
                </h5>
                <small class="text-muted">
                  {{ data.item.connectorType }}
                </small>
              </div>
            </BMedia>
          </template>
        </BTable>

        <FrPagination
          v-if="filteredApplications.length > 10"
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          aria-controls="linked-apps-table"
          @on-page-size-change="pageSizeChange"
        />
      </div>
    </template>
    <LinkedApplicationModal :application-data="modalData" />
  </BTab>
</template>

<script>
import {
  BCardHeader,
  BImg,
  BMedia,
  BTab,
  BTable,
} from 'bootstrap-vue';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import LinkedApplicationModal from '@forgerock/platform-shared/src/components/resource/EditResource/CustomTabs/LinkedApplicationsTab/LinkedApplicationModal';

export default {
  name: 'LinkedApplicationsTab',
  components: {
    BImg,
    BMedia,
    BCardHeader,
    BTab,
    BTable,
    FrPagination,
    FrSearchInput,
    LinkedApplicationModal,
  },
  data() {
    return {
      perPage: 10,
      currentPage: 1,
      searchQuery: '',
      fields: [
        {
          key: 'name',
          label: this.$t('applications.listView.name'),
          sortable: true,
        },
      ],
      filteredApplications: [],
      modalData: {},
      workforceEnabled: this.$store.state.SharedStore.workforceEnabled,
    };
  },
  props: {
    linkedApplications: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    viewLinkedApplicationDetails(event) {
      this.modalData = event;
      this.$root.$emit('bv::show::modal', 'linkedApplicationModal');
    },
    search(query) {
      this.searchQuery = query;
      // reset pagination to page 1 on search
      this.currentPage = 1;
      if (query === '') {
        this.filteredApplications = [...this.linkedApplications];
      } else {
        this.filteredApplications = this.linkedApplications.filter((item) => item.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
      }
    },
    /*
     * @description listener of the on-page-size-change event emmited by the pagination component when the size of
     * results is changed
     */
    pageSizeChange(pageSize) {
      this.perPage = pageSize;
    },
  },
  mounted() {
    this.search(this.searchQuery);
  },
  watch: {
    linkedApplications() {
      this.search(this.searchQuery);
    },
  },
  computed: {
    tabName() {
      return this.workforceEnabled ? this.$t('pages.access.linkedSystems') : this.$t('pages.access.applications');
    },
    totalRows() {
      return this.filteredApplications.length;
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.table tr:not(.b-table-empty-row) td) {
  cursor: pointer;
}
</style>
