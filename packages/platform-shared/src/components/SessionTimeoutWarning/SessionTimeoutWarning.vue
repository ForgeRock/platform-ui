<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    v-model="showIdleTimeout"
    data-testId="session-timeout-warning"
    :title="$t('sessionTimeoutWarning.title')"
    centered
    hide-header-close
    no-close-on-backdrop
    no-close-on-esc
    :cancel-title="$t('sessionTimeoutWarning.end')"
    cancel-variant="link"
    @cancel="logout"
    :ok-title="$t('sessionTimeoutWarning.extend')"
    @ok="stopImminentLogout"
    role="alertdialog">
    {{ $t('sessionTimeoutWarning.description') }}
  </BModal>
  <BModal
    v-model="showSessionExpired"
    data-testId="session-expiration-warning"
    :title="$t('sessionTimeoutWarning.titleMaxSession')"
    centered
    hide-header-close
    no-close-on-backdrop
    no-close-on-esc
    cancel-variant="link"
    @cancel="logout"
    :cancel-title="$t('sessionTimeoutWarning.end')"
    :ok-title="$t('sessionTimeoutWarning.dismiss')"
    role="alertdialog">
    {{ $t('sessionTimeoutWarning.descriptionMaxSession') }}
  </BModal>
</template>

<script setup>
/**
 *  This component maintains a set of timers that aim to log out a user just as they reach their maxIdleExpirationTime.
 */
import { BModal } from 'bootstrap-vue';
import dayjs from 'dayjs';
import { ref, onBeforeUnmount, onMounted } from 'vue';
import store from '@/store';

const showIdleTimeout = ref(false);
const showSessionExpired = ref(null);
const interval = ref(null);
const imminentTimeout = ref(null);
/**
  * Starts timeout to log out user and shows modal with options.
  */
function startImminentLogoutTimeout(timeout) {
  clearTimeout(imminentTimeout.value);
  clearInterval(interval.value);
  imminentTimeout.value = setTimeout(() => {
    window.logout();
  }, timeout);
}
/**
  * Starts timeout to trigger startImminentLogout if conditions are met.
  * Calling this method resets the modalTimeout with the last provided date as the end of the session
  *
  * @param {Date} maxIdleDate date for maxIdleExpirationTime as returned by AM getSessionInfo request
  * @param {Date} maxSessionDate date for maxSessionExpirationTime as returned by AM getSessionInfo request
  */
function checkSessionAndIdleExpiration(maxIdleDate, maxSessionDate) {
  if (maxIdleDate) {
    const now = dayjs();
    const idleDate = dayjs(maxIdleDate);
    const sessionExpirationDate = dayjs(maxSessionDate);
    const idleTimeLeft = idleDate.diff(now);
    const sessionTimeLeft = sessionExpirationDate.diff(now);
    // show the session expired modal if no modal is shown and session ends within 2.5 minutes. If this is true the next condition will be false.
    if (!showSessionExpired.value && !showIdleTimeout.value && sessionTimeLeft <= 150000) {
      showSessionExpired.value = true;
      startImminentLogoutTimeout(120000);
    }
    // show the idle timeout modal if no modal is shown and session times out within 1.5 minutes.
    if (!showSessionExpired.value && !showIdleTimeout.value && !sessionTimeLeft <= 210000 && idleTimeLeft <= 90000) {
      showIdleTimeout.value = true;
      startImminentLogoutTimeout(60000);
    }
  }
}

function logout() {
  window.logout();
}
/**
  * Stops the interval session and idle check
  */
function startIntervalCheck() {
  clearInterval(interval.value);
  interval.value = setInterval(() => checkSessionAndIdleExpiration(store.state.SharedStore.maxIdleExpirationTime, store.state.SharedStore.maxSessionExpirationTime), 20000);
}
/**
  * Stops timeout to logout user and starts interval again.
  */
function stopImminentLogout() {
  clearTimeout(imminentTimeout.value);
  startIntervalCheck();
}

onMounted(() => {
  startIntervalCheck();
});

onBeforeUnmount(() => {
  clearInterval(interval.value);
});
</script>
