<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="min-vh-100 d-flex flex-column fr-fullscreen-mobile">
    <template
      v-if="journeyHeaderEnabled && journeyHeader && (journeyLayout === 'card' || !journeyTheaterMode)"
      id="appHeader">
      <header v-html="sanitizedHeader" />
    </template>
    <main
      v-if="!journeyLayout || journeyLayout === 'card' || !journeyTheaterMode"
      class="px-0 flex-grow-1 d-flex container">
      <BContainer
        class="flex-grow-1 d-flex"
      >
        <BRow
          :class="[{'flex-row-reverse': journeyLayout === 'justified-right'}, 'align-items-center m-0 flex-grow-1']">
          <BCol :lg="journeyLayout !== 'card' ? 6 : 12">
            <section>
              <FrCenterCard
                :logo-alt-text="logoAltText || 'Logo'"
                :logo-enabled="logoEnabled && !themeLoading"
                :logo-height="logoHeight"
                :logo-path="logoPath">
                <template #center-card-header>
                  <div v-if="!loading && !themeLoading">
                    <h1
                      v-if="header"
                      class="h2"
                      tabindex="1">
                      {{ header }}
                    </h1>
                    <p
                      v-if="description"
                      v-html="description" />
                  </div>
                </template>

                <template #center-card-body>
                  <BCardBody
                    v-show="!loading && !themeLoading"
                    id="callbacksPanel">
                    <FrAlert
                      :show="loginFailure"
                      :dismissible="false"
                      variant="error"
                      class="p-3 text-left">
                      {{ getTranslation(errorMessage) }}
                    </FrAlert>
                    <div
                      v-if="loginFailure && linkToTreeStart">
                      <a :href="linkToTreeStart">
                        {{ $t('login.sessionTimeoutLink') }}
                      </a>
                    </div>
                    <div id="body-append-el">
                      <!-- for backend scripts -->
                      <form
                        @submit.prevent="nextStep"
                        id="wrapper">
                        <!-- needed for GetAuthenticationApp, RecoveryCodeDisplay-->
                        <template v-if="showScriptElms">
                          <div>
                            <fieldset />
                          </div>
                          <div id="callback_0" />
                        </template>
                        <template
                          v-for="(component) in componentList ">
                          <Component
                            class="callback-component"
                            :callback="component.callback"
                            :index="component.index"
                            :is="component.type"
                            :key="component.key"
                            :step="step"
                            v-bind="{...component.callbackSpecificProps}"
                            v-on="{
                              'next-step': (event, preventClear) => {
                                nextStep(event, preventClear);
                              },
                              ...component.listeners}" />
                        </template>
                        <BButton
                          v-if="nextButtonVisible"
                          class="btn-block mt-3"
                          type="submit"
                          variant="primary"
                          :disabled="nextButtonDisabled"
                          @click="nextStep">
                          {{ buttonTextLocalized }}
                        </BButton>
                        <input
                          v-if="showScriptElms"
                          id="loginButton_0"
                          role="button"
                          type="submit"
                          @click.prevent="backendScriptsHandler"
                          hidden>
                      </form>
                    </div>
                  </BCardBody>
                  <BCardBody v-show="loading || themeLoading">
                    <div
                      class="h-100 d-flex"
                      role="alert"
                      aria-busy="true"
                      aria-label="Loading">
                      <div class="fr-center-card">
                        <Spinner class="mb-4" />
                      </div>
                    </div>
                  </BCardBody>
                </template>
              </FrCenterCard>
            </section>
          </BCol>
          <BCol
            v-if="journeyLayout !== 'card' && journeyJustifiedContentEnabled"
            class="d-none d-lg-block p-0"
            lg="6">
            <section
              v-html="sanitizedContent"
              class="d-flex justify-content-center" />
          </BCol>
        </BRow>
      </BContainer>
    </main>
    <main
      v-else
      id="callbacksPanel"
      :class="[{'flex-row-reverse': journeyLayout === 'justified-right'}, 'd-flex w-100 flex-grow-1']">
      <div class="journey-card w-md-50 w-100 d-flex align-items-start flex-column">
        <div
          class="pb-4 px-4 px-md-5 w-100"
          data-testid="in-situ-logo-preview">
          <div class="d-flex">
            <img
              v-if="logoEnabled"
              class="fr-logo mt-4"
              :alt="logoAltText"
              :style="{ height: `${logoHeight}px` }"
              :src="logoPath">
            <div
              v-if="journeyHeaderEnabled"
              class="flex-grow-1"
              id="appHeader">
              <header v-html="sanitizedHeader" />
            </div>
          </div>
        </div>
        <div class="px-4 px-md-5 d-flex align-items-center w-100 flex-grow-1">
          <div class="w-100 max-width-600">
            <BRow class="m-0">
              <BCol xl="9">
                <div v-if="!loading">
                  <h1
                    v-if="header"
                    class="display-4 mb-5 h2">
                    {{ header }}
                  </h1>
                  <p
                    v-if="description"
                    v-html="description" />
                </div>
                <FrAlert
                  :show="loginFailure"
                  :dismissible="false"
                  variant="error"
                  class="p-3 text-left">
                  {{ getTranslation(errorMessage) }}
                </FrAlert>
                <div
                  v-if="loginFailure && linkToTreeStart">
                  <a :href="linkToTreeStart">
                    {{ $t('login.sessionTimeoutLink') }}
                  </a>
                </div>
                <div id="body-append-el">
                  <!-- for backend scripts -->
                  <form
                    @submit.prevent="nextStep"
                    id="wrapper">
                    <!-- needed for GetAuthenticationApp, RecoveryCodeDisplay-->
                    <template v-if="showScriptElms">
                      <div>
                        <fieldset />
                      </div>
                      <div id="callback_0" />
                    </template>
                    <template
                      v-for="(component) in componentList ">
                      <Component
                        class="callback-component"
                        :callback="component.callback"
                        :index="component.index"
                        :is="component.type"
                        :key="component.key"
                        :step="step"
                        v-bind="{...component.callbackSpecificProps}"
                        v-on="{
                          'next-step': (event, preventClear) => {
                            nextStep(event, preventClear);
                          },
                          ...component.listeners}"
                      />
                    </template>
                    <BButton
                      v-if="nextButtonVisible"
                      class="btn-block mt-3"
                      type="submit"
                      variant="primary"
                      :disabled="nextButtonDisabled"
                      @click="nextStep">
                      {{ buttonTextLocalized }}
                    </BButton>
                    <input
                      v-if="showScriptElms"
                      id="loginButton_0"
                      role="button"
                      type="submit"
                      @click.prevent="backendScriptsHandler"
                      hidden>
                  </form>
                </div>
              </BCol>
            </BRow>
          </div>
        </div>
        <div
          v-if="journeyFooterEnabled && journeyFooter"
          class="w-100"
          id="appFooter">
          <footer v-html="sanitizedFooter" />
        </div>
      </div>
      <div class="overflow-hidden w-md-50 d-none d-md-flex">
        <div
          v-if="journeyJustifiedContentEnabled"
          v-html="journeyJustifiedContent"
          class="d-flex h-100 w-100 justify-content-center align-self-center" />
      </div>
    </main>
    <template
      v-if="journeyFooterEnabled && journeyFooter && (journeyLayout === 'card' || !journeyTheaterMode)"
      id="appFooter">
      <footer v-html="sanitizedFooter" />
    </template>
  </div>
</template>

<script>
import {
  each,
  find,
  has,
  isString,
  noop,
} from 'lodash';
import {
  BButton,
  BCardBody,
  BCol,
  BContainer,
  BRow,
} from 'bootstrap-vue';
import {
  CallbackType,
  FRAuth,
  FRRecoveryCodes,
  FRStep,
  FRWebAuthn,
  SessionManager,
  WebAuthnStepType,
} from '@forgerock/javascript-sdk';
import FrCenterCard from '@forgerock/platform-shared/src/components/CenterCard';
import Spinner from '@forgerock/platform-shared/src/components/Spinner';
import FrAlert from '@forgerock/platform-shared/src/components/Alert';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import { getThemeIdFromStageString } from '@forgerock/platform-shared/src/utils/stage';
import i18n from '@/i18n';

const FrCallbackType = {
  ...CallbackType,
  RecoveryCodesComponent: 'RecoveryCodesComponent',
  RedirectCallback: 'RedirectCallback',
  SelectIdPCallback: 'SelectIdPCallback',
  SuspendedTextOutputCallback: 'SuspendedTextOutputCallback',
  WebAuthnComponent: 'WebAuthnComponent',
};

export default {
  name: 'Login',
  components: {
    BButton,
    BCardBody,
    BCol,
    BContainer,
    BRow,
    FrAlert,
    FrCenterCard,
    Spinner,
    FrBooleanAttributeInputCallback: () => import('@/components/callbacks/BooleanAttributeInputCallback'),
    FrChoiceCallback: () => import('@/components/callbacks/ChoiceCallback'),
    FrConfirmationCallback: () => import('@/components/callbacks/ConfirmationCallback'),
    FrConsentMappingCallback: () => import('@/components/callbacks/ConsentMappingCallback'),
    FrDeviceProfileCallback: () => import('@/components/callbacks/DeviceProfileCallback'),
    FrField: () => import('@forgerock/platform-shared/src/components/Field'),
    FrHiddenValueCallback: () => import('@/components/callbacks/HiddenValueCallback'),
    FrKbaCreateCallback: () => import('@/components/callbacks/KbaCreateCallback'),
    FrPasswordCallback: () => import('@/components/callbacks/PasswordCallback'),
    FrPollingWaitCallback: () => import('@/components/callbacks/PollingWaitCallback'),
    FrReCaptchaCallback: () => import('@/components/callbacks/ReCaptchaCallback'),
    FrRecoveryCodesComponent: () => import('@/components/display/RecoveryCodes'),
    FrSelectIdPCallback: () => import('@/components/callbacks/SelectIdPCallback'),
    FrSuspendedTextOutputCallback: () => import('@/components/callbacks/SuspendedTextOutputCallback'),
    FrTermsAndConditionsCallback: () => import('@/components/callbacks/TermsAndConditionsCallback'),
    FrTextOutputCallback: () => import('@/components/callbacks/TextOutputCallback'),
    FrValidatedCreatePasswordCallback: () => import('@/components/callbacks/ValidatedCreatePasswordCallback'),
    FrWebAuthnComponent: () => import('@/components/display/WebAuthn'),
  },
  props: {
    buttonText: {
      type: String,
      default: '',
    },
    journeyFooter: {
      type: String,
      default: '',
    },
    journeyFooterEnabled: {
      type: Boolean,
      default: false,
    },
    journeyHeader: {
      type: String,
      default: '',
    },
    journeyHeaderEnabled: {
      type: Boolean,
      default: false,
    },
    journeyTheaterMode: {
      type: Boolean,
      default: false,
    },
    journeyJustifiedContent: {
      type: String,
      default: '',
    },
    journeyJustifiedContentEnabled: {
      type: Boolean,
      default: false,
    },
    journeyLayout: {
      type: String,
      default: 'card',
    },
    logoAltText: {
      type: String,
      default: '',
    },
    logoEnabled: {
      type: Boolean,
      default: true,
    },
    logoHeight: {
      type: String,
      default: '40',
    },
    logoPath: {
      type: String,
      default: '',
    },
    themeLoading: {
      type: Boolean,
      default: false,
    },
  },
  mixins: [
    NotificationMixin,
    RestMixin,
    LoginMixin,
    TranslationMixin,
  ],
  data() {
    return {
      componentList: [],
      description: '',
      errorMessage: '',
      header: '',
      hiddenValueCallbacksRefs: [],
      linkToTreeStart: '',
      loading: true,
      loginFailure: false,
      nextButtonDisabledArray: [],
      nextButtonVisible: false,
      nextStepCallbacks: [],
      nodeThemeId: undefined,
      realm: '/',
      retry: undefined,
      showScriptElms: false,
      step: undefined,
      suspendedId: undefined,
      treeId: undefined,
    };
  },
  computed: {
    buttonTextLocalized() {
      let submitButtonTextOverride = null;
      try {
        submitButtonTextOverride = this.getLocalizedString(this.stage.submitButtonText, i18n.locale);
      } catch (e) {
        return this.buttonText || this.$t('login.next');
      }

      return submitButtonTextOverride || this.buttonText || this.$t('login.next');
    },
    nextButtonDisabled() {
      // checks if there are any true bool values in array
      return this.nextButtonDisabledArray.some((bool) => bool);
    },
    sanitizedContent() {
      return this.$sanitize(this.journeyJustifiedContent);
    },
    sanitizedFooter() {
      return this.$sanitize(this.journeyFooter);
    },
    sanitizedHeader() {
      return this.$sanitize(this.journeyHeader);
    },
    stage() {
      try {
        return JSON.parse(this.step.getStage());
      } catch (e) {
        if (this.step.getStage() !== undefined) {
          return this.step.getStage();
        }
        return '';
      }
    },
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.$emit('component-ready');
    this.realm = urlParams.get('realm') || '/';

    this.getConfigurationInfo(this.realm)
      .then((config) => {
        this.setRealm(config);
      })
      .then(this.checkNewSession)
      .then(() => {
        this.evaluateUrlParams();
        this.nextStep();
      })
      .catch(() => {
        this.errorMessage = this.$t('login.invalidRealm');
        this.redirectToFailure(this.step);
        this.loading = false;
      });
  },
  methods: {
    /**
     * @description handler for scripts clicking on loginButton_0
     * if a script clicks on loginButton_0 we want to make sure that the
     * the hiddenValue elements values are added to the callback data structure since
     * that is what will be sent with the request
     * this function iterates through the hiddenValue dom refs to accomplish that
     */
    backendScriptsHandler() {
      this.hiddenValueCallbacksRefs.forEach((ref) => {
        const refId = ref.id;
        const refValue = ref.value;
        this.step
          .getCallbacksOfType(FrCallbackType.HiddenValueCallback)
          .find((x) => x.getOutputByName('id', '') === refId)
          .setInputValue(refValue);
      });
      this.nextStep();
    },
    backendScriptsIdsContains(matcher) {
      const typeArr = this.step.getCallbacksOfType(FrCallbackType.HiddenValueCallback)
        .map((callback) => callback.getOutputByName('id', ''));
      return typeArr.indexOf(matcher) >= 0;
    },
    buildTreeForm() {
      this.header = this.step.getHeader() || '';
      this.description = this.$sanitize(this.step.getDescription() || '');
      this.nextButtonVisible = true;
      this.nextButtonDisabledArray = [false];

      this.checkNodeForThemeOverride(this.stage);

      // Ensure that Social Buttons appear at top of Page Node
      const pullToTop = FrCallbackType.SelectIdPCallback;
      this.step.callbacks.sort((currentCallback, otherCallback) => {
        if (currentCallback.payload.type === pullToTop) {
          return -1;
        }
        if (otherCallback.payload.type === pullToTop) {
          return 1;
        }
        return 0;
      });

      // Some callbacks don't need to render anything so forEach is used instead of map
      const componentList = [];
      let keyFromDate = Date.now();
      this.step.callbacks.forEach((callback, i) => {
        // index 0 is reserved for callback_0 used in backend scripts
        const index = i + 1;
        this.nextButtonDisabledArray.push(this.isCallbackRequired(callback));
        const existsInComponentList = (type) => find(componentList, (component) => component.type === `Fr${type}`);
        let type = callback.getType();

        if (type === FrCallbackType.RedirectCallback) {
          this.nextButtonVisible = false;
          if (callback.getOutputByName('trackingCookie')) {
            // save current step information for later resumption of tree.
            sessionStorage.setItem('authIndexValue', this.treeId || this.$route.params.tree);
            sessionStorage.setItem('step', JSON.stringify(this.step));
            sessionStorage.setItem('realm', this.realm);
          }
          const redirectUrl = callback.getOutputByName('redirectUrl');
          if (callback.getOutputByName('redirectMethod') === 'POST') {
            const redirectData = callback.getOutputByName('redirectData');
            const form = document.createElement('form');
            form.method = 'post';
            form.action = redirectUrl;

            Object.entries(redirectData).forEach(([key, value]) => {
              const hiddenField = document.createElement('input');
              hiddenField.type = 'hidden';
              hiddenField.name = key;
              hiddenField.value = value;

              form.appendChild(hiddenField);
            });

            document.body.appendChild(form);
            form.submit();
          } else {
            window.location.href = redirectUrl;
          }
          return;
        }

        // Use SDK to handle backend scripts that SDK can parse
        // Reasign type to use specific component
        if (type === FrCallbackType.TextOutputCallback || type === FrCallbackType.MetadataCallback) {
          const isWebAuthnStep = FRWebAuthn.getWebAuthnStepType(this.step) !== WebAuthnStepType.None;
          const isRecovertCodeStep = FRRecoveryCodes.isDisplayStep(this.step);
          if (isWebAuthnStep) {
            // dont call the sdk twice on the same webAuthn step
            const onlyOneWebAuthn = !existsInComponentList(FrCallbackType.WebAuthnComponent);
            if (onlyOneWebAuthn) {
              type = FrCallbackType.WebAuthnComponent;
            } else {
              return;
            }
          } else if (isRecovertCodeStep) {
            type = FrCallbackType.RecoveryCodesComponent;
          }
        }

        // Only components that need extra props or events
        const getcomponentPropsAndEvents = (componentType) => {
          const componentPropsAndEvents = {
            ChoiceCallback: () => {
              let stage;
              if (this.stage.ChoiceCallback) {
                stage = this.stage.ChoiceCallback.shift();
              }
              return { callbackSpecificProps: { stage } };
            },
            ConfirmationCallback: () => {
              let stage;
              if (this.stage.ConfirmationCallback) {
                stage = this.stage.ConfirmationCallback.shift();
              }
              return { callbackSpecificProps: { stage, variant: existsInComponentList(FrCallbackType.WebAuthnComponent) ? 'link' : 'primary' } };
            },
            ConsentMappingCallback: () => ({
              callbackSpecificProps: { callbacks: this.step.callbacks },
              listeners: ['disable-next-button', 'did-consent'],
            }),
            HiddenValueCallback: () => ({
              listeners: ['hidden-value-callback-ref'],
            }),
            KbaCreateCallback: () => ({
              callbackSpecificProps: { showHeader: !existsInComponentList(FrCallbackType.KbaCreateCallback) },
              listeners: ['disable-next-button'],
            }),
            ReCaptchaCallback: () => ({
              listeners: ['next-step-callback'],
            }),
            SelectIdPCallback: () => ({
              callbackSpecificProps: { isOnlyCallback: this.step.callbacks.length === 1 },
              listeners: ['hide-next-button', 'disable-next-button'],
            }),
            TextOutputCallback: () => ({
              listeners: ['disable-next-button', 'has-scripts', 'hide-next-button', 'next-step-callback'],
            }),
            ValidatedCreatePasswordCallback: () => {
              let stage;
              if (this.stage.ValidatedCreatePasswordCallback) {
                stage = this.stage.ValidatedCreatePasswordCallback.shift();
              }
              return {
                callbackSpecificProps: {
                  index,
                  overrideInitialPolicies: true,
                  realm: this.realm,
                  stage,
                },
                listeners: ['disable-next-button', 'next-step-callback'],
              };
            },
            WebAuthnComponent: () => {
              const webAuthnType = FRWebAuthn.getWebAuthnStepType(this.step);
              const webAuthnPromise = this.createWebAuthnCallbackPromise(webAuthnType);
              return {
                callbackSpecificProps: { webAuthnType, webAuthnPromise },
              };
            },
          };
          return componentPropsAndEvents[componentType] ? componentPropsAndEvents[componentType]() : {};
        };

        const { callbackSpecificProps = {}, listeners = [] } = getcomponentPropsAndEvents(type);
        const component = {
          callback,
          callbackSpecificProps,
          index,
          // if the app isn't loading update existing component props
          key: this.loading ? keyFromDate += 1 : this.componentList[i].key,
          listeners: this.getListeners({ callback, index }, listeners),
          type: this.$options.components[`Fr${type}`]
            ? `Fr${type}`
            : 'FrField',
        };

        if (component.type === 'FrField' || component.type === 'FrPasswordCallback') {
          const {
            fieldType, label, name, value,
          } = this.getField(callback, index);
          const errors = this.getTranslatePolicyFailures(callback);
          component.callbackSpecificProps = {
            errors, label, name, type: fieldType, value,
          };
          component.listeners = this.getListeners({ callback, index }, ['input']);
        }

        const hideNextButtonCallbacks = [
          FrCallbackType.ConfirmationCallback,
          FrCallbackType.DeviceProfileCallback,
          FrCallbackType.PollingWaitCallback,
          FrCallbackType.RecoveryCodesComponent,
          FrCallbackType.SuspendedTextOutputCallback,
          FrCallbackType.WebAuthnComponent,
        ];
        this.nextButtonVisible = hideNextButtonCallbacks.indexOf(type) > -1 ? false : this.nextButtonVisible;

        componentList.push(component);
      });
      this.componentList = componentList;
    },
    // needs to happen before other query params are processed
    checkNewSession() {
      return new Promise((resolve) => {
        // need to logout if query param is present and equal to newsession
        if (new URLSearchParams(this.getCurrentQueryString()).get('arg') === 'newsession') {
          SessionManager.logout().then(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    },
    checkNodeForThemeOverride(stage) {
      if (isString(stage)) {
        this.nodeThemeId = getThemeIdFromStageString(stage);
      } else if (stage.themeId) {
        this.nodeThemeId = stage.themeId;
      }
    },
    /**
     * @description clears and sets the reentry cookie to be deleted
     */
    clearReentryToken() {
      const date = new Date();
      date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
      document.cookie = `reentry="";expires="${date.toGMTString()}";path=/`;
    },
    /**
     * @description  Invokes WebAuthn registration or authentication
     * @param {Number} type enum number that represents WebAuthn type WebAuthnStepType.Authentication or WebAuthnStepType.Registration
     * @returns {Promise} SDK WebAuthn promise resolved when WebAuthn is completed
     */
    createWebAuthnCallbackPromise(type) {
      if (type === WebAuthnStepType.Authentication) {
        return FRWebAuthn.authenticate(this.step);
      }
      return FRWebAuthn.register(this.step);
    },
    /**
     * @description Look at the url and see if we are returning to a tree from an Email Suspend Node, Redirect Callback, or SAML.
     * Must be default route and contain the strings "suspendedId=" and "authIndexValue=" for Email Suspend Node.
     * Must contain the strings "state=" and "code=" and "scope=" for redirect callback.
     * Must contain reentry cookie for SAML redirect.
     */
    evaluateUrlParams() {
      const paramString = this.getCurrentQueryString();
      const params = new URLSearchParams(paramString);
      const realm = params.get('realm') || '/';
      const hash = window.location.hash || '';

      const createParamString = (urlParams) => {
        const ampersand = urlParams.toString().length > 1 ? '&' : '';
        let stringParams = '';
        urlParams.forEach((value, key) => {
          if (stringParams.length) {
            stringParams += '&';
          }
          if (key === 'authIndexValue' && urlParams.get('authIndexType') === 'service') {
            stringParams += `${key}=${value}`;
          } else {
            stringParams += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
          }
        });
        return `${ampersand}${stringParams}`;
      };

      this.setPageTitle(hash, params);

      if (realm) params.delete('realm');
      // arg query parameter handled in checkNewSession method
      if (params.get('arg') === 'newsession') params.delete('arg');
      if (this.$route.name === 'login' && paramString.includes('suspendedId=') && paramString.includes('authIndexValue=')) {
        // setting params in vue data then deleting to remove redundant params from URL
        this.treeId = params.get('authIndexValue');
        params.delete('authIndexValue');
        params.delete('authIndexType');
        this.suspendedId = params.get('suspendedId');
        params.delete('suspendedId');

        const stringParams = createParamString(params);
        this.removeUrlParams();
        window.history.replaceState(null, null, `?realm=${this.realm}${stringParams}`);
      } else if (paramString.includes('state=') || paramString.includes('code=') || paramString.includes('scope=')) {
        this.state = params.get('state');
        params.delete('state');
        this.code = params.get('code');
        params.delete('code');
        this.scope = params.get('scope');
        params.delete('scope');

        // session storage is used to resume a tree after returning from a redirect
        const { authIndexValue, step, realm: stepRealm } = this.getStepFromStorage();
        this.treeId = authIndexValue;
        this.step = new FRStep(step.payload);
        this.realm = stepRealm;

        const stringParams = createParamString(params);
        this.removeUrlParams();
        window.history.replaceState(null, null, `?realm=${this.realm}${stringParams}`);
      } else if (this.hasReentryToken()) {
        const { authIndexValue, step, realm: stepRealm } = this.getStepFromStorage();
        if (authIndexValue && step && step.payload) {
          this.treeId = authIndexValue;
          this.step = new FRStep(step.payload);
          this.realm = stepRealm;
        }
        this.clearReentryToken();
      } else {
        const resourceUrlParam = params.get('resourceURL');
        if (resourceUrlParam) params.delete('resourceURL');
        // Rest does not accept the params listed in the array below as is
        // they must be transformed into the "authIndexType" and "authIndexValue" params
        // there should only be one authIndexType/Value per request
        each(['authlevel', 'module', 'service', 'user', 'resource'], (param) => {
          if (params.get(param)) {
            const resourceDefinedWithoutUrl = param === 'resource' && !resourceUrlParam;
            if (resourceDefinedWithoutUrl) {
              return;
            }

            const indexValue = param === 'resource' ? resourceUrlParam : params.get(param);

            params.delete(param);
            params.set('authIndexType', param === 'authlevel' ? 'level' : param);
            params.set('authIndexValue', indexValue);
          }
        });

        if (this.$route.params.tree) {
          this.treeId = this.$route.params.tree;
        } else if (params.get('authIndexValue') && params.get('authIndexType') === 'service') {
          this.treeId = params.get('authIndexValue');
        }

        this.removeUrlParams();
        const stringParams = createParamString(params);
        window.history.replaceState(null, null, `?realm=${this.realm}${stringParams}${hash}`);
      }
    },
    /**
     * @description gets field information
     * @param {Object} callback specific step callback
     * @param {Object} index callback index
     * @returns {Object} field props needed for Field component
     */
    getField(callback, index) {
      const callbackType = callback.getType();
      let fieldType;

      switch (callbackType) {
        case FrCallbackType.PasswordCallback:
        case FrCallbackType.ValidatedCreatePasswordCallback:
          fieldType = 'password';
          break;
        case FrCallbackType.NumberAttributeInputCallback:
          fieldType = 'number';
          break;
        default:
          fieldType = 'string';
          break;
      }

      let label = '';
      if (callback.getPrompt) {
        label = callback.getPrompt();
      } else if (callback.getOutputByName) {
        try {
          label = callback.getOutputByName('prompt').value;
        } catch (e) {
          noop();
        }
      }
      return {
        label,
        fieldType,
        name: `callback_${index}`,
        value: callback.getInputValue(),
      };
    },
    /**
     * @description Used to get link to start of tree from stepParams
     * @param {Object} stepParams desctuctured object containing tree, realmPath strings
     * @returns {string} returns string url
     */
    getLinkToTreeStart({ tree, realmPath, query: { goto, gotoOnFail } }) {
      const gotosString = `${goto ? `&goto=${encodeURIComponent(goto)}` : ''}${gotoOnFail ? `&gotoOnFail=${encodeURIComponent(gotoOnFail)}` : ''}`;
      return `/am/XUI/?realm=${realmPath}&authIndexType=service&authIndexValue=${tree}${gotosString}`;
    },
    /**
     * @description Used to get listeners for callback components
     * @param {Object} properties object of any properties needed to have listeners context
     * @param {Array} listenerArray array of string names to populate component listeners
     * @returns {Object} returns object populated with specified listener functions
     */
    getListeners({ callback, index }, listenerArray = []) {
      const listeners = {
        'did-consent': (consent) => {
          this.step.callbacks.forEach((callbackItem) => { callbackItem.setInputValue(consent); });
        },
        'disable-next-button': (bool) => {
          this.nextButtonDisabledArray.splice(index, 1, bool);
        },
        'has-scripts': (appendScript) => {
          this.showScriptElms = true;
          // listen on body.appendchild and append to #body-append-el insted
          const observer = new MutationObserver((records) => {
            const nodeList = records[records.length - 1].addedNodes || [];
            Array.prototype.forEach.call(nodeList, (node) => {
              document.getElementById('body-append-el').appendChild(node);
            });
            observer.disconnect();
          });
          observer.observe(document.body, { childList: true });
          // only hide next button if we know it should be hidden (webAuthn, deviceId)
          if (this.backendScriptsIdsContains('clientScriptOutputData')) {
            this.nextButtonVisible = false;
          }
          setTimeout(() => {
            this.$nextTick(appendScript);
          }, 20);
        },
        'hide-next-button': (bool) => {
          this.nextButtonVisible = !bool;
        },
        'hidden-value-callback-ref': (ref) => {
          this.hiddenValueCallbacksRefs.push(ref);
        },
        'next-step-callback': (cb) => {
          this.nextStepCallbacks.push(cb);
        },
        // event emited from FrField
        input: (value) => {
          if (callback && callback.setInputValue) {
            callback.setInputValue(value);
            if (value) {
              this.nextButtonDisabledArray.splice(index, 1, false);
            } else if (this.isCallbackRequired(callback)) {
              this.nextButtonDisabledArray.splice(index, 1, true);
            }
          }
        },
      };
      return listenerArray.reduce((acc, listener) => ({ ...acc, [listener]: listeners[listener] }), {});
    },
    /**
     * @description If session storage has step information, extract it and clear session storage
     * @returns {Object} two properties needed to resume tree: step and authIndex value
     */
    getStepFromStorage() {
      const step = sessionStorage.getItem('step');
      const authIndexValue = sessionStorage.getItem('authIndexValue');
      const realm = sessionStorage.getItem('realm');
      if (step !== null && authIndexValue !== null && realm !== null) {
        sessionStorage.removeItem('step');
        sessionStorage.removeItem('authIndexValue');
        sessionStorage.removeItem('realm');
        return { step: JSON.parse(step), authIndexValue, realm };
      }
      return { step: undefined, authIndexValue: undefined, realm: undefined };
    },
    getStepParams() {
      const paramString = this.getCurrentQueryString();
      const paramsObj = this.parseParameters(paramString);
      if (paramsObj.authIndexValue) {
        paramsObj.authIndexValue = decodeURI(paramsObj.authIndexValue);
      }
      const stepParams = {
        query: {},
        tree: this.treeId || this.$route.params.tree || undefined,
        realmPath: this.realm,
      };

      // Set the SDK tree property from the URL if a tree is being accessed and none of the other local variables have defined one
      if (paramsObj.authIndexType === 'service' && paramsObj.authIndexValue && typeof stepParams.tree === 'undefined') {
        stepParams.tree = paramsObj.authIndexValue;
      }

      // remove tree from stepParams when undefined
      if (stepParams.tree === undefined || stepParams.tree === 'undefined') {
        delete stepParams.tree;
      }

      if (this.suspendedId) {
        stepParams.query.suspendedId = this.suspendedId;
        stepParams.query.goto = (paramsObj.goto) ? decodeURIComponent(paramsObj.goto) : undefined;
        stepParams.query.gotoOnFail = (paramsObj.gotoOnFail) ? decodeURIComponent(paramsObj.gotoOnFail) : undefined;
      } else {
        stepParams.query = paramsObj;
        stepParams.query.code = this.code ? this.code : undefined;
        stepParams.query.state = this.state ? this.state : undefined;
        stepParams.query.scope = this.scope ? this.scope : undefined;
        stepParams.query.goto = (paramsObj.goto) ? decodeURIComponent(paramsObj.goto) : undefined;
        stepParams.query.gotoOnFail = (paramsObj.gotoOnFail) ? decodeURIComponent(paramsObj.gotoOnFail) : undefined;
      }
      // stepParams.query.realm never needs to be included. We are already sending stepParams.realmPath which is what the
      // sdk uses to build the authenticate url ('/am/json/realms/root/realms/alpha/authenticate').
      // When realm is included ('/am/json/realms/root/realms/alpha/authenticate?realm=/alpha') this can confuse
      // some parts of am like SAML (see FRAAS-6573).
      delete stepParams.query.realm;

      // locale is set by the request header through sdk config. Sending this query param causes unexpected responses from AM
      // with differences between chains and trees. More consistent to just rely on the request header (see IAM-1440)
      delete stepParams.query.locale;
      return stepParams;
    },
    getTranslatePolicyFailures(callback) {
      const failedPolicies = callback.getFailedPolicies
        ? callback.getFailedPolicies()
        : [];
      return failedPolicies.map((policy) => {
        const parsedPolicy = JSON.parse(policy);
        return this.$t(`common.policyValidationMessages.${parsedPolicy.policyRequirement}`, parsedPolicy.params);
      });
    },
    /**
     * @description Returns boolean true if reentry cookie is set
     * @returns {Boolean}
     */
    hasReentryToken() {
      return !!document.cookie
        .split('; ')
        .find((row) => row.startsWith('reentry='));
    },
    /**
     * @description Determines if passed in callback is set to required or has a required policy
     * @param {Object} callback - callback to check if required
     * @returns {Boolean} True if passed in callback is required
     */
    isCallbackRequired(callback) {
      const requiredOutput = callback.getOutputByName('required');
      if (requiredOutput === true && callback.getType() !== 'BooleanAttributeInputCallback') {
        return true;
      }
      const policyOutput = callback.getOutputByName('policies');
      if (has(policyOutput, 'policies')) {
        const requiredPolicy = policyOutput.policies.find((policy) => policy.policyId === 'required');
        if (has(requiredPolicy, 'policyRequirements') && requiredPolicy.policyRequirements.includes('REQUIRED')) {
          return true;
        }
      }
      return false;
    },
    /**
     * @description Returns boolean true if payload has session timeout error code
     * @param {Object} payload - step payload data
     * @returns {Boolean}
     */
    isSessionTimedOut(payload) {
      return (
        (payload.detail && payload.detail.errorCode === '110')
        || (this.suspendedId && payload.code.toString() === '401')
      );
    },
    /**
     * @description Gets callbacks needed for authentication when this.step is undefined, and submits callback values when
     * this.step is defined. Then determines based on step.type what action to take.
     */
    nextStep(event, preventClear) {
      if (event) {
        event.preventDefault();
      }
      // for when no change is expected between steps (stops a flash of white from rerender)
      if (!preventClear) {
        this.loading = true;
        this.showScriptElms = false;
        this.hiddenValueCallbacksRefs = [];
      }
      this.loginFailure = false;
      this.linkToTreeStart = '';

      // invoke callbacks before nextStep
      // if a callback returns a promise, the promise is pushed to an array
      const callbackPromises = [];
      while (this.nextStepCallbacks.length) {
        const cb = this.nextStepCallbacks.shift();
        const returnPromise = cb();
        if (returnPromise && typeof returnPromise === 'object' && typeof returnPromise.then === 'function') {
          callbackPromises.push(returnPromise);
        }
      }
      // the array of promises is waited on to continue execution until all have resolved
      if (callbackPromises.length) {
        Promise.all(callbackPromises).finally(
          () => this.nextStep(event, preventClear),
        );
        return;
      }

      const stepParams = this.getStepParams();
      FRAuth.next(this.step, stepParams)
        .then((step) => {
          let initialStep;
          const realmAndTreeInitialStep = JSON.parse(sessionStorage.getItem('initialStep'));
          const realmAndTreeKey = `${stepParams.realmPath}/${stepParams.tree || ''}`;
          if (realmAndTreeInitialStep && realmAndTreeInitialStep.key === realmAndTreeKey) {
            initialStep = new FRStep(realmAndTreeInitialStep.step.payload);
          } else if (step.type !== 'LoginFailure') {
            sessionStorage.setItem('initialStep', JSON.stringify(
              {
                key: realmAndTreeKey,
                step,
              },
            ));
          }
          const previousStep = this.step;
          this.step = step;

          // these step params only need to be sent one time
          if (this.code || this.state || this.scope) {
            this.code = undefined;
            this.state = undefined;
            this.scope = undefined;
          }

          switch (step.type) {
            case 'LoginSuccess':
              // If we have a session token, get user information
              sessionStorage.removeItem('initialStep');
              this.getIdFromSession()
                .then(this.getUserInfo)
                .then((userObj) => {
                  let isAdmin = false;
                  const rolesArray = userObj.data.roles;

                  if (rolesArray.includes('ui-global-admin') || rolesArray.includes('ui-realm-admin')) {
                    isAdmin = true;
                  }
                  return this.verifyGotoUrlAndRedirect(step.getSuccessUrl(), this.realm, isAdmin);
                })
                .then((res) => {
                  window.location.href = res;
                })
                .catch(() => {
                  // attempt to redirect user on failure
                  this.verifyGotoUrlAndRedirect(step.getSuccessUrl(), this.realm, false)
                    .then((res) => {
                      window.location.href = res;
                    });
                });
              break;
            case 'LoginFailure':
              this.loading = true;
              if (this.retry && this.isSessionTimedOut(step.payload)) {
                this.retry = false;
                this.retryWithNewAuthId(previousStep, stepParams);
              } else if (this.suspendedId && this.isSessionTimedOut(step.payload)) {
                this.errorMessage = step.payload.message || this.$t('login.loginFailure');
                this.linkToTreeStart = this.getLinkToTreeStart(stepParams);
                this.loading = false;
              } else {
                this.errorMessage = step.payload.message || this.$t('login.loginFailure');
                this.redirectToFailure(step);
                this.step = initialStep;
                this.retry = true;
                if (this.step && this.step.callbacks) {
                  this.componentList = [];
                  this.buildTreeForm();
                }
                this.loading = false;
              }
              this.loginFailure = true;
              break;
            default:
              // retry only when previous was undefined (first step)
              this.retry = !previousStep;

              // check if we are still polling with the same callbacks and set loading to false
              if (preventClear && previousStep) {
                const arrayLengthMatch = previousStep.callbacks.length === step.callbacks.length;
                let sameCallbacks;
                if (arrayLengthMatch) {
                  sameCallbacks = previousStep.callbacks.every((prevCallback, i) => prevCallback.getType() === step.callbacks[i].getType());
                }
                this.loading = !(arrayLengthMatch && sameCallbacks);
                this.showScriptElms = arrayLengthMatch && sameCallbacks;
              }
              // setup the form based on callback info/values obtained from this.step
              this.buildTreeForm();
              this.loading = false;
              break;
          }
          this.$emit('set-theme', this.realm, this.treeId, this.nodeThemeId);
        },
        () => {
          this.$emit('component-ready', 'error');
          this.errorMessage = this.$t('login.issueConnecting');
          this.redirectToFailure(this.step);
          this.loading = false;
        });
    },
    /**
     * Determine if there is a gotoOnFail parameter. If it exists, verify and redirect to that url or hash
     * Redirect to failureUrl when it exists, and display login failure message if not
     *
     * @param {Object} step - callback metadata containing url of failure
     */
    redirectToFailure(step) {
      const urlParams = new URLSearchParams(window.location.search);
      const gotoOnFail = urlParams.get('gotoOnFail');

      if (gotoOnFail) {
        this.verifyGotoUrlAndRedirect(gotoOnFail, this.realm, false, true)
          .then((res) => {
            if (res && res.length) {
              window.location.href = encodeURI(res);
            } else if (has(step, 'payload.detail.failureUrl') && step.payload.detail.failureUrl.length) {
              window.location.href = step.payload.detail.failureUrl;
            }
          })
          .catch((error) => {
            this.displayNotification('IDMMessages', 'error', error.response.data.message);
          });
      } else if (has(step, 'payload.detail.failureUrl') && step.payload.detail.failureUrl.length) {
        window.location.href = step.payload.detail.failureUrl;
      }
    },
    removeUrlParams() {
      // remove query params from the url
      window.history.replaceState(null, null, window.location.pathname);
      // if a tree is defined reset the hash to the proper tree
      if (this.treeId) {
        window.location.hash = `service/${this.treeId}`;
      }
    },
    /**
     * Retry a previously failed step with a new authId. The new authId is acquired by calling FRAuth.next with no step.
     * Then a this.nextStep is called with the previously failed step and new authId
     *
     * @param {Object} previousStep - previous step data with prototype intact
     * @param {Object} stepParams - step params
     *
     */
    retryWithNewAuthId(previousStep, stepParams) {
      FRAuth.next(undefined, stepParams)
        .then((step) => {
          const { authId } = step.payload;
          this.step = previousStep;
          if (has(this.step, 'payload')) {
            this.step.payload.authId = authId;
          }
          this.nextStep();
        });
    },
    setRealm(config) {
      this.realm = config ? config.data.realm : '/';
    },
    /**
     * Sets page title depending on the journey service type
     *
     * @param {String} hash - window.location.hash
     * @param {Oject} params - params.get(string)
     *
     */
    setPageTitle(hash, params) {
      // For the following registration url params:
      // &authIndexType=service&authIndexValue=Registration
      if (params && params.get('authIndexType') === 'service' && params.get('authIndexValue')) {
        document.title = params.get('authIndexValue');

      // For the following registration url:
      // #/service/Registration
      } else if (hash.includes('service')) {
        const hashSplit = hash.split('/');
        const serviceIndex = hashSplit.indexOf('service');
        // makes sure that the hashSplit array has at least one more element after 'service'
        const serviceValueExists = (serviceIndex + 2) >= hashSplit.length;

        if (serviceIndex !== -1 && serviceValueExists) {
          const title = hashSplit[serviceIndex + 1];
          // in the event that the remaining url contains query params
          if (title.includes('?')) {
            const titleSplitByParam = title.split('?')[0];
            document.title = titleSplitByParam;
          } else {
            document.title = title;
          }
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#callbacksPanel ::v-deep {
  span.material-icons {
    line-height: 22px;
  }

  .callback-component:not(:last-of-type):not(.hidden) {
    margin-bottom: 1rem;
  }

  .hide-polling-spinner ~ .polling-spinner-container {
    display: none;
  }

  .max-width-600 {
    max-width: 600px;
  }

  .journey-card {
    background-color: $white;
  }
}

@media (min-width: 768px) {
  .w-md-50 {
    width: 50% !important;
  }
}

@media (max-width: 576px) {
  .fr-fullscreen-mobile {
    .container,
    .col-lg-12 {
      margin: 0;
      padding: 0;
      height: 100%;
    }
  }
}
</style>
