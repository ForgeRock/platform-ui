<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BTab
    v-if="linkedApplications.length"
    :title="$t('pages.access.applications')">
    <template>
      <div>
        <BCardHeader class="p-0">
          <div class="justify-content-between p-3 border-bottom-0">
            <FrSearchInput
              v-model="searchQuery"
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
            v-slot:cell(name)="data">
            <BMedia no-body>
              <BImg
                class="mt-1 mr-4"
                width="28"
                height="28"
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

        <BPagination
          v-if="filteredApplications.length > 10"
          class="pt-3 justify-content-center pagination-material-buttons border-top"
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          aria-controls="linked-apps-table" />
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
  BPagination,
} from 'bootstrap-vue';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import LinkedApplicationModal from '@forgerock/platform-shared/src/components/resource/EditResource/CustomTabs/LinkedApplicationsTab/LinkedApplicationModal';

export default {
  name: 'LinkedApplicationsTab',
  components: {
    BImg,
    BMedia,
    BCardHeader,
    BTab,
    BPagination,
    BTable,
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
    search() {
      // reset pagination to page 1 on search
      this.currentPage = 1;
      if (this.searchQuery === '') {
        this.filteredApplications = [...this.linkedApplications];
      } else {
        this.filteredApplications = this.linkedApplications.filter((item) => item.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
      }
    },
  },
  mounted() {
    this.search();
  },
  watch: {
    linkedApplications() {
      this.search();
    },
  },
  computed: {
    totalRows() {
      return this.filteredApplications.length;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .table tr:not(.b-table-empty-row) td {
  cursor: pointer;
}
</style>
