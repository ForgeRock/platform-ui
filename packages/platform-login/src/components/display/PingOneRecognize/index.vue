<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-recognize-container">
    <div
      aria-live="polite"
      aria-atomic="true"
      class="sr-only">
      {{ screenAnnouncement }}
    </div>

    <component
      v-if="sdkStarted"
      :is="isEnrolment ? 'kl-enroll' : 'kl-auth'"
      ref="klEl"
      :username="username"
      :aria-hidden="!sdkOwnsStep"
      :class="['fr-recognize-kl', { 'fr-recognize-kl--visible': sdkOwnsStep, 'fr-recognize-kl--done': sdkDone }]"
    />

    <Bootstrap
      ref="screenBootstrap"
      v-show="currentStep === 'bootstrap'" />
    <ServerComputation
      ref="screenServerComputation"
      v-show="currentStep === 'server-computation'"
      :is-enrolment="isEnrolment" />
    <Done
      ref="screenDone"
      v-show="currentStep === 'done'"
      :is-enrolment="isEnrolment"
      @continue="onDoneContinue" />
    <Error
      ref="screenError"
      v-show="currentStep === 'error'"
      :is-enrolment="isEnrolment"
      :error-message="errorMessage"
      :error-code="errorCode"
      @continue="onErrorContinue" />
    <CameraPermission
      ref="screenCameraPermission"
      v-show="currentStep === 'camera-permission'"
      :is-enrolment="isEnrolment"
      @allow="onAllowCamera"
      @deny="onDenyCamera" />
    <CameraPermissionDenied
      ref="screenCameraPermissionDenied"
      v-show="currentStep === 'camera-permission-denied'"
      @reload="onReload" />
    <CameraInstructions
      ref="screenCameraInstructions"
      v-show="currentStep === 'camera-instructions'"
      :is-enrolment="isEnrolment"
      @continue="onContinueFromInstructions" />
  </div>
</template>

<script setup>
import {
  ref, computed, watch, onBeforeUnmount, onMounted, nextTick,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useThemeStore } from '@forgerock/platform-shared/src/stores/theme';
import { decodeJwt } from '@/utils/loginUtils';
import { PIRecognize } from './PIRecognize';
import Bootstrap from './screens/Bootstrap';
import CameraInstructions from './screens/CameraInstructions';
import CameraPermissionDenied from './screens/CameraPermissionDenied';
import CameraPermission from './screens/CameraPermission';
import Done from './screens/Done';
import Error from './screens/Error';
import ServerComputation from './screens/ServerComputation';

const props = defineProps({
  callback: {
    type: Object,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  operationType: {
    type: String,
    required: true,
  },
  transactionData: {
    type: String,
    default: '',
  },
  username: {
    type: String,
    default: '',
  },
  webSDKOptions: {
    type: Object,
    default: () => ({}),
  },
  operationID: {
    type: String,
    default: '',
  },
  seedEntropy: {
    type: Boolean,
    default: false,
  },
  serviceURL: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['hide-next-button', 'next-step']);

const { t, te } = useI18n();

const currentStep = ref('bootstrap');
const doneTimer = ref(null);
const errorCode = ref('');
const errorMessage = ref('');
const permissionProbeStream = ref(null);
const permissionRequestPending = ref(false);
const permissionTimer = ref(null);
const resolveFlow = ref(null);
const startSdkFlow = ref(null);
const sdkStarted = ref(false);
const unmounted = ref(false);

const klEl = ref(null);
const screenBootstrap = ref(null);
const screenServerComputation = ref(null);
const screenDone = ref(null);
const screenError = ref(null);
const screenCameraPermission = ref(null);
const screenCameraPermissionDenied = ref(null);
const screenCameraInstructions = ref(null);

const isEnrolment = computed(() => props.operationType === 'ENROLL');
// The Keyless element takes over the UI for these steps; the themed screens are hidden.
const SDK_DRIVEN_STEPS = ['camera-stream-boot', 'camera-selection', 'camera-stream'];
const sdkOwnsStep = computed(() => SDK_DRIVEN_STEPS.includes(currentStep.value));
const sdkDone = computed(() => currentStep.value === 'done' || currentStep.value === 'error' || currentStep.value === 'server-computation');
const BOOTSTRAP_MINIMUM_DURATION = 1500;
// SDK_ERROR / 1000 are the SDK's own values for a failure that carries no error
// event, so AM routes it to clientError like every other SDK fault.
const SDK_ERROR = 'SDK_ERROR';
const SDK_ERROR_CODE = 1000;

const screenAnnouncement = computed(() => {
  const e = isEnrolment.value ? 'enroll' : 'auth';
  const map = {
    bootstrap: t('login.pingOneRecognize.serverComputation.body'),
    'camera-stream-boot': t('login.pingOneRecognize.serverComputation.body'),
    'camera-selection': t('login.pingOneRecognize.cameraActive'),
    'camera-stream': t('login.pingOneRecognize.cameraActive'),
    'server-computation': t(`login.pingOneRecognize.serverComputation.${e}Headline`),
    done: t(`login.pingOneRecognize.done.${e}Headline`),
    error: t(`login.pingOneRecognize.error.${e}Headline`),
    'camera-permission': t('login.pingOneRecognize.cameraPermission.headline'),
    'camera-permission-denied': t('login.pingOneRecognize.cameraPermissionDenied.headline'),
    'camera-instructions': t(`login.pingOneRecognize.cameraInstructions.${e}Headline`),
  };
  return map[currentStep.value] || '';
});

/**
 * Moves focus to the active screen's heading as steps change so screen
 * readers announce the transition; the live region covers non-focused steps.
 *
 * @param {string} step the new currentStep value.
 */
async function focusActiveScreen(step) {
  await nextTick();
  // SDK-driven steps are excluded on purpose: the Keyless overlay owns the UI
  // and focus during capture, and all themed screens are hidden.
  const refMap = {
    'server-computation': screenServerComputation,
    'camera-permission': screenCameraPermission,
    'camera-permission-denied': screenCameraPermissionDenied,
    'camera-instructions': screenCameraInstructions,
    done: screenDone,
    error: screenError,
  };
  const screenRef = refMap[step];
  if (!screenRef?.value) return;
  const target = screenRef.value.$el.querySelector('[tabindex="-1"]');
  if (target) target.focus();
}

function getEl() {
  return klEl.value.$el ?? klEl.value;
}

/**
 * Reports a generic SDK failure (SDK_ERROR / 1000) to AM when the event
 * carries no usable error detail.
 */
function reportSdkFailure() {
  props.callback.setInputValue(SDK_ERROR, /clientError$/);
  props.callback.setInputValue(SDK_ERROR_CODE, /clientErrorCode/);
}

/**
 * A RecognizeError carries { error: { message, code, cause } }; anything else
 * (a thrown Error) has no code to preserve, so report the generic SDK_ERROR / 1000.
 */
function handleSdkError(err) {
  const detail = err && err.error;
  if (detail && detail.message) {
    // message is the public enum key (e.g. 'SERVER_ERROR'); cause.message is the
    // SDK-internal code (e.g. 'SERVER_INVALID_REQUEST') which is more specific.
    const causeMessage = detail.cause?.message;
    errorCode.value = causeMessage || detail.message;
    const i18nKey = [causeMessage, detail.message].find((k) => k && te(`login.pingOneRecognize.errors.${k}`));
    errorMessage.value = i18nKey
      ? t(`login.pingOneRecognize.errors.${i18nKey}`)
      : t('login.pingOneRecognize.errors.default');
    // /clientError$/ avoids accidentally matching clientErrorCode.
    props.callback.setInputValue(detail.message, /clientError$/);
    props.callback.setInputValue(detail.code, /clientErrorCode/);
  } else {
    errorCode.value = '';
    errorMessage.value = t('login.pingOneRecognize.errors.default');
    reportSdkFailure();
  }
  currentStep.value = 'error';
}

function stopPermissionProbeStream() {
  const stream = permissionProbeStream.value;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    permissionProbeStream.value = null;
  }
}

function onAllowCamera() {
  if (!navigator.mediaDevices) {
    currentStep.value = 'camera-permission-denied';
    return;
  }
  if (permissionRequestPending.value) return;
  stopPermissionProbeStream();
  permissionRequestPending.value = true;
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      if (unmounted.value) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      permissionProbeStream.value = stream;
      currentStep.value = 'camera-instructions';
    })
    .catch(() => {
      if (!unmounted.value) currentStep.value = 'camera-permission-denied';
    })
    .finally(() => {
      permissionRequestPending.value = false;
    });
}

function onDenyCamera() {
  currentStep.value = 'camera-permission-denied';
}

function onContinueFromInstructions() {
  stopPermissionProbeStream();
  if (startSdkFlow.value) startSdkFlow.value();
}

function onDoneContinue() {
  clearTimeout(doneTimer.value);
  if (resolveFlow.value) resolveFlow.value();
}

function onErrorContinue() {
  if (resolveFlow.value) resolveFlow.value();
}

function onReload() {
  window.location.reload();
}

watch(currentStep, focusActiveScreen);

onBeforeUnmount(() => {
  // Don't call client.dispose() here: the SDK throws WEB_ASSEMBLY_NOT_READY via an
  // unhandled rejection when the kl element is removed before WASM finishes loading.
  unmounted.value = true;
  stopPermissionProbeStream();
  clearTimeout(doneTimer.value);
  clearTimeout(permissionTimer.value);
});

onMounted(async () => {
  emit('hide-next-button', true);

  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    currentStep.value = 'error';
    errorMessage.value = t('login.pingOneRecognize.errors.SDK_UNSUPPORTED_BROWSER');
    reportSdkFailure();
    resolveFlow.value = () => emit('next-step');
    return;
  }

  const { theme } = useThemeStore();
  let client;
  try {
    const wasmBase = PIRecognize.recognizeSdkBase();
    client = PIRecognize.createClient({
      customer: props.customerName,
      serviceURL: props.serviceURL,
      ...(props.transactionData ? { transactionData: props.transactionData } : {}),
      operationID: props.operationID || undefined,
      seedEntropy: props.seedEntropy,
      wasmScriptURL: `${wasmBase}wasm.js`,
      wasmBinaryURL: `${wasmBase}wasm.wasm`,
      wasmDataURL: `${wasmBase}wasm.data`,
      themeOptions: PIRecognize.buildThemeOptions(theme),
      // Admin-controlled pass-through; deliberately wins so an admin's
      // additionalWebSDKOptions can force settings like seedEntropy.
      ...props.webSDKOptions,
    });
  } catch (err) {
    currentStep.value = 'error';
    errorMessage.value = t('login.pingOneRecognize.errors.default');
    reportSdkFailure();
    resolveFlow.value = () => emit('next-step');
    return;
  }

  await new Promise((resolve) => {
    resolveFlow.value = resolve;

    client.subscribe({
      next: (event) => {
        if (event.type === 'step-change' && SDK_DRIVEN_STEPS.includes(event.detail.step)) {
          currentStep.value = event.detail.step;
        } else if (event.type === 'recognition-start') {
          currentStep.value = 'server-computation';
        }
      },
      error: handleSdkError,
      complete: (data) => {
        if (!data.jwt) {
          currentStep.value = 'error';
          errorMessage.value = t('login.pingOneRecognize.errors.default');
          reportSdkFailure();
          return;
        }
        let recognizeId;
        try {
          recognizeId = decodeJwt(data.jwt).sub || undefined;
        } catch (e) {
          // decodeJwt throws on malformed JWTs; the guard below must fire instead.
        }
        if (!recognizeId) {
          currentStep.value = 'error';
          errorMessage.value = t('login.pingOneRecognize.errors.default');
          reportSdkFailure();
          return;
        }
        props.callback.setInputValue(data.jwt, /signedJwt/);
        props.callback.setInputValue(recognizeId, /recognizeId/);
        currentStep.value = 'done';
        doneTimer.value = setTimeout(() => { if (resolveFlow.value) resolveFlow.value(); }, 3000);
      },
    });

    // getUserMedia must succeed before init() is called when camera-permission is in
    // disableSteps. kl-enroll is only mounted once sdkStarted=true to avoid
    // WEB_ASSEMBLY_NOT_READY from disconnectedCallback before WASM loads.
    startSdkFlow.value = async () => {
      if (sdkStarted.value) return;
      sdkStarted.value = true;
      await nextTick();
      if (unmounted.value) return;
      const el = getEl();
      currentStep.value = 'bootstrap';

      client.init({
        mode: 'attach',
        element: el,
        username: props.username,
      }).then((err) => {
        if (err) handleSdkError(err);
      }).catch(handleSdkError);
    };

    const bootstrapStartedAt = Date.now();
    const showPermissionStep = () => {
      const remaining = Math.max(0, BOOTSTRAP_MINIMUM_DURATION - (Date.now() - bootstrapStartedAt));
      permissionTimer.value = setTimeout(() => {
        if (unmounted.value) return;
        if (!navigator.permissions?.query) {
          currentStep.value = 'camera-permission';
          return;
        }
        navigator.permissions.query({ name: 'camera' })
          .then((perm) => {
            if (unmounted.value) return;
            if (perm.state !== 'granted') {
              currentStep.value = 'camera-permission';
              return;
            }
            PIRecognize.isCameraStreamAvailable().then((available) => {
              if (!unmounted.value) currentStep.value = available ? 'camera-instructions' : 'camera-permission';
            });
          })
          .catch(() => {
            if (!unmounted.value) currentStep.value = 'camera-permission';
          });
      }, remaining);
    };
    showPermissionStep();
  });

  try { Promise.resolve(client.dispose()).catch(() => {}); } catch (e) { /* sync throw */ }
  emit('next-step');
});
</script>
