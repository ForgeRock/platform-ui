<!-- Copyright 2023-2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="p-4 flex-grow-1 overflow-auto h-100">
    <BContainer
      fluid
      class="pt-4">
      <FrEventDetailsSummary
        v-if="eventBased"
        class="border-bottom mb-4"
        :summary="summary.eventDetails"
        :event-trigger-name="eventTriggerName" />
      <BRow class="border-bottom mb-4 pb-4">
        <BCol lg="3">
          <h1 class="h5">
            {{ eventBased ? $t('governance.editTemplate.certificationDetails') : $t('governance.editTemplate.details') }}
          </h1>
        </BCol>
        <BCol lg="4">
          <dl>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.name') }}</small>
            </dt>
            <dd>{{ summary.name }}</dd>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.type') }}</small>
            </dt>
            <dd>{{ type }}</dd>
          </dl>
        </BCol>
        <BCol lg="4">
          <dl>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.description') }}</small>
            </dt>
            <dd>{{ summary.description || blankValueIndicator }}</dd>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.owner') }}</small>
            </dt>
            <dd>
              {{ summary.ownerName }}
              <small class="text-muted text-truncate">
                {{ summary.ownerUsername }}
              </small>
            </dd>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.staging') }}</small>
            </dt>
            <dd>{{ stagingText }}</dd>
          </dl>
        </BCol>
      </BRow>
      <BRow class="border-bottom mb-4 pb-4">
        <BCol lg="3">
          <h5>{{ $t('governance.editTemplate.whatToCertify') }}</h5>
        </BCol>
        <BCol lg="4">
          <dl>
            <template v-if="summary.enableAccountGrant">
              <dt
                class="mb-1"
                data-testid="summary-account">
                <small>{{ $t('common.accounts') }}</small>
              </dt>
              <dd
                class="mb-4"
                data-testid="summary-account-count">
                {{ summary.numAccounts }}
              </dd>
            </template>
            <template v-if="summary.enableAccountGrant || summary.enableEntitlementGrant || summary.enableEntitlementCompositionGrant">
              <dt class="mb-1">
                <small>{{ $t('common.applications') }}</small>
              </dt>
              <dd class="mb-4">
                {{ summary.numApplications }}
              </dd>
            </template>
            <template v-if="summary.enableEntitlementGrant || summary.enableEntitlementCompositionGrant">
              <dt
                class="mb-1"
                data-testid="summary-entitlement">
                <small>{{ $t('common.entitlements') }}</small>
              </dt>
              <dd
                data-testid="summary-entitlement-count">
                {{ summary.numEntitlements }}
              </dd>
            </template>
            <template v-if="summary.enableRoleGrant">
              <dt
                class="mb-1"
                data-testid="summary-role">
                <small>{{ $t('common.roles') }}</small>
              </dt>
              <dd
                data-testid="summary-role-count">
                {{ summary.numRoles }}
              </dd>
            </template>
          </dl>
        </BCol>
        <BCol lg="4">
          <dl>
            <template v-if="!isEntitlementComposition">
              <dt class="mb-1">
                <small>{{ $t('common.users') }}</small>
              </dt>
              <dd class="mb-4">
                {{ summary.numUsers }}
              </dd>
            </template>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.totalDecisionItems') }}</small>
            </dt>
            <dd>
              {{ summary.numDecisions }}
            </dd>
          </dl>
        </BCol>
      </BRow>
      <BRow class="border-bottom mb-4 pb-4">
        <BCol lg="3">
          <h5>{{ $t('governance.editTemplate.whenToCertify') }}</h5>
        </BCol>
        <BCol lg="4">
          <dl>
            <template v-if="summary.when.enabled">
              <dt class="mb-1">
                <small>{{ $t('governance.editTemplate.when') }}</small>
              </dt>
              <dd class="mb-4">
                {{ when }}
              </dd>
              <dt class="mb-1">
                <small>{{ $t('common.start') }}</small>
              </dt>
              <dd class="mb-4">
                {{ start }}
              </dd>
            </template>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.onCampaignExpiration') }}</small>
            </dt>
            <dd>
              {{ onCampaignExpiration }}
            </dd>
          </dl>
        </BCol>
        <BCol lg="4">
          <dl>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.duration') }}</small>
            </dt>
            <dd class="mb-4">
              {{ duration }}
            </dd>
            <template v-if="summary.when.enabled">
              <dt class="mb-1">
                <small>{{ $t('common.end') }}</small>
              </dt>
              <dd>
                {{ end }}
              </dd>
            </template>
          </dl>
        </BCol>
      </BRow>
      <BRow class="border-bottom mb-4 pb-4">
        <BCol lg="3">
          <h5>{{ $t('governance.editTemplate.notifications') }}</h5>
        </BCol>
        <BCol lg="8">
          <dl>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.notificationsSummary.initialNotification') }}</small>
            </dt>
            <dd
              v-if="summary.notifications.assignmentNotification"
              data-testid="summary-notification-assignmentNotification"
              class="mb-4">
              <span
                v-html="$t('governance.editTemplate.notificationsSummary.sendInitialNotification')" />
            </dd>
            <dd v-else>
              {{ blankValueIndicator }}
            </dd>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.notificationsSummary.reassignNotification') }}</small>
            </dt>
            <dd
              v-if="summary.notifications.reassignNotification"
              data-testid="summary-notification-reassignNotification"
              class="mb-4">
              <span
                v-html="$t('governance.editTemplate.notificationsSummary.sendReassignNotification')" />
            </dd>
            <dd v-else>
              {{ blankValueIndicator }}
            </dd>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.notificationsSummary.expirationNotification') }}</small>
            </dt>
            <dd
              v-if="summary.notifications.expirationNotification"
              data-testid="summary-notification-expirationNotification"
              class="mb-4">
              <span
                v-html="$t('governance.editTemplate.notificationsSummary.sendExpirationNotification', {
                  numDay: summary.notifications.expirationDays
                })" />
            </dd>
            <dd v-else>
              {{ blankValueIndicator }}
            </dd>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.notificationsSummary.reminders') }}</small>
            </dt>
            <dd
              v-if="summary.notifications.reminders"
              data-testid="summary-notification-reminders"
              class="mb-4">
              <span
                v-html="$t('governance.editTemplate.notificationsSummary.sendReminders', {
                  duration: summary.notifications.remindersDuration,
                  timeSpan: summary.notifications.remindersTimespan,
                })" />
            </dd>
            <dd v-else>
              {{ blankValueIndicator }}
            </dd>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.notificationsSummary.escalation') }}</small>
            </dt>
            <dd
              v-if="summary.notifications.escalation"
              data-testid="summary-notification-escalation"
              class="mb-4">
              <span
                v-html="$t('governance.editTemplate.notificationsSummary.sendEscalation', {
                  duration: summary.notifications.escalationDuration,
                  timeSpan: summary.notifications.escalationTimespan,
                })" />
            </dd>
            <dd
              v-if="summary.notifications.escalation"
              data-testid="summary-notification-escalation-image">
              <div class="owner-info media align-items-center">
                <BImg
                  class="mr-3 rounded-circle size-28"
                  :alt="campaignOwnerName"
                  :src="summary.notifications.escalationOwnerInfo.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                />
                <div class="owner-name media-body">
                  <div class="mb-0">
                    {{ campaignOwnerName }}
                  </div>
                  <div>
                    <small class="text-secondary m-0">
                      {{ summary.notifications.escalationOwnerInfo.userName }}
                    </small>
                  </div>
                </div>
              </div>
            </dd>
            <dd v-else>
              {{ blankValueIndicator }}
            </dd>
          </dl>
        </BCol>
      </BRow>
      <BRow
        v-if="summary.additionalOptions"
        class="mb-4 pb-4">
        <BCol lg="3">
          <h5>{{ $t('governance.editTemplate.additionalOptions') }}</h5>
        </BCol>
        <BCol lg="4">
          <dl>
            <template v-if="!isEntitlementComposition">
              <dt class="mb-1">
                <small>{{ startCaseTranslationKey('governance.editTemplate.allowSelfCert') }}</small>
              </dt>
              <dd class="mb-4">
                {{ getYesOrNoLabel(summary.additionalOptions.allowSelfCert) }}
              </dd>
            </template>
            <dt class="mb-1">
              <small>{{ startCaseTranslationKey('governance.editTemplate.allowExceptions') }}</small>
            </dt>
            <dd class="mb-4">
              <span>{{ getExceptionLabel }}</span>
            </dd>
            <dt class="mb-1">
              <small>{{ startCaseTranslationKey('governance.editTemplate.allowPartialSignoff') }}</small>
            </dt>
            <dd class="mb-4">
              {{ getYesOrNoLabel(summary.additionalOptions.allowPartialSignoff) }}
            </dd>
          </dl>
        </BCol>
        <BCol lg="4">
          <dl>
            <dt class="mb-1">
              <small>{{ $t('governance.editTemplate.enableReassignment') }}</small>
            </dt>
            <dd
              v-if="thereIsReassignment && summary.additionalOptions.enableReassignmentDelegation.enableReassignmentDelegationFlag"
              class="mb-4">
              <BBadge
                v-if="summary.additionalOptions.enableReassignmentDelegation.enableForward"
                class="w-auto"
                variant="success">
                <FrIcon
                  icon-class="mr-2"
                  name="check">
                  {{ $t('governance.editTemplate.forward') }}
                </FrIcon>
              </BBadge>
              <BBadge
                v-if="summary.additionalOptions.enableReassignmentDelegation.enableReassign"
                class="w-auto"
                variant="success">
                <FrIcon
                  icon-class="mr-2"
                  name="check">
                  {{ $t('governance.editTemplate.reassign') }}
                </FrIcon>
              </BBadge>
            </dd>
            <dd v-else>
              {{ blankValueIndicator }}
            </dd>
            <dt class="mb-1">
              <small>{{ startCaseTranslationKey('governance.editTemplate.allowBulkCertify') }}</small>
            </dt>
            <dd class="mb-4">
              {{ getYesOrNoLabel(summary.additionalOptions.allowBulkCertify) }}
            </dd>
            <dt class="mb-1">
              <small>{{ startCaseTranslationKey('governance.editTemplate.processRemediationWorkFlow') }}</small>
            </dt>
            <dd
              v-if="thereIsRemediation"
              class="mb-4">
              {{ getYesOrNoLabel(summary.additionalOptions.processRemediationWorkFlow) }}
            </dd>
            <dd v-else>
              {{ blankValueIndicator }}
            </dd>
          </dl>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script>
import {
  BBadge,
  BCol,
  BContainer,
  BRow,
  BImg,
} from 'bootstrap-vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import DateMixin from '@forgerock/platform-shared/src/mixins/DateMixin';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import {
  startCase,
} from 'lodash';
import FrEventDetailsSummary from '@forgerock/platform-shared/src/views/Governance/Events/EventEdit/EventDetailsSummary';
import { types, uiTypeMap } from '../../templateTypes';

export default {
  name: 'SummaryStep',
  components: {
    BBadge,
    BCol,
    BContainer,
    BImg,
    BRow,
    FrEventDetailsSummary,
    FrIcon,
  },
  mixins: [DateMixin],
  props: {
    eventBased: {
      type: Boolean,
      default: false,
    },
    eventTriggerName: {
      type: String,
      default: '',
    },
    summary: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      blankValueIndicator,
      types,
      uiTypeMap,
    };
  },
  methods: {
    startCaseTranslationKey(translationKey) {
      return startCase(this.$t(translationKey));
    },
    getYesOrNoLabel(booleanParam) {
      return this.summary.additionalOptions ? startCase((booleanParam ? this.$t('common.yes') : this.$t('common.no'))) : blankValueIndicator;
    },
  },
  computed: {
    campaignOwnerName() {
      return this.$t('common.userFullName', {
        givenName: this.summary.notifications?.escalationOwnerInfo?.givenName,
        sn: this.summary.notifications?.escalationOwnerInfo?.sn,
      });
    },
    getExceptionLabel() {
      const { enabled, exceptionTimespan, exceptionDuration } = this.summary.additionalOptions.allowExceptions;
      return enabled ? this.$t('governance.timespans.allowExceptionFor', { exceptionDuration, exceptionTimespan }) : blankValueIndicator;
    },
    thereIsReassignment() {
      return !!(this.summary.additionalOptions && this.summary.additionalOptions.enableReassignmentDelegation.enableForward);
    },
    thereIsRemediation() {
      return !!(this.summary.additionalOptions && this.summary.additionalOptions.processRemediationWorkFlow);
    },
    type() {
      return this.$t(`governance.editTemplate.templateType.${this.uiTypeMap[this.summary.type]}`) || '';
    },
    stagingText() {
      return this.summary.staging
        ? this.$t('common.on')
        : this.$t('common.off');
    },
    when() {
      return `${this.$t('common.every')} ${this.summary.when.duration} ${this.summary.when.timespan}`;
    },
    start() {
      if (!this.summary.when.constraint) return '';
      const date = new Date(this.summary.when.constraint.split('/')[0]);
      return `${this.daysOfWeek[date.getDay()]}, ${this.monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    },
    end() {
      if (!this.summary.when.constraint) return '';
      const date = new Date(this.summary.when.constraint.split('/')[1]);
      return `${this.daysOfWeek[date.getDay()]}, ${this.monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    },
    duration() {
      return `${this.summary.duration.duration} ${this.summary.duration.timespan}`;
    },
    onCampaignExpiration() {
      const values = this.summary.onCampaignExpiration;
      if (values.expireOption === 0) {
        const baseText = this.$t('governance.editTemplate.onCampaignExpirationBase', { action: values.closeAction, actionTime: values.closeActionTime });
        return values.closeActionTime === this.$t('governance.timespans.immediately')
          ? baseText
          : `${baseText} ${this.$t('governance.editTemplate.onCampaignExpirationFinal', { closeActionDuration: values.closeActionDuration })}`;
      }
      if (values.expireOption === 1) return this.$t('governance.editTemplate.reassignTo', { givenName: values.reassignUser.givenName, sn: values.reassignUser.sn });
      if (values.expireOption === 2) return this.$t('governance.editTemplate.doNothing');
      return '';
    },
    isEntitlementComposition() {
      return this.summary.type === types.ENTITLEMENTCOMPOSITION;
    },
  },
};
</script>
