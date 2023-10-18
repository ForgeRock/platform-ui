<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    v-model="show"
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
</template>

<script setup>
/**
 *  This component maintains a set of timers that aim to log out a user just as they reach their maxIdleExpirationTime.
 */
import { BModal } from 'bootstrap-vue';
import dayjs from 'dayjs';
import { ref, watch, onMounted } from 'vue';
import store from '@/store';

const show = ref(false);
const modalTimeout = ref(null);
const imminentTimeout = ref(null);
/**
  * Starts timeout to log out user and shows modal with options.
  */
function startImminentLogout() {
  imminentTimeout.value = setTimeout(() => {
    window.logout();
  }, 60000);
  show.value = true;
}
/**
  * Stops timeout to logout user and hides modal.
  */
function stopImminentLogout() {
  clearTimeout(imminentTimeout.value);
  show.value = false;
}
/**
  * Starts timeout to trigger startImminentLogout.
  * Calling this method resets the modalTimeout with the last provided date as the end of the session
  *
  * @param {Date} expirationTime date as returned by AM getSessionInfo request
  */
function resetModalTimeout(expirationTime) {
  if (expirationTime) {
    clearTimeout(modalTimeout.value);
    const now = dayjs();
    const expirationDate = dayjs(expirationTime);
    const timeLeft = expirationDate.diff(now);
    modalTimeout.value = setTimeout(() => {
      startImminentLogout();
    }, timeLeft - 70000);
  }
}
function logout() {
  window.logout();
}

watch(() => store.getters['SharedStore/maxIdleExpirationTime'], async (expirationTime) => {
  resetModalTimeout(expirationTime);
});

onMounted(() => {
  resetModalTimeout(store.state.SharedStore.maxIdleExpirationTime);
});
</script>
