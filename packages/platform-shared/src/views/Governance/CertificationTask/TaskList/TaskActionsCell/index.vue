<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <template v-if="item.permissions.certify">
      <!-- Certify -->
      <BButton
        :aria-label="$t(certifyButtonLabel)"
        :data-testid="`btnCertify-${item.id}`"
        :disabled="isStaged"
        :id="`btnCertify-${item.id}`"
        :pressed="pressedButton(item, 'certify')"
        @click="$emit('action', 'certify', item)"
        class="mr-1 p-0"
        style="height: 30px; width: 35px;"
        variant="outline-success">
        <FrIcon name="check" />
      </BButton>
      <BTooltip
        :data-testid="`tooltip-certify-${item.id}`"
        :target="`btnCertify-${item.id}`"
        triggers="hover"
        placement="top">
        {{ $t(certifyButtonLabel) }}
      </BTooltip>
    </template>

    <!-- Revoke -->
    <template v-if="item.permissions.revoke && !item.isAcknowledge">
      <BButton
        :aria-label="$t('common.revoke')"
        :data-testid="`btnRevoke-${item.id}`"
        :disabled="isStaged"
        :id="`btnRevoke-${item.id}`"
        :pressed="pressedButton(item, 'revoke')"
        @click="$emit('action', 'revoke', item)"
        class="mr-1 p-0"
        style="height: 30px; width: 35px;"
        variant="outline-danger">
        <FrIcon name="block" />
      </BButton>
      <BTooltip
        :target="`btnRevoke-${item.id}`"
        triggers="hover"
        placement="top">
        {{ $t('common.revoke') }}
      </BTooltip>
    </template>

    <!-- Allow exception -->
    <template v-if="campaignDetails.exceptionDuration > 0 && item.permissions.exception && !item.isAcknowledge">
      <BButton
        :aria-label="$t('governance.certificationTask.actions.allowException')"
        :data-testid="`btnAllowException-${item.id}`"
        :disabled="isStaged"
        :id="`btnAllowException-${item.id}`"
        :pressed="pressedButton(item, 'exception')"
        @click="$emit('action', 'exception', item)"
        class="mr-1 p-0"
        style="height: 30px; width: 35px;"
        variant="outline-secondary">
        <FrIcon name="schedule" />
      </BButton>
      <BTooltip
        :target="`btnAllowException-${item.id}`"
        triggers="hover"
        placement="top">
        {{ $t('governance.certificationTask.actions.allowException') }}
      </BTooltip>
    </template>

    <BDropdown
      no-caret
      boundary="window"
      toggle-class="p-1 d-inline"
      variant="link">
      <template #button-content>
        <!-- Visually hidden label for screen readers -->
        <span class="sr-only">
          {{ $t('common.moreActions') }}
        </span>
        <FrIcon
          icon-class="text-dark md-24"
          name="more_horiz" />
      </template>

      <!-- Forward -->
      <BDropdownItem
        v-if="campaignDetails.enableForward && item.permissions.forward"
        @click="$emit('action', 'forward', item)"
        :data-testid="`forward-button-${item.id}`"
        :disabled="isStaged">
        <FrIcon
          icon-class="mr-2"
          name="redo">
          {{ $t('governance.certificationTask.actions.forward') }}
        </FrIcon>
      </BDropdownItem>

      <!-- View Reviewers -->
      <BDropdownItem
        @click="$emit('action', 'viewReviewers', item)"
        :disabled="isStaged"
        :data-testid="`cert-reviewers-button-${certGrantType}`">
        <FrIcon
          icon-class="mr-2"
          name="group">
          {{ $t('governance.certificationTask.actions.viewReviewers') }}
        </FrIcon>
      </BDropdownItem>

      <!-- Comment -->
      <BDropdownItem
        v-if="item.permissions.comment"
        @click="$emit('action', 'comment', item)"
        :data-testid="`add-comment-button-${item.id}`"
        :disabled="isStaged">
        <FrIcon
          icon-class="mr-2"
          name="mode_comment">
          {{ $t('governance.certificationTask.actions.addComment') }}
        </FrIcon>
      </BDropdownItem>

      <!-- View Activity -->
      <BDropdownItem @click="$emit('action', 'activity', item)">
        <FrIcon
          icon-class="mr-2"
          name="article">
          {{ $t('governance.certificationTask.actions.viewActivity') }}
        </FrIcon>
      </BDropdownItem>
    </BDropdown>
  </div>
</template>
<script>
import {
  BButton,
  BDropdown,
  BDropdownItem,
  BTooltip,
} from 'bootstrap-vue';
import { get } from 'lodash';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

export default {
  name: 'TaskActionsCell',
  components: {
    BButton,
    BDropdown,
    BDropdownItem,
    BTooltip,
    FrIcon,
  },
  props: {
    campaignDetails: {
      type: Object,
      default: () => ({}),
    },
    certGrantType: {
      type: String,
      default: '',
    },
    item: {
      type: Object,
      default: () => ({}),
    },
    isStaged: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    /**
     * Determines whether the button is to be displayed pressed depending on the decision applied in the item
     * @param {Object} item object with item decision information
     * @param {ItemDecisionString} status string to be compared to determine if the button is pressed
     */
    pressedButton(item, status) {
      const decision = get(item, 'decision.certification.decision', '');
      return decision === status;
    },
  },
  computed: {
    /**
     * Returns the label for the certify button based on the acknowledge status
     */
    certifyButtonLabel() {
      return this.item.isAcknowledge
        ? 'governance.certificationTask.actions.acknowledge'
        : 'governance.certificationTask.actions.certify';
    },
  },
};
</script>
