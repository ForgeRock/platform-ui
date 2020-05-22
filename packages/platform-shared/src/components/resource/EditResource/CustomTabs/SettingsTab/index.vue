<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BTab :title="$t('common.settings')">
    <table class="table">
      <tbody>
        <tr
          v-for="(property) in properties"
          :key="property.propName"
          class="border-bottom">
          <td class="border-top-0 font-weight-bold">
            {{ property.title }}
          </td>
          <td class="border-top-0 text-muted">
            {{ property.description }}
          </td>
          <td class="border-top-0 text-right">
            <BButton
              type="button"
              variant="outline-primary"
              @click="showModal(property)">
              {{ $t('pages.access.setUp') }}
            </BButton>
          </td>
        </tr>
      </tbody>
    </table>
    <BModal
      id="settingsModal"
      ref="settingsModal"
      :title="editProperty.title"
      @hidden="disableSave = false"
      size="lg">
      <div>
        <div class="mb-4">
          <FrField
            :field="checkboxField"
            @input="toggleForm" />
        </div>
        <template v-if="showForm">
          <div v-if="editProperty.isConditional">
            <FrQueryFilterBuilder
              @change="queryFilterChange"
              @error="queryFilterError"
              :query-filter-string="editProperty.value"
              :resource="resourceName"
              :properties="conditionOptions" />
          </div>
          <div v-else>
            <FrTimeConstraint v-model="editProperty.value" />
          </div>
        </template>
      </div>

      <template v-slot:modal-footer="{ cancel }">
        <BButton
          variant="link"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          variant="primary"
          @click="saveSetting"
          :disabled="disableSave">
          {{ $t('common.save') }}
        </BButton>
      </template>
    </BModal>
  </BTab>
</template>

<script>
import {
  capitalize,
} from 'lodash';
import {
  BButton,
  BModal,
  BTab,
} from 'bootstrap-vue';
import TimeConstraint from '@forgerock/platform-shared/src/components/TimeConstraint';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import QueryFilterBuilder from '@forgerock/platform-shared/src/components/QueryFilterBuilder';
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'SettingsTab',
  mixins: [
    NotificationMixin,
    RestMixin,
  ],
  components: {
    BButton,
    BModal,
    BTab,
    FrField,
    FrTimeConstraint: TimeConstraint,
    FrQueryFilterBuilder: QueryFilterBuilder,
  },
  props: {
    properties: {
      type: Object,
      default: () => {},
    },
    resourcePath: {
      type: String,
      default: '',
    },
    resourceName: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      editProperty: {},
      conditionOptions: [],
      disableSave: false,
      showForm: false,
    };
  },
  computed: {
    checkboxField() {
      return {
        type: 'boolean',
        title: this.editProperty.description,
        value: this.showForm,
      };
    },
  },
  methods: {
    toggleForm() {
      this.showForm = !this.showForm;
      // If the toggle is off set the property value to null
      if (!this.showForm) {
        this.editProperty.value = '';
        this.disableSave = false;
      }
    },
    queryFilterChange(queryFilterString) {
      this.editProperty.value = queryFilterString;
      this.disableSave = false;
    },
    queryFilterError() {
      this.disableSave = true;
    },
    showModal(property) {
      this.editProperty = property;
      if (property.isConditional) {
        this.setConditionOptions();
      }

      this.showForm = this.editProperty.value !== '';

      this.$refs.settingsModal.show();
    },
    hideModal() {
      this.$refs.settingsModal.hide();
    },
    saveSetting() {
      const idmInstance = this.getRequestService();
      const propValue = (this.editProperty.isTemporalConstraint) ? [{ duration: this.editProperty.value }] : this.editProperty.value;

      let patch = [{ operation: 'add', field: `/${this.editProperty.propName}`, value: propValue }];

      if (this.editProperty.value === '' || this.editProperty.value === null) {
        patch = [{ operation: 'remove', field: `/${this.editProperty.propName}` }];
      }

      idmInstance.patch(this.resourcePath, patch).then(() => {
        this.displayNotification('IDMMessages', 'success', this.$t('pages.access.successEdited', { resource: capitalize(this.resourceName) }));
        this.hideModal();
      },
      () => {
        this.displayNotification('IDMMessages', 'error', this.$t('pages.access.invalidEdit'));
      });
    },
    setConditionOptions() {
      this.conditionOptions = [];
      const idmInstance = this.getRequestService();

      // TODO: replace hard coded "managed/user" with "conditionObject" schema property value
      idmInstance.get('schema/managed/user').then((schema) => {
        const filteredProperties = [];

        schema.data.order.forEach((key) => {
          const property = schema.data.properties[key];
          if (key !== '_id' && property.type !== 'array' && property.type !== 'relationship' && property.viewable) {
            property.propName = key;
            filteredProperties.push(property);
          }
        });

        filteredProperties.forEach((property) => {
          if (property.type === 'object') {
            property.order.forEach((subProp) => {
              this.conditionOptions.push({
                label: `${property.title}/${subProp}`,
                value: `${property.propName}/${subProp}`,
                type: property.properties[subProp].type,
              });
            });
          } else {
            this.conditionOptions.push({
              label: property.title,
              value: property.propName,
              type: property.type,
            });
          }
        });
      },
      () => {
        this.displayNotification('IDMMessages', 'error', this.$t('pages.access.invalidEdit'));
      });
    },
  },
};
</script>
