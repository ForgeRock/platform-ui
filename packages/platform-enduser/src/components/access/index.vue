<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
<template>
  <BContainer>
    <div class="card mt-4">
      <div class="card-header py-2">
        <BRow>
          <BCol
            md="7"
            class="my-1">
            <BBtn
              v-if="createProperties.length > 0"
              type="button"
              variant="primary"
              v-b-modal.createResourceModal>
              <i class="material-icons-outlined font-weight-bolder pb-1">
                add
              </i>
              {{ $t("common.new") }} {{ this.name }}
            </BBtn>
          </BCol>
          <BCol
            md="5"
            class="my-1">
            <div class="d-flex">
              <BInputGroup>
                <BInputGroupPrepend>
                  <div class="input-group-text inset">
                    <i class="material-icons-outlined pt-1">
                      search
                    </i>
                  </div>
                </BInputGroupPrepend>
                <BFormInput
                  v-model="filter"
                  @keyup.native.enter="search"
                  :placeholder="this.$t('pages.access.typeSearch')"
                  class="inset-left inset-right" />
                <BInputGroupAppend>
                  <BBtn
                    variant="outline-default"
                    :disabled="!filter"
                    @click="clear"
                    class="inset clear">
                    <i class="material-icons-outlined rotate-45">
                      add_circle
                    </i>
                  </BBtn>
                </BInputGroupAppend>
              </BInputGroup>
            </div>
          </BCol>
        </BRow>
      </div>
      <BTable
        show-empty
        table-responsive
        stacked="lg"
        :items="gridData"
        :fields="columns"
        :per-page="0"
        :hover="tableHover"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :no-local-sorting="true"
        class="mb-0"
        :sort-direction="sortDirection"
        @row-clicked="resourceClicked"
        @sort-changed="sortingChanged" />
      <div class="card-footer py-2">
        <nav aria-label="Page navigation example">
          <ul class="pagination justify-content-center mb-0">
            <li
              @click.prevent="currentPage === 1 ? '' : paginationChange(1)"
              :class="[{ disabled: currentPage === 1 }, 'page-item']">
              <a
                class="page-link"
                href="#">
                <i class="material-icons-outlined font-weight-bolder">
                  first_page
                </i>
              </a>
            </li>
            <li
              @click.prevent="currentPage === 1 ? '' : paginationChange(currentPage - 1)"
              :class="[{ disabled: currentPage === 1 }, 'page-item']">
              <a
                class="page-link"
                href="#">
                <i class="material-icons-outlined font-weight-bolder">
                  keyboard_arrow_left
                </i>
              </a>
            </li>

            <li
              @click.prevent="lastPage ? '' : paginationChange(currentPage + 1)"
              :class="[{ disabled: lastPage }, 'page-item']">
              <a
                class="page-link"
                href="#">
                <i class="material-icons-outlined font-weight-bolder">
                  keyboard_arrow_right
                </i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <FrCreateResource
      v-if="createProperties.length > 0"
      @refreshGrid="clear"
      :resource-name="name"
      :resource-type="resource"
      :create-properties="createProperties" />
  </BContainer>
</template>

<script>
import {
  each,
  includes,
  isNaN,
  isNull,
  isUndefined,
  toNumber,
} from 'lodash';
import axios from 'axios';
import CreateResource from '@forgerock/platform-components/src/components/resource/CreateResource';
import RestMixin from '@forgerock/platform-components/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-components/src/mixins/NotificationMixin';

/**
 * @description Controlling component for delegated admin, allows for listing available resources and connects to the create, delete and edit features.
 *
 * @fires GET schema/type/name/ (e.g. schema/managed/user) - Schema for a resource (e.g. managed/user schema)
 * @fires GET privilege/type/name/ (e.g. privilege/managed/user/) - Privileges for a resource (e.g. managed/user)
 * @fires GET resource/name?_queryFilter=filter&_pageSize=10&_totalPagedResultsPolicy=EXACT (e.g. managed/user?_queryFilter=true&_pageSize=10&_totalPagedResultsPolicy=EXACT) -
 * List resource items, limited to 10 returned items and makes use of a query filter search if provided (defaults to queryFilter = true if none provided by the user).
 */
export default {
  name: 'Access',
  mixins: [
    RestMixin,
    NotificationMixin,
  ],
  components: {
    FrCreateResource: CreateResource,
  },
  data() {
    return {
      name: this.$route.params.resourceName,
      resource: this.$route.params.resourceType,
      schemaProperties: {},
      isRowSelected: false,
      tableHover: true,
      gridData: [],
      columns: [],
      displayFields: [],
      currentPage: 1,
      lastPage: false,
      sortBy: null,
      sortDesc: false,
      sortDirection: 'asc',
      filter: '',
      createProperties: [],
      userCanUpdate: false,
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      const idmInstance = this.getRequestService();

      axios.all([
        idmInstance.get(`schema/${this.resource}/${this.name}`),
        idmInstance.get(`privilege/${this.resource}/${this.name}`)]).then(axios.spread((schema, privilege) => {
        if (privilege.data.VIEW.allowed) {
          // Generate columns for display and filtering for read/query
          each(privilege.data.VIEW.properties, (readProp) => {
            const propSchema = schema.data.properties[readProp];

            if (
              this.columns.length <= 3
              && isUndefined(propSchema.encryption)
              && includes(['string', 'boolean', 'number'], propSchema.type)
            ) {
              this.columns.push({
                key: readProp,
                label: propSchema.title,
                sortable: true,
                sortDirection: 'desc',
              });

              this.displayFields.push(readProp);
            }
          });
        }

        if (privilege.data.UPDATE) {
          this.userCanUpdate = true;
        }

        this.schemaProperties = schema.data.properties;

        if (privilege.data.CREATE.allowed) {
          // Generate create list for create resource dialog
          each(privilege.data.CREATE.properties, (createProp) => {
            if (schema.data.properties[createProp].type === 'string' || schema.data.properties[createProp].type === 'number' || schema.data.properties[createProp].type === 'boolean') {
              // eslint-disable-next-line no-param-reassign
              schema.data.properties[createProp].key = createProp;

              each(schema.data.required, (requiredKey) => {
                if (requiredKey === schema.data.properties[createProp].key) {
                  // eslint-disable-next-line no-param-reassign
                  schema.data.properties[createProp].required = true;
                }
              });

              this.createProperties.push(schema.data.properties[createProp]);
            }
          });
        }

        this.loadGrid('true', this.displayFields, this.displayFields[0], 1);
      }))
        .catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },
    loadGrid(filter, fields, sortField, page) {
      const idmInstance = this.getRequestService();

      idmInstance.get(this.buildGridUrl(filter, fields, sortField, page)).then((resourceData) => {
        // this.totalRows = resourceData.data.totalPagedResults;
        if (resourceData.data.pagedResultsCookie) {
          this.lastPage = false;
        } else {
          this.lastPage = true;
        }

        this.gridData = resourceData.data.result;
      });
    },
    /* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
    buildGridUrl(filter, fields, sortField, page) {
      let resourceUrl = `${this.resource}/${this.name}?_queryFilter=${filter}&_pageSize=10&_totalPagedResultsPolicy=EXACT`;

      if (isNull(sortField)) {
        // If there is no sortField default to sorting on the first column.
        // eslint-disable-next-line no-param-reassign
        sortField = fields[0];
      }

      resourceUrl = `${resourceUrl}&_sortKeys=${sortField}`;

      if (fields.length) {
        resourceUrl = `${resourceUrl}&_fields=${fields.join(',')}`;
      }

      if (page > 1) {
        // Pagination starts at 1 and we need to go back an additional one to get the previous page
        const offsetCalc = (page - 1) * 10;

        resourceUrl = `${resourceUrl}&_pagedResultsOffset=${offsetCalc}`;
      }

      return resourceUrl;
    },
    calculateSort(sortDesc, sortBy) {
      let sortUrl = null;

      if (!isNull(sortBy)) {
        if (sortDesc) {
          sortUrl = `${sortBy}`;
        } else {
          sortUrl = `-${sortBy}`;
        }
      }

      return sortUrl;
    },
    sortingChanged(sort) {
      this.currentPage = 1;
      this.lastPage = false;

      this.loadGrid(this.generateSearch(this.filter, this.displayFields, this.schemaProperties), this.displayFields, this.calculateSort(sort.sortDesc, sort.sortBy), 1);
    },
    paginationChange(page) {
      this.currentPage = page;
      this.loadGrid(this.generateSearch(this.filter, this.displayFields, this.schemaProperties), this.displayFields, this.calculateSort(this.sortDesc, this.sortBy), page);
    },
    search() {
      this.sortBy = null;
      this.sortDesc = false;
      this.currentPage = 1;
      this.lastPage = false;

      this.loadGrid(this.generateSearch(this.filter, this.displayFields, this.schemaProperties), this.displayFields, null, 1);
    },
    generateSearch(filter, displayFields, schemaProps) {
      let filterUrl = '';

      if (filter.length > 0) {
        const encodedFilter = encodeURIComponent(filter);
        each(displayFields, (field, index) => {
          let type = 'string';

          if (!isUndefined(schemaProps)) {
            // eslint-disable-next-line prefer-destructuring
            type = schemaProps[field].type;
          }

          if (type === 'number' && !isNaN(toNumber(encodedFilter))) {
            // Search based on number and proper number value
            if ((index + 1) < displayFields.length) {
              filterUrl += `${field}+eq+ ${encodedFilter}+OR+`;
            } else {
              filterUrl += `${field}+eq+ ${encodedFilter}`;
            }
          } else if (type === 'boolean' && (encodedFilter === 'true' || encodedFilter === 'false')) {
            // Search based on boolean and proper boolean true/false
            if ((index + 1) < displayFields.length) {
              filterUrl += `${field}+eq+ ${encodedFilter}+OR+`;
            } else {
              filterUrl += `${field}+eq+ ${encodedFilter}`;
            }
          } else if ((index + 1) < displayFields.length) {
            // Fallback to general string search if all other criteria fails
            filterUrl += `${field}+sw+"${encodedFilter}"+OR+`;
          } else {
            filterUrl += `${field}+sw+"${encodedFilter}"`;
          }
        });
      } else {
        filterUrl = 'true';
      }

      return filterUrl;
    },
    clear() {
      this.filter = '';
      this.sortBy = null;
      this.sortDesc = false;
      this.currentPage = 1;

      this.loadGrid('true', this.displayFields, null, 1);
    },
    resourceClicked(item) {
      if (this.userCanUpdate) {
        this.$router.push({
          name: 'EditResource',
          params: {
            resourceType: this.resource,
            resourceName: this.name,
            // eslint-disable-next-line no-underscore-dangle
            resourceId: item._id,
          },
        });
      } else {
        this.displayNotification('IDMMessages', 'error', this.$t('pages.access.unableToEditResource', { resource: this.name }));
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.input-group {
  & > .input-group-prepend {
    .input-group-text.inset,
    .btn.inset {
      border-right-color: transparent;
    }
  }

  & > .input-group-append {
    .input-group-text.inset,
    .btn.inset {
      border-left-color: transparent;
    }
  }

  & > .form-control {
    &.inset-left:not(:first-child) {
      border-left-color: transparent;
    }

    &.inset-right:not(:first-child) {
      border-right-color: transparent;
    }
  }

  .btn.clear {
    opacity: 1;
    color: $gray-500;
    background-color: $input-bg;

    &.disabled > i {
      color: transparent;
      border-width: 0;
    }
  }
}
</style>
