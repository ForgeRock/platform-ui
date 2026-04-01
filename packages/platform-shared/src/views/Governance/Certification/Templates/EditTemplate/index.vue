<!-- Copyright 2023-2026 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrFormWizard
    v-if="showWizard"
    @save="saveTemplate"
    :is-saving="isSaving"
    :title="title"
    :breadcrumb-path="breadcrumbPath"
    :breadcrumb-title="breadcrumbTitle"
    data-testid="template-wizard"
    :edit="!!existingTemplateId"
    :tabs="tabComponents"
    :valid-form="isValid"
    progress-dots>
    <template
      v-for="tab in tabComponents"
      :key="tab.title"
      #[tab.title]>
      <Component
        :value="forms[tab.component]"
        :is="tab.component"
        :auto-id-enabled="autoIdEnabled"
        :email-template-options="emailTemplateOptions"
        :event-based="eventBased"
        :event-trigger-name="eventTriggerName"
        :filter-properties="eventFilterProperties"
        :grant-filter-properties="grantFilterProperties"
        :summary="summary"
        :type="type"
        @set-counts="setCounts"
        @toggle-valid="isValid = $event"
        @input="forms[tab.component] = $event" />
    </template>
  </FrFormWizard>
</template>

<script>
import {
  capitalize,
  cloneDeep,
  isEmpty,
  startCase,
} from 'lodash';
import { getFilterSchema, getIgaAutoIdConfig } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import useCertification from '@forgerock/platform-shared/src/composables/certification';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrFormWizard from '@forgerock/platform-shared/src/components/FormWizard/FormWizard';
import FrEventDetails from '@forgerock/platform-shared/src/views/Governance/Events/EventEdit/EventDetails';
import { postTemplate, updateTemplate } from '@forgerock/platform-shared/src/api/governance/TemplateApi';
import { buildSavePayload, getFormValuesFromTemplate } from '@forgerock/platform-shared/src/views/Governance/utils/certification';
import { getEmailTemplates } from '@forgerock/platform-shared/src/api/EmailApi';
import FrAdditionalOptions from './AdditionalOptions';
import FrDetailsForm from './DetailsForm';
import FrNotifications from './Notifications';
import FrSummaryStep from './SummaryStep';
import FrCustomization from './Customization/Customization';
import FrWhat from './What';
import FrWhen from './When';
import FrWho from './Who';
import { types } from '../templateTypes';

export default {
  name: 'EditTemplate',
  components: {
    FrFormWizard,
    FrAdditionalOptions,
    FrCustomization,
    FrDetailsForm,
    FrEventDetails,
    FrNotifications,
    FrSummaryStep,
    FrWhat,
    FrWhen,
    FrWho,
  },
  mixins: [NotificationMixin],
  props: {
    type: {
      type: String,
      default: types.IDENTITY,
    },
    eventBased: {
      type: Boolean,
      default: false,
    },
    eventCert: {
      type: Object,
      default: () => ({}),
    },
    eventTriggerName: {
      type: String,
      default: '',
    },
    eventFilterProperties: {
      type: Array,
      default: () => [],
    },
    /* For an event based cert, isSavingEvent prop helps to update save button's local state. */
    isSavingEvent: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { template } = useCertification();
    return { template };
  },
  data() {
    const tabComponents = [
      {
        component: 'FrDetailsForm',
        title: this.$t('governance.editTemplate.details'),
      },
      {
        component: 'FrWhat',
        title: this.$t('governance.editTemplate.whatToCertify'),
      },
      {
        component: 'FrWhen',
        title: this.$t('governance.editTemplate.whenToCertify'),
      },
      {
        component: 'FrWho',
        title: this.$t('governance.editTemplate.whoWillCertify'),
      },
      {
        component: 'FrNotifications',
        title: this.$t('governance.editTemplate.notifications'),
      },
      {
        component: 'FrAdditionalOptions',
        title: this.$t('governance.editTemplate.additionalOptions'),
      },
      {
        component: 'FrCustomization',
        title: this.$t('governance.editTemplate.customization'),
      },
      {
        component: 'FrSummaryStep',
        title: this.$t('governance.editTemplate.summary'),
      },
    ];

    // add extra tab and change some tab titles for event based certs
    if (this.eventBased) {
      tabComponents.unshift({
        component: 'FrEventDetails',
        title: this.$t('governance.events.edit.eventDetails'),
      });

      const whatIndex = tabComponents.findIndex((tab) => tab.component === 'FrDetailsForm');
      tabComponents[whatIndex].title = this.$t('governance.editTemplate.certificationDetails');

      const whenIndex = tabComponents.findIndex((tab) => tab.component === 'FrWhen');
      tabComponents[whenIndex].title = this.$t('governance.editTemplate.duration');
    }

    return {
      autoIdEnabled: false,
      emailTemplateOptions: [],
      emailTemplatesLoaded: false,
      existingTemplateId: null,
      grantFilterProperties: {},
      grantFilterPropertiesLoaded: false,
      isSaving: false,
      isValid: true,
      numAccounts: 0,
      numApplications: 0,
      numEntitlements: 0,
      numRoles: 0,
      numUsers: 0,
      numDecisions: 0,
      types,
      tabComponents,
      forms: {
        // only used for event based certs
        FrEventDetails: {
          eventDescription: '',
          eventName: '',
          eventOwners: [],
          filter: {},
        },
        FrDetailsForm: {
          description: '',
          name: '',
          owner: '',
          ownerInfo: {},
          stagingEnabled: false,
        },
        FrWhat: {
          accountFilter: {},
          accountSelection: this.$t('governance.editTemplate.allAccounts'),
          appFilter: {},
          appSelection: this.$t('governance.editTemplate.allApplications'),
          decisionFilter: {},
          enableCertDecisionFilter: false,
          enableAccountGrant: true,
          enableEntitlementGrant: false,
          enableEntitlementCompositionGrant: false,
          enableRoleGrant: false,
          entitlementFilter: {},
          entitlementSelection: this.$t('governance.editTemplate.allEntitlements'),
          excludeConditionalAccess: true,
          excludeRoleBasedAccess: true,
          numAccounts: 0,
          numApplications: 0,
          numEntitlements: 0,
          numRoles: 0,
          numUsers: 0,
          roleFilter: {},
          roleSelection: this.$t('governance.editTemplate.allRoles'),
          singleApp: [],
          singleUser: '',
          singleUserInfo: {},
          userFilter: {},
          userSelection: this.$t('governance.editTemplate.allUsers'),
        },
        FrWhen: {
          closeAction: 'revoke',
          closeActionDuration: 10,
          closeActionTime: this.$t('governance.timespans.immediately'),
          duration: 2,
          enableSchedule: false,
          expireOption: 2,
          reassignUser: '',
          reassignUserInfo: {},
          reassignToSelector: this.$t('governance.editTemplate.role'),
          scheduleConstraint: '',
          scheduleDuration: 30,
          scheduleTimespan: this.$t('governance.timespans.days'),
          timespan: this.$t('governance.timespans.weeks'),
        },
        FrWho: {
          certRole: '',
          certType: 'user',
          certUser: '',
          certUserInfo: {},
          defaultCertifier: '',
          defaultCertifierInfo: {},
          enableDefaultCertifier: false,
          certifierPath: '',
        },
        FrNotifications: {
          escalation: false,
          escalationDuration: 1,
          escalationEmail: '',
          escalationOwner: '',
          escalationOwnerInfo: {},
          escalationTimespan: this.$t('governance.timespans.days'),
          expirationDays: 1,
          expirationEmail: '',
          expirationNotification: false,
          initialNotification: true,
          initialEmail: 'emailTemplate/certificationAssigned',
          reassignEmail: 'emailTemplate/certificationReassigned',
          reassignNotification: true,
          reminders: false,
          remindersDuration: 1,
          remindersEmail: '',
          remindersTimespan: this.$t('governance.timespans.days'),
        },
        FrAdditionalOptions: {
          allowBulkCertify: true,
          allowExceptions: true,
          requireJustification: {
            revoke: true,
            exceptionAllowed: true,
          },
          allowPartialSignoff: false,
          allowSelfCert: false,
          allowSelfCertification: false,
          enableForward: true,
          enableReassign: true,
          reassignPermissions: {
            comment: true,
            makeDecision: true,
            reassign: true,
            signoff: true,
          },
          enableReassignmentDelegation: true,
          exceptionDuration: 2,
          exceptionTimespan: this.$t('governance.timespans.weeks'),
          processRemediation: false,
          remediationDuration: 10,
          remediationTime: this.$t('governance.timespans.immediately'),
          remediationTimespan: this.$t('governance.timespans.days'),
          selfCertFilter: this.$t('governance.editTemplate.allCertifiers'),
          type: this.type,
        },
        FrCustomization: {
          columnConfig: {},
        },
        FrSummaryStep: {},
      },
    };
  },
  computed: {
    breadcrumbPath() {
      return this.eventBased ? '/governance-events' : '/certification/templates';
    },
    breadcrumbTitle() {
      return this.eventBased ? this.$t('pageTitles.GovernanceEvents') : this.$t('governance.certification.title');
    },
    ownerInfo() {
      if (isEmpty(this.forms.FrDetailsForm.ownerInfo)) {
        return {
          ownerName: '',
          ownerUsername: '',
        };
      }
      const { givenName, sn, userName } = this.forms.FrDetailsForm.ownerInfo;
      return {
        ownerName: this.$t('common.userFullName', { givenName, sn }),
        ownerUsername: userName,
      };
    },
    showWizard() {
      return this.emailTemplatesLoaded && this.grantFilterPropertiesLoaded;
    },
    summary() {
      return {
        additionalOptions: {
          allowSelfCert: this.forms.FrAdditionalOptions.allowSelfCert,
          enableReassignmentDelegation: {
            enableReassignmentDelegationFlag: this.forms.FrAdditionalOptions.enableReassignmentDelegation,
            enableForward: this.forms.FrAdditionalOptions.enableForward,
            enableReassign: this.forms.FrAdditionalOptions.enableReassign,
          },
          requireJustification: {
            revoke: this.forms.FrAdditionalOptions.requireJustification.revoke,
            exceptionAllowed: this.forms.FrAdditionalOptions.requireJustification.exceptionAllowed,
          },
          allowExceptions: {
            enabled: this.forms.FrAdditionalOptions.allowExceptions,
            exceptionDuration: this.forms.FrAdditionalOptions.exceptionDuration,
            exceptionTimespan: this.forms.FrAdditionalOptions.exceptionTimespan,
          },
          allowBulkCertify: this.forms.FrAdditionalOptions.allowBulkCertify,
          allowPartialSignoff: this.forms.FrAdditionalOptions.allowPartialSignoff,
          processRemediationWorkFlow: this.forms.FrAdditionalOptions.processRemediation,
        },
        description: this.forms.FrDetailsForm.description,
        name: this.forms.FrDetailsForm.name,
        owner: this.forms.FrDetailsForm.owner,
        ownerName: this.ownerInfo.ownerName,
        ownerUsername: this.ownerInfo.ownerUsername,
        staging: this.forms.FrDetailsForm.stagingEnabled,
        type: this.type,
        duration: {
          duration: this.forms.FrWhen.duration,
          timespan: this.forms.FrWhen.timespan,
        },
        onCampaignExpiration: {
          closeAction: this.forms.FrWhen.closeAction,
          closeActionDuration: this.forms.FrWhen.closeActionDuration,
          closeActionTime: this.forms.FrWhen.closeActionTime,
          expireOption: this.forms.FrWhen.expireOption,
          reassignUser: this.forms.FrWhen.reassignUser,
          reassignRole: this.forms.FrWhen.reassignRole,
          reassignToSelector: this.$t('governance.editTemplate.role'),
        },
        when: {
          enabled: this.forms.FrWhen.enableSchedule && !!this.forms.FrWhen.scheduleConstraint,
          constraint: this.forms.FrWhen.scheduleConstraint,
          duration: this.forms.FrWhen.scheduleDuration,
          timespan: this.forms.FrWhen.scheduleTimespan,
        },
        numAccounts: this.numAccounts,
        numApplications: this.numApplications,
        numEntitlements: this.numEntitlements,
        numRoles: this.numRoles,
        numUsers: this.numUsers,
        numDecisions: this.numDecisions,
        enableAccountGrant: this.forms.FrWhat.enableAccountGrant,
        enableEntitlementGrant: this.forms.FrWhat.enableEntitlementGrant,
        enableEntitlementCompositionGrant: this.forms.FrWhat.enableEntitlementCompositionGrant,
        enableRoleGrant: this.forms.FrWhat.enableRoleGrant,
        notifications: {
          assignmentNotification: this.forms.FrNotifications.initialNotification,
          escalation: this.forms.FrNotifications.escalation,
          escalationDuration: this.forms.FrNotifications.escalationDuration,
          escalationTimespan: this.forms.FrNotifications.escalationTimespan,
          expirationDays: this.forms.FrNotifications.expirationDays,
          expirationNotification: this.forms.FrNotifications.expirationNotification,
          reassignNotification: this.forms.FrNotifications.reassignNotification,
          reminders: this.forms.FrNotifications.reminders,
          remindersDuration: this.forms.FrNotifications.remindersDuration,
          remindersTimespan: this.forms.FrNotifications.remindersTimespan,
          escalationOwnerInfo: {
            sn: this.forms.FrNotifications.escalationOwnerInfo?.sn,
            givenName: this.forms.FrNotifications.escalationOwnerInfo?.givenName,
            profileImage: this.forms.FrNotifications.escalationOwnerInfo?.profileImage,
            userName: this.forms.FrNotifications.escalationOwnerInfo?.userName,
          },
        },
        eventDetails: {
          description: this.forms.FrEventDetails?.eventDescription,
          eventName: this.forms.FrEventDetails?.eventName,
          eventOwners: this.forms.FrEventDetails?.eventOwners,
        },
      };
    },
    title() {
      if (!this.eventBased) return this.$t('governance.editTemplate.title', { type: this.$t(`governance.editTemplate.types.${this.type}`) });
      return isEmpty(this.eventCert)
        ? this.$t('governance.editTemplate.certificationNew')
        : this.$t('governance.editTemplate.certificationEdit');
    },
  },
  mounted() {
    getFilterSchema(this.type)
      .then(({ data }) => {
        this.grantFilterProperties = data;
      })
      .catch((err) => {
        this.showErrorMessage(err, this.$t('governance.certification.getFilterSchemaError'));
      }).finally(() => {
        this.grantFilterPropertiesLoaded = true;
      });

    if (!isEmpty(this.template) && !this.eventBased) {
      try {
        this.forms = cloneDeep(getFormValuesFromTemplate(this.template));
        this.existingTemplateId = this.template.id;
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.certification.getTemplateFieldValuesError'));
      }
    }

    // get email template list
    getEmailTemplates()
      .then(({ data }) => {
        this.emailTemplateOptions = data?.result.map((x) => ({
          text: x.displayName || startCase(x._id.split('/')[1]),
          value: x._id,
        })).sort((a, b) => a.text.trim().toLowerCase().localeCompare(b.text.trim().toLowerCase()));
      })
      .catch((err) => {
        this.showErrorMessage(err, this.$t('email.templates.errorRetrievingList'));
      }).finally(() => {
        this.emailTemplatesLoaded = true;
      });

    // User recommendations and predictions
    getIgaAutoIdConfig()
      .then(({ data }) => {
        this.autoIdEnabled = data?.enableAutoId || false;
      })
      .catch((err) => {
        this.showErrorMessage(err, this.$t('governance.certificationTask.errors.autoIdError'));
      });
  },
  methods: {
    capitalize,
    async saveTemplate() {
      if (this.eventBased) {
        this.$emit('save-event', { forms: this.forms, id: this.existingTemplateId });
      } else {
        const saveObj = buildSavePayload(this.type, this.forms);
        const saveFunction = this.existingTemplateId !== null
          ? updateTemplate(this.existingTemplateId, saveObj)
          : postTemplate(saveObj);

        try {
          this.isSaving = true;
          await saveFunction;
          this.displayNotification('success', this.$t('governance.templates.notifications.savingSuccess'));
          this.$router.push({
            name: 'Certification',
            params: { certificationTab: 'templates' },
          });
        } catch (err) {
          this.showErrorMessage(err, this.$t('governance.templates.errors.errorSavingTemplate'));
        } finally {
          this.isSaving = false;
        }
      }
    },
    setCounts(event) {
      const { objects } = event;
      this.numDecisions = event.count || 0;

      this.numUsers = objects.user || 0;
      this.numApplications = objects.application || 0;
      this.numAccounts = objects.account || 0;
      this.numEntitlements = objects.entitlement || 0;
      this.numRoles = objects.role || 0;
    },
  },
  watch: {
    eventCert: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (!isEmpty(newVal)) {
          try {
            const { eventDetails, certDetails } = newVal;
            const forms = getFormValuesFromTemplate(certDetails, true);
            this.forms = { ...forms, ...eventDetails };
            this.existingTemplateId = certDetails.id;
          } catch (error) {
            this.showErrorMessage(error, this.$t('governance.certification.getTemplateFieldValuesError'));
          }
        }
      },
    },
    /**
     * For an event based certification, watch the isSavingEvent prop to update save button's local state.
     * @param {boolean} newState - The new state of isSavingEvent prop.
    */
    isSavingEvent(newState) {
      if (this.eventBased) this.isSaving = newState;
    },
  },
};
</script>
