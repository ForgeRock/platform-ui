<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="h-100 d-flex w-100">
    <div class="w-100 bg-white">
      <FrNavbar>
        <template #center-content>
          <h1 class="h4">
            {{ $t("pageTitles.ViolationRemediate") }}
          </h1>
        </template>
        <template #right-content>
          <BButton
            id="expandCart"
            variant="none"
            class="ml-auto d-lg-none"
            aria-controls="expandableCart"
            :aria-expanded="cartExpanded"
            :aria-label="$t('governance.accessRequest.newRequest.expandRequestCart')"
            @click="toggleCartPanel">
            <FrIcon
              icon-class="md-24"
              name="shopping_cart" />
          </BButton>
        </template>
      </FrNavbar>
      <div
        id="contentWrapper"
        class="w-100"
        :class="{ 'cart-open cart-open-lg': cartExpanded }">
        <!-- Loading spinner -->
        <div
          v-if="isLoading"
          class="h-100 w-100 d-flex justify-content-center align-items-center">
          <div>
            <FrSpinner class="mb-4" />
            <div>{{ $t('governance.violations.remediate.revoking') }}</div>
          </div>
        </div>
        <!-- Main content -->
        <div
          v-else
          class="overflow-auto h-100">
          <BContainer class="my-5">
            <div class="mb-4">
              <BRow>
                <!-- User information -->
                <BCol
                  class="mb-5 mb-lg-4"
                  lg="4">
                  <div class="mb-1">
                    <small>{{ $t("common.user.user") }}</small>
                  </div>
                  <h2 class="h5">
                    {{ $t('common.userFullName', { givenName: violation?.user.givenName, sn: violation?.user.sn }) }}
                  </h2>
                  <BMedia no-body>
                    <BMediaAside>
                      <BImg
                        alt=""
                        class="rounded-circle size-28"
                        :aria-hidden="true"
                        :src="violation?.user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                    </BMediaAside>
                    <BMediaBody class="text-truncate">
                      <p class="h5 m-0 text-truncate">
                        {{ $t('common.userFullName', { givenName: violation?.user.givenName, sn: violation?.user.sn }) }}
                      </p>
                      <small class="mb-0">
                        {{ violation?.user.userName }}
                      </small>
                    </BMediaBody>
                  </BMedia>
                </BCol>
                <!-- Violation information -->
                <BCol
                  class="mb-5 mb-lg-4"
                  lg="4">
                  <div class="mb-1">
                    <small>{{ $t("governance.violations.ruleViolated") }}</small>
                  </div>
                  <h2 class="h5">
                    {{ violation?.policyRule.name }}
                  </h2>
                  <p class="max-lines max-lines-3">
                    {{ violation?.policyRule.description }}
                  </p>
                  <BButton
                    variant="link"
                    class="p-0"
                    @click="() => {}">
                    {{ $t('common.viewDetails') }}
                  </BButton>
                </BCol>
                <!-- Remediation information -->
                <BCol
                  class="mb-5 mb-lg-4"
                  lg="4">
                  <div class="mb-1">
                    <small>{{ $t("governance.violations.remediate.howToFix") }}</small>
                  </div>
                  <p class="max-lines max-lines-3">
                    {{ violation?.policyRule.correctionAdvice || blankValueIndicator }}
                  </p>
                </BCol>
              </BRow>
            </div>

            <!-- Error message -->
            <FrAlert
              v-if="isError"
              class="mb-5"
              variant="danger"
              :dismissible="false">
              {{ $t('governance.violations.remediate.errorRemediating') }}
            </FrAlert>

            <!-- Entitlements catalog -->
            <BRow>
              <BCol lg="6">
                <EntitlementsSearchableList
                  :added="selectedEntitlements === entitlements"
                  :entitlements="entitlements"
                  :title="$t('common.entitlements')"
                  @add-all="addAllEntitlementsToCart" />
              </BCol>
              <BCol lg="6">
                <EntitlementsSearchableList
                  :added="selectedEntitlements === conflictEntitlements"
                  :entitlements="conflictEntitlements"
                  :title="$t('governance.violations.conflictingEntitlements')"
                  @add-all="addAllEntitlementsToCart" />
              </BCol>
            </BRow>
          </BContainer>
        </div>
        <div class="w-100 h-100 fixed-top fr-sidebar-shim d-lg-none" />
        <transition name="slide-fade">
          <!-- Cart panel -->
          <div
            v-if="cartExpanded"
            class="fr-cart-panel position-fixed shadow-lg h-100">
            <div class="h-100 overflow-auto fr-cart-content">
              <div class="p-4">
                <div class="d-flex align-items-center justify-content-between mb-4">
                  <h2 class="h5 mb-0">
                    {{ $t("governance.violations.remediate.cartTitle") }}
                  </h2>
                  <BButtonClose
                    class="ml-auto d-lg-none"
                    variant="link"
                    @click="toggleCartPanel">
                    <FrIcon
                      name="close"
                      icon-class="text-light text-muted md-24"
                    />
                  </BButtonClose>
                </div>

                <!-- Entitlements cart -->
                <EntitlementsCart :entitlements="selectedEntitlements" />

                <!-- Cart fields -->
                <BFormGroup>
                  <FrField
                    name="justification"
                    v-model="justification"
                    type="textarea"
                    :label="$t('governance.accessRequest.newRequest.justification')"
                    :description="$t('governance.accessRequest.newRequest.justificationDescription')"
                    :max-rows="10"
                    :rows="5" />
                </BFormGroup>
              </div>

              <!-- Bottom section -->
              <div class="position-fixed px-4 py-4 bg-white fr-save-button">
                <BButton
                  class="w-100"
                  variant="primary"
                  :disabled="!selectedEntitlements.length"
                  @click="sendRemediate">
                  {{ $t('governance.violations.remediate.revokeEntitlements') }}
                </BButton>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { get } from 'lodash';
import {
  BButton, BButtonClose, BContainer, BRow, BCol, BMedia, BImg, BMediaBody, BMediaAside, BFormGroup,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNavbar from '@forgerock/platform-shared/src/components/Navbar';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrAlert from '@forgerock/platform-shared/src/components/Alert';
import { ref } from 'vue';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { useRouter } from 'vue-router';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import { getViolation, remediate } from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import EntitlementsCart from '@/components/governance/EntitlementsCart/EntitlementsCart';
import EntitlementsSearchableList from '@/components/governance/EntitlementsCart/EntitlementsSearchableList';
import i18n from '@/i18n';
import store from '@/store';

/**
 * View that allows the user to remediate a violation by revoking entitlements
 */

const { setBreadcrumb } = useBreadcrumb();
const router = useRouter();

const cartExpanded = ref(true);
const { violationId } = router.currentRoute.value.params;
const violation = ref(null);
const entitlements = ref([]);
const conflictEntitlements = ref([]);
const selectedEntitlements = ref([]);
const justification = ref('');
const isLoading = ref(false);
const isError = ref(false);

// calculates the breadcrumb path and title depending on the route name,
// violation list page redirects to ViolationRemediate route and violation edit page redirects to ViolartionEditRemediate route,
// both routes load this component
const breadcrumbPath = router.currentRoute.value.name === 'ViolationRemediate' ? '/violations' : `/violations/violation/${violationId}`;
const breadcrumbTitle = router.currentRoute.value.name === 'ViolationRemediate' ? i18n.global.t('pageTitles.Violations') : i18n.global.t('common.violation');
setBreadcrumb(breadcrumbPath, breadcrumbTitle);

function toggleCartPanel() {
  cartExpanded.value = !cartExpanded.value;
}

async function getViolationData() {
  try {
    const { data } = await getViolation(violationId);
    return data;
  } catch (error) {
    showErrorMessage(
      error,
      i18n.global.t('governance.violations.errorGettingViolation'),
    );
  }
  return null;
}

/**
 * Get objects used to display the entitlements based on ids
 * @param {String[]} compositeIds ids of entitlements
 */
function getEntitlementDisplayObjects(compositeIds) {
  return compositeIds.map((id) => {
    const item = violation.value.violatingAccess.find((violationItem) => (violationItem.compositeId === id));
    return {
      name: get(item, 'descriptor.idx./entitlement.displayName') || get(item, 'entitlement.displayName') || '',
      description: get(item, 'glossary.idx./entitlement.description') || get(item, 'entitlement.description') || '',
      appName: item.application.name,
      app: item.application,
      compositeId: item.compositeId,
    };
  });
}

function addAllEntitlementsToCart(entitlementsList) {
  selectedEntitlements.value = entitlementsList;
  displayNotification('success', i18n.global.t('governance.violations.remediate.entitlementsAdded'));
}

/**
 * Send the remediation request
 */
async function sendRemediate() {
  cartExpanded.value = false;
  isLoading.value = true;
  try {
    await remediate(violationId, violation.value.decision.phases[0].name, {
      remediationOptionId: 'grantRemoval',
      grantIds: [
        ...selectedEntitlements.value.map((entitlement) => entitlement.compositeId),
      ],
      justification: justification.value,
    });
    store.commit('setViolationsCount', store.state.violationsCount - 1);
    displayNotification('success', i18n.global.t('governance.violations.remediate.successRemediation'));
    router.push({ name: 'Violations' }); // if violation successfully revoked, redirect to violations list in all cases
  } catch (error) {
    isError.value = true;
  } finally {
    cartExpanded.value = true;
    isLoading.value = false;
  }
}

getViolationData().then((data) => {
  violation.value = data;
  const conflicts = violation.value?.decision?.compositeIds;
  if (conflicts?.length) {
    entitlements.value = getEntitlementDisplayObjects(conflicts[0]);
    conflictEntitlements.value = getEntitlementDisplayObjects(conflicts[1]);
  }
});
</script>

<style lang="scss" scoped>
#contentWrapper {
  padding-right: 0;
  height: calc(100vh - 72px);
  &.cart-open {
    .fr-sidebar-shim {
      display: block;
      z-index: 2;
    }

    .fr-cart-panel {
      margin-right: 0;
      z-index: 3;
    }
  }

  @media (min-width: 992px) {
    &.cart-open-lg {
      padding-right: 320px;
      .fr-cart-panel {
        margin-right: 0;
        z-index: 3;
      }
    }
  }

  .fr-sidebar-shim {
    display: none;
    background-color: $black;
    opacity: 0.2;
  }

  .fr-cart-panel {
    right: 0;
    width: 320px;
    background-color: $white;
    top: 0;
    margin-top: 72px;
    margin-right: -320px;

    &.slide-fade-enter-active {
      transition: all 0.3s ease;
    }
    &.slide-fade-leave-active {
      transition: all 0.2s ease;
    }
    &.slide-fade-enter,
    .slide-fade-leave-to {
      transform: translateX(10px);
      opacity: 0;
    }
  }

  .fr-cart-content {
    padding-bottom: 209px;
  }

  .fr-save-button {
    bottom: 0;
    width: 320px;
  }
}
</style>
