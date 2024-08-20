<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
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
      size="lg"
      :no-close-on-esc="true"
      :title="editProperty.title"
      @hidden="disableSave = false">
      <div>
        <FrField
          :value="showForm"
          class="mb-4"
          type="boolean"
          :disabled="editProperty.disabled"
          :label="editProperty.description"
          @input="toggleForm" />
        <template v-if="showForm">
          <template v-if="editProperty.isConditional">
            <FrQueryFilterBuilder
              @change="queryFilterChange"
              :disabled="properties.condition.disabled"
              :query-filter-string="editProperty.value"
              :resource-name="conditionResource"
              :properties="conditionOptions" />
          </template>
          <div v-else>
            <FrTimeConstraint
              v-model="editProperty.value"
              :disabled="properties.temporalConstraints.disabled" />
          </div>
        </template>
      </div>

      <template #modal-footer="{ cancel }">
        <BButton
          variant="link"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          variant="primary"
          @click="saveSetting"
          :disabled="saveDisabled">
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
import QueryFilterBuilder from '@forgerock/platform-shared/src/components/filterBuilder/QueryFilterBuilder';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';

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
    revision: {
      type: String,
      default: '',
    },
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
      conditionResource: 'user',
    };
  },
  computed: {
    saveDisabled() {
      if (this.disableSave
        || (!this.editProperty.isConditional && this.properties.temporalConstraints.disabled)
        || (this.editProperty.isConditional && this.properties.condition.disabled)) {
        return true;
      }
      return false;
    },
  },
  methods: {
    toggleForm(showForm) {
      this.showForm = showForm;
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
      // If there is a null value or an empty string or array set editPropert.value to ''
      if (this.editProperty.value === null || this.editProperty.value.length === 0) {
        this.editProperty.value = '';
      }

      this.showForm = this.editProperty.value !== '';

      this.$refs.settingsModal.show();
    },
    hideModal() {
      this.$refs.settingsModal.hide();
    },
    saveSetting() {
      const idmInstance = this.getRequestService({
        headers: {
          'if-match': this.revision,
        },
      });
      const propValue = (this.editProperty.isTemporalConstraint) ? [{ duration: this.editProperty.value }] : this.editProperty.value;

      let patch = [{ operation: 'add', field: `/${this.editProperty.propName}`, value: propValue }];

      if (this.editProperty.value === '' || this.editProperty.value === null) {
        patch = [{ operation: 'remove', field: `/${this.editProperty.propName}` }];
      }

      idmInstance.patch(this.resourcePath, patch).then(() => {
        this.displayNotification('success', this.$t('pages.access.successEdited', { resource: capitalize(this.resourceName) }));
        this.hideModal();
        this.$emit('refresh-data');
      },
      (error) => {
        /**
         * Special case to handle AIC proxy timeouts that respond to the request before IDM finishes processing data.
         * For this 502 Bad Gateway or 504 Gateway Timeout we will issue the user a warning that their request is still be processed by IDM
         * and will eventually complete - being visible in the UI.
         */
        if (error.response.status === 502 || error.response.status === 504) {
          this.displayNotification('warning', this.$t('pages.access.gatewayWarning'), 10000);
          this.hideModal();
        } else {
          this.showErrorMessage('error', this.$t('pages.access.invalidEdit'));
        }
      });
    },
    setConditionOptions() {
      // TODO: replace hard coded "managed/user" with "conditionObject" schema property value
      let conditionObject = 'managed/user';
      this.conditionOptions = [];

      if (this.$store.state.isFraas) {
        conditionObject = `managed/${this.$store.state.realm}_user`;
        this.conditionResource = `${this.$store.state.realm}_user`;
      }

      getSchema(conditionObject).then((schema) => {
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
        this.showErrorMessage('error', this.$t('pages.access.invalidEdit'));
      });
    },
  },
};
</script>
