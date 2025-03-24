<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="min-vh-100 d-flex flex-column fr-fullscreen-mobile"
    ref="container"
    tabindex="-1">
    <FrLoginHeader
      v-if="journeyHeaderEnabled && journeyHeader && (journeyLayout === 'card' || !journeyTheaterMode)"
      :custom-html="sanitizedHeader"
      :is-accessible="journeyHeaderSkipLinkEnabled"
      main-content-id="mainContent"
      v-bind="screenReaderHeaderRole" />
    <main
      ref="main"
      id="mainContent"
      tabindex="-1"
      v-if="!journeyLayout || journeyLayout === 'card' || !journeyTheaterMode"
      class="px-0 flex-grow-1 d-flex container focus-ring-none">
      <BContainer class="flex-grow-1 d-flex">
        <BRow :class="[{'flex-row-reverse': journeyLayout === 'justified-right'}, 'align-items-center m-0 flex-grow-1']">
          <BCol :lg="journeyLayout !== 'card' ? 6 : 12">
            <section>
              <FrCenterCard
                :logo-enabled="logoEnabled && !themeLoading"
                :logo-height="logoHeight"
                :logo-path="logoPath"
                :header-classes="['login-header']"
              >
                <template #center-card-header>
                  <div aria-live="polite">
                    <template v-if="!loading && !themeLoading">
                      <h1
                        v-if="header"
                        class="h2">
                        {{ header }}
                      </h1>
                      <h1
                        v-if="journeyA11yAddFallbackErrorHeading && !header && loginFailure"
                        class="h2">
                        {{ $t('login.errorHeading') }}
                      </h1>
                      <p
                        v-if="description"
                        v-html="description" />
                      <p
                        v-if="screenReaderMessageType !== 'ERROR'"
                        class="sr-only"
                        v-html="screenReaderMessage" />
                    </template>
                  </div>
                </template>

                <template #center-card-body>
                  <BCardBody
                    aria-live="assertive"
                    tabindex="-1"
                    v-if="!loading && !themeLoading"
                    id="callbacksPanel"
                    data-testid="callbacks_panel">
                    <FrAlert
                      :show="loginFailure"
                      :dismissible="false"
                      variant="error"
                      class="p-3 text-left">
                      {{ getTranslation(errorMessage) }}
                    </FrAlert>
                    <FrAlert
                      :show="screenReaderMessageType === 'ERROR'"
                      :dismissible="false"
                      variant="error"
                      class="p-3 text-left">
                      <div v-html="screenReaderMessage" />
                    </FrAlert>
                    <div v-if="loginFailure && linkToTreeStart">
                      <a :href="linkToTreeStart">
                        {{ $t('login.sessionTimeoutLink') }}
                      </a>
                    </div>
                    <div
                      id="body-append-el"
                      tabindex="-1">
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
                        <!-- IDP logins are grouped within their own fieldset to logically separate them from the standard login flow. This is an accessibility change to more logically structure the page.  -->
                        <template v-if="idpComponent">
                          <fieldset>
                            <legend
                              class="legend-hidden"
                              id="idp-legend">
                              {{ $t('login.social.legend') }}
                            </legend>
                            <FrSelectIdPCallback
                              class="callback-component"
                              :callback="idpComponent.callback"
                              :index="idpComponent.index"
                              :key="idpComponent.key"
                              :floating-label="journeyFloatingLabels"
                              aria-describedby="idp-legend"
                              v-bind="{...idpComponent.callbackSpecificProps}"
                              v-on="{
                                'next-step': (event, preventClear) => {
                                  nextStep(event, preventClear);
                                },
                                ...idpComponent.listeners}" />
                          </fieldset>
                        </template>
                        <Component
                          v-for="(component) in componentList"
                          class="callback-component"
                          :callback="component.callback"
                          :index="component.index"
                          :is="component.type"
                          :key="component.key"
                          :step="step"
                          :floating-label="journeyFloatingLabels"
                          :is-required-aria="component.isRequired"
                          :position-button="journeySignInButtonPosition"
                          :aria-label="component?.callbackSpecificProps?.name || 'callback'"
                          v-bind="{...component.callbackSpecificProps}"
                          v-on="{
                            'next-step': (event, preventClear) => {
                              nextStep(event, preventClear);
                            },
                            ...component.listeners}" />
                        <div
                          v-if="nextButtonVisible"
                          :class="['d-flex mt-3', journeySignInButtonPosition]"
                        >
                          <BButton
                            type="submit"
                            variant="primary"
                            :disabled="nextButtonDisabled">
                            {{ buttonTextLocalized }}
                          </BButton>
                        </div>
                        <div
                          v-if="rememberMeVisible && $store.state.SharedStore.webStorageAvailable"
                          class="mt-3">
                          <FrField
                            name="rememberMe"
                            :label="journeyRememberMeLabel || getTranslation($t('login.rememberMe'))"
                            v-model="rememberMeValue"
                            type="checkbox" />
                        </div>
                        <input
                          v-if="showScriptElms"
                          :aria-label="$t('login.displayElementsByScripts')"
                          id="loginButton_0"
                          role="button"
                          type="submit"
                          @click.prevent="backendScriptsHandler"
                          hidden>
                      </form>
                    </div>
                  </BCardBody>
                  <BCardBody
                    aria-live="polite"
                    v-else>
                    <div class="h-100 d-flex">
                      <div class="fr-center-card">
                        <Spinner class="mb-4" />
                      </div>
                    </div>
                  </BCardBody>
                  <div
                    class="w-100 d-flex p-2 d-lg-none"
                    v-if="journeyJustifiedContentEnabled && journeyJustifiedContentMobileViewEnabled">
                    <div
                      v-html="journeyJustifiedContent"
                      class="d-flex h-100 w-100 justify-content-center align-self-center" />
                  </div>
                  <BCardFooter
                    v-if="pageNodeFooterLocalized"
                    :footer-html="pageNodeFooterLocalized" />
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
      tabindex="-1"
      :class="[{'flex-row-reverse': journeyLayout === 'justified-right'}, 'd-flex w-100 flex-grow-1 focus-ring-none']">
      <div class="journey-card w-md-50 w-100 d-flex align-items-start flex-column">
        <div class="login-header w-100 d-flex flex-column flex-grow-1 justify-content-between">
          <div
            class="pb-4 px-4 px-md-5 w-100"
            data-testid="in-situ-logo-preview">
            <div
              class="d-flex"
              ref="callbackAppHeaderContainer">
              <img
                v-if="logoEnabled"
                class="ping-logo mt-4"
                alt=""
                :style="{ height: `${logoHeight}px` }"
                :src="logoPath">
              <div
                v-if="journeyHeaderEnabled"
                class="flex-grow-1"
                id="appHeader">
                <FrLoginHeader
                  :custom-html="sanitizedHeader"
                  :is-accessible="journeyHeaderSkipLinkEnabled"
                  main-content-id="body-append-el"
                  v-bind="screenReaderHeaderRole" />
              </div>
            </div>
          </div>

          <div
            class="px-4 px-md-5 focus-ring-none"
            aria-live="polite"
            ref="callbackMain"
            tabindex="-1">
            <BRow class="m-0">
              <BCol xl="9">
                <h1
                  v-if="header"
                  class="display-4 mb-5 h2">
                  {{ header }}
                </h1>
                <h1
                  v-if="journeyA11yAddFallbackErrorHeading && !header && loginFailure"
                  class="h2">
                  {{ $t('login.errorHeading') }}
                </h1>
                <p
                  v-if="description"
                  v-html="description" />
              </BCol>
            </BRow>
            <p
              v-if="screenReaderMessageType !== 'ERROR'"
              class="sr-only"
              v-html="screenReaderMessage" />
          </div>
        </div>
        <div class="mt-1 px-4 px-md-5 d-flex w-100 flex-grow-1">
          <div
            class="w-100 max-width-600">
            <BRow
              v-if="!loading && !themeLoading"
              class="m-0">
              <BCol xl="9">
                <FrAlert
                  :show="loginFailure"
                  :dismissible="false"
                  variant="error"
                  class="p-3 text-left">
                  {{ getTranslation(errorMessage) }}
                </FrAlert>
                <FrAlert
                  :show="screenReaderMessageType === 'ERROR'"
                  :dismissible="false"
                  variant="error"
                  class="p-3 text-left">
                  <div v-html="screenReaderMessage" />
                </FrAlert>
                <div v-if="loginFailure && linkToTreeStart">
                  <a :href="linkToTreeStart">
                    {{ $t('login.sessionTimeoutLink') }}
                  </a>
                </div>
                <div
                  id="body-append-el"
                  tabindex="-1">
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
                    <!-- IDP logins are grouped within their own fieldset to logically separate them from the standard login flow. This is an accessibility change to more logically structure the page.  -->
                    <template v-if="idpComponent">
                      <fieldset>
                        <legend
                          class="legend-hidden"
                          id="idp-legend">
                          {{ $t('login.social.legend') }}
                        </legend>
                        <FrSelectIdPCallback
                          class="callback-component"
                          :callback="idpComponent.callback"
                          :index="idpComponent.index"
                          :key="idpComponent.key"
                          :floating-label="journeyFloatingLabels"
                          aria-describedby="idp-legend"
                          v-bind="{...idpComponent.callbackSpecificProps}"
                          v-on="{
                            'next-step': (event, preventClear) => {
                              nextStep(event, preventClear);
                            },
                            ...idpComponent.listeners}" />
                      </fieldset>
                    </template>
                    <Component
                      v-for="(component) in componentList "
                      class="callback-component"
                      :callback="component.callback"
                      :index="component.index"
                      :is="component.type"
                      :key="component.key"
                      :step="step"
                      :floating-label="journeyFloatingLabels"
                      :is-required-aria="component.isRequired"
                      :position-button="journeySignInButtonPosition"
                      v-bind="{...component.callbackSpecificProps}"
                      v-on="{
                        'next-step': (event, preventClear) => {
                          nextStep(event, preventClear);
                        },
                        ...component.listeners}"
                    />
                    <div
                      v-if="nextButtonVisible"
                      :class="['d-flex mt-3', journeySignInButtonPosition]"
                    >
                      <BButton
                        type="submit"
                        variant="primary"
                        :disabled="nextButtonDisabled">
                        {{ buttonTextLocalized }}
                      </BButton>
                    </div>
                    <div
                      v-if="rememberMeVisible && $store.state.SharedStore.webStorageAvailable"
                      class="mt-3">
                      <FrField
                        :label="journeyRememberMeLabel || getTranslation($t('login.rememberMe'))"
                        v-model="rememberMeValue"
                        type="checkbox" />
                    </div>
                    <input
                      v-if="showScriptElms"
                      :aria-label="$t('login.displayElementsByScripts')"
                      id="loginButton_0"
                      role="button"
                      type="submit"
                      @click.prevent="backendScriptsHandler"
                      hidden>
                    <div
                      v-if="pageNodeFooterLocalized"
                      class="page-footer"
                      v-html="pageNodeFooterLocalized" />
                  </form>
                </div>
              </BCol>
            </BRow>
            <BRow
              v-else
              class="justify-content-center"
              aria-live="polite"
            >
              <div class="fr-center-card">
                <Spinner class="mb-4" />
              </div>
            </BRow>
          </div>
        </div>
        <div
          v-if="journeyJustifiedContentEnabled && journeyJustifiedContentMobileViewEnabled"
          class="overflow-hidden w-100 d-md-none">
          <div
            v-html="journeyJustifiedContent"
            class="d-flex h-100 w-100 justify-content-center align-self-center" />
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
    <footer
      v-if="journeyFooterEnabled && journeyFooter && (journeyLayout === 'card' || !journeyTheaterMode)"
      v-html="sanitizedFooter"
      id="appFooter" />
  </div>
</template>

<script>
import {
  cloneDeep,
  each,
  find,
  has,
  isString,
} from 'lodash';
import {
  BButton,
  BCardBody,
  BCardFooter,
  BCol,
  BContainer,
  BRow,
} from 'bootstrap-vue';
import {
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
import { svgShapesSanitizerConfig } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import i18n from '@/i18n';
import {
  resumingTreeFollowingRedirect,
  resumingSuspendedTree,
  addTreeResumeDataToStorage,
  getResumeDataFromStorageAndClear,
} from '../../utils/authResumptionUtil';
import getAutocompleteValue from '../../utils/loginUtils';
import { getCurrentQueryString, parseParameters, replaceUrlParams } from '../../utils/urlUtil';
import doNewNodesContainRecaptchaV2 from '../../utils/recaptchaUtil';

export default {
  name: 'Login',
  components: {
    BButton,
    BCardBody,
    BCardFooter,
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
    FrLoginHeader: () => import('@/components/display/LoginHeader'),
    FrPasswordCallback: () => import('@/components/callbacks/PasswordCallback'),
    FrPollingWaitCallback: () => import('@/components/callbacks/PollingWaitCallback'),
    FrPingOneProtectCallback: () => import('@/components/callbacks/PingOneProtectCallback/PingOneProtectCallback'),
    FrPushChallengeNumber: () => import('@/components/display/PushChallengeNumber'),
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
    journeyA11yAddFallbackErrorHeading: {
      type: Boolean,
      default: true,
    },
    journeyFloatingLabels: {
      type: Boolean,
      default: true,
    },
    journeyFocusElement: {
      type: String,
      default: '',
    },
    journeyFocusFirstFocusableItemEnabled: {
      type: Boolean,
      default: false,
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
    journeyHeaderSkipLinkEnabled: {
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
    journeyJustifiedContentMobileViewEnabled: {
      type: Boolean,
      default: false,
    },
    journeyLayout: {
      type: String,
      default: 'card',
    },
    journeyRememberMeEnabled: {
      type: Boolean,
      default: false,
    },
    journeyRememberMeLabel: {
      type: String,
      default: '',
    },
    journeySignInButtonPosition: {
      type: String,
      default: 'flex-column',
    },
    logoEnabled: {
      type: Boolean,
      default: true,
    },
    logoHeight: {
      type: String,
      default: '72',
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
      isFirstStep: true,
      hiddenValueCallbacksRefs: [],
      linkToTreeStart: '',
      loading: true,
      loginFailure: false,
      mutationObserver: undefined,
      nextButtonDisabledArray: [],
      nextButtonVisible: false,
      nextStepCallbacks: [],
      nodeThemeId: undefined,
      pageNodeFooterLocalized: null,
      realm: '/',
      retry: undefined,
      showScriptElms: false,
      step: undefined,
      suspendedId: undefined,
      rememberMeVisible: false,
      rememberMeValue: false,
      treeResumptionParameters: undefined,
      treeId: undefined,
      svgShapesSanitizerConfig,
      screenReaderMessageType: '',
      screenReaderMessage: '',
      idpComponent: undefined,
    };
  },
  computed: {
    /**
     * IAM-7752 JAWS initial automatic reading says page has no links even when content is present
     * This approach will notify SR to read header content immediately on page load.
     */
    screenReaderHeaderRole() {
      return this.isFirstStep ? {
        role: 'alert',
      } : undefined;
    },
    buttonTextLocalized() {
      let submitButtonTextOverride = null;
      try {
        submitButtonTextOverride = this.getLocalizedString(this.stage.submitButtonText, i18n.global.locale, i18n.global.fallbackLocale);
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
      return this.$sanitize(this.journeyFooter, svgShapesSanitizerConfig);
    },
    sanitizedHeader() {
      return this.$sanitize(this.journeyHeader, svgShapesSanitizerConfig);
    },
    stage() {
      try {
        return JSON.parse(this.step.getStage());
      } catch (e) {
        if (this.step?.getStage() !== undefined) {
          return this.step.getStage();
        }
        return '';
      }
    },
    isRootRealm() {
      return this.realm === 'root' || this.realm === '/root' || this.realm === '/';
    },
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.$emit('component-ready');
    this.realm = urlParams.get('realm') || '/';

    // Check if web storage exists before trying to use it - see IAM-1873
    if (this.$store.state.SharedStore.webStorageAvailable) {
      if (localStorage.getItem('originalLoginRealm')) {
        localStorage.removeItem('originalLoginRealm');
      }
    }

    this.getConfigurationInfo(this.realm)
      .then((config) => {
        this.setRealm(config);
        this.redirectIfInactive();
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
  watch: {
    // on page load journeyRememberMeEnabled will be false, it will
    // update when the theme is loaded
    journeyRememberMeEnabled() {
      this.setRememberedUsername();
    },

    /*
    * Set timeout to focus on a tag according to the selected theme of the current Step (journey node)
    * Time out is set to focus after the set-theme was called and established to avoid slow rendering or vue reloads
    */
    journeyFocusElement() {
      setTimeout(() => {
        // refresh accessibility between steps by focusing on the body before the next focus to avoid the application from keeping the same activeElement
        this.$refs.container.focus();
        if (this.journeyFocusElement === 'content' || (this.journeyFocusElement === 'headerFirstStep' && !this.isFirstStep) || (this.journeyFocusFirstFocusableItemEnabled && !this.isFirstStep)) {
          /*
          * This should focus on the card inside either of the main tags
          * which  after tab would focus on the first focusable item (a description link or form input)
          *
          * journeyFocusFirstFocusableItemEnabled was an old property that could be enabled in imported journeys, if enabled it will have the default accessibility behavior of content focused
          */
          this.$refs.callbackMain ? this.$refs.callbackMain.focus() : this.$refs.main.focus();
        } else {
          // This will always focus on header if it exists or components container
          this.$refs.callbackAppHeaderContainer ? this.$refs.callbackAppHeaderContainer.focus() : this.$refs.container.focus();
        }
      }, 200);
    },
  },
  methods: {
    /**
     * Decodes a JWT token
     */
    decodeJwt(token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => (
        `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`
      )).join(''));
      return JSON.parse(jsonPayload);
    },
    /**
     * Redirects user to forbidden if non-root realm & journey pages have been inactivated for hosted pages
     */
    redirectIfInactive() {
      if (!this.isRootRealm && this.$store.state.hostedJourneyPages === false) {
        window.location.href = `${this.$store.state.SharedStore.amBaseURL}/XUI/#/forbidden`;
      }
    },
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
          .getCallbacksOfType(this.FrCallbackType.HiddenValueCallback)
          .find((x) => x.getOutputByName('id', '') === refId)
          .setInputValue(refValue);
      });
      this.nextStep();
    },
    buildTreeForm() {
      this.header = this.step.getHeader() || '';
      this.pageNodeFooterLocalized = this.getPageNodeFooter();
      this.description = this.$sanitize(this.step.getDescription() || '');
      this.nextButtonVisible = true;
      this.nextButtonDisabledArray = [false];
      this.screenReaderMessage = '';
      this.screenReaderMessageType = '';

      this.checkNodeForThemeOverride(this.stage);
      // Some callbacks don't need to render anything so forEach is used instead of map
      const componentList = [];
      let keyFromDate = Date.now();
      // IAM-5893 this.stage needs to be cloned here because it was being passed in by ref to this.getComponentPropsAndEvents() (from login mixin)
      // which caused ValidatedCreatePasswordCallback, ChoiceCallback, and ConfirmationCallback to function improperly
      const clonedStage = cloneDeep(this.stage);
      this.step.callbacks.forEach((callback, i) => {
        // index 0 is reserved for callback_0 used in backend scripts
        const index = i + 1;
        const isRequired = this.isCallbackRequired(callback);
        this.nextButtonDisabledArray.push(isRequired);
        const existsInComponentList = (type) => find(componentList, (component) => component.type === `Fr${type}`);
        let type = callback.getType();

        if (type === this.FrCallbackType.PingOneProtectInitializeCallback || type === this.FrCallbackType.PingOneProtectEvaluationCallback) {
          type = 'PingOneProtectCallback';
        }

        if (type === this.FrCallbackType.RedirectCallback) {
          this.nextButtonVisible = false;
          this.handleRedirectCallback(callback);
          return;
        }

        // Use SDK to handle backend scripts that SDK can parse
        // Reassign type to use specific component
        if (type === this.FrCallbackType.TextOutputCallback || type === this.FrCallbackType.MetadataCallback) {
          const isWebAuthnStep = FRWebAuthn.getWebAuthnStepType(this.step) !== WebAuthnStepType.None;
          const isRecoveryCodeStep = FRRecoveryCodes.isDisplayStep(this.step);
          if (isWebAuthnStep) {
            // dont call the sdk twice on the same webAuthn step
            const onlyOneWebAuthn = !existsInComponentList(this.FrCallbackType.WebAuthnComponent);
            if (onlyOneWebAuthn) {
              type = this.FrCallbackType.WebAuthnComponent;
            } else {
              return;
            }
          } else if (isRecoveryCodeStep) {
            type = this.FrCallbackType.RecoveryCodesComponent;
          }
        }

        // Check HiddenValueCallback input value is pushChallengeNumber for PushChallengeNumber display
        if (type === this.FrCallbackType.HiddenValueCallback && callback.getInputValue() === 'pushChallengeNumber') {
          type = this.FrCallbackType.PushChallengeNumber;
        }

        // IAM-2936 MetadataCallback is not a callback that is displayed
        if (type === this.FrCallbackType.MetadataCallback) return;

        // Only components that need extra props or events
        const { callbackSpecificProps = {}, listeners = [] } = this.getComponentPropsAndEvents(type, index, componentList, clonedStage, this.step, this.realm);
        const component = {
          callback,
          callbackSpecificProps,
          index,
          isRequired,
          // if the app isn't loading update existing component props
          key: this.loading ? keyFromDate += 1 : this.componentList[i].key,
          listeners: this.getListeners({ callback, index }, listeners),
          type: this.$options.components[`Fr${type}`]
            ? `Fr${type}`
            : 'FrField',
        };

        if (component.type === 'FrField' || component.type === 'FrPasswordCallback') {
          const policyRequirements = callback.getOutputByName('policies')?.policyRequirements || [];
          const {
            defaultText, fieldType, label, name, value,
          } = this.getField(callback, index);
          const fieldDataType = this.getAlternateFieldType(policyRequirements) || fieldType;
          const errors = this.getTranslatedPolicyFailures(callback);

          component.callbackSpecificProps = {
            errors,
            label,
            name,
            type: fieldDataType,
            value: value || defaultText,
            autocomplete: getAutocompleteValue(label),
            validationImmediate: !!errors.length,
          };
          if (policyRequirements.includes('VALID_ENUM_VALUE')) {
            const policyDetails = callback.getOutputByName('policies')?.policies?.find((policy) => policy.policyId === 'valid-enum-value');
            component.callbackSpecificProps.options = policyDetails?.params.enum || [];
          }
          component.listeners = this.getListeners({ callback, index }, ['input']);
        }

        const hideNextButtonCallbacks = [
          this.FrCallbackType.ConfirmationCallback,
          this.FrCallbackType.DeviceProfileCallback,
          this.FrCallbackType.PollingWaitCallback,
          'PingOneProtectCallback',
          this.FrCallbackType.RecoveryCodesComponent,
          this.FrCallbackType.SuspendedTextOutputCallback,
          this.FrCallbackType.WebAuthnComponent,
        ];
        this.nextButtonVisible = hideNextButtonCallbacks.indexOf(type) > -1 ? false : this.nextButtonVisible;

        componentList.push(component);
      });

      const idpComponentIndex = componentList.findIndex((component) => component.callback.getType() === this.FrCallbackType.SelectIdPCallback);
      // Note: if there is an idp component in the componentList
      if (idpComponentIndex !== -1) {
        this.handleIdpComponent(componentList, idpComponentIndex);
      } else {
        this.idpComponent = undefined;
      }

      this.componentList = componentList;

      this.setRememberedUsername();
    },
    handleIdpComponent(componentList, idpComponentIndex) {
      if (!Array.isArray(componentList)) return;

      this.idpComponent = componentList[idpComponentIndex]; // Note: this is to be rendered in its own fieldset
      componentList.splice(idpComponentIndex, 1); // Note: we first remove the idp from the component list so the rest of the login components can be rendered on their own
    },
    // needs to happen before other query params are processed
    checkNewSession() {
      return new Promise((resolve) => {
        // need to logout if query param is present and equal to newsession
        if (new URLSearchParams(getCurrentQueryString()).get('arg') === 'newsession') {
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
      } else if (stage?.themeId) {
        this.nodeThemeId = stage.themeId;
      }
    },
    /**
     * Reads query parameters to determine if a tree is being resumed from a suspend or redirect and acts appropriately.
     * Also sets the page title from the URL and clears up and transforms query parameters.
     * The presence of the "suspendedId" query parameter indicates we're restarting a tree that has been suspended.
     * Presence of a reentry cookie (and some known query params) indicates we're resuming after a redirect.
     */
    evaluateUrlParams() {
      const paramString = getCurrentQueryString();
      const params = new URLSearchParams(paramString);
      const realm = params.get('realm') || '/';

      this.setPageTitle(window.location.hash, params);

      if (params.has('realm')) params.delete('realm');
      // arg query parameter handled in checkNewSession method
      if (params.get('arg') === 'newsession') params.delete('arg');
      if (resumingSuspendedTree(this.$route.name, params)) {
        // setting params in vue data then deleting to remove redundant params from URL
        // only set treeId if the authIndexType is 'service'
        this.treeId = params.get('authIndexType') === 'service' ? params.get('authIndexValue') : undefined;
        params.delete('authIndexValue');
        params.delete('authIndexType');
        this.suspendedId = params.get('suspendedId');
        params.delete('suspendedId');
      } else if (resumingTreeFollowingRedirect(params)) {
        // We can assume the tree id in the URL is always valid
        // only set treeId if the authIndexType is 'service'
        this.treeId = params.get('authIndexType') === 'service' ? params.get('authIndexValue') : undefined;

        // Load tree data to resume the journey, clearing down resumption data
        const { realmAtRedirect, step } = getResumeDataFromStorageAndClear();

        this.step = new FRStep(step.payload);
        this.realm = realmAtRedirect || realm; // IAM-4533 - use the realm from before the redirect
        // Tree resumption parameters should generally only be supplied once, so we remove them from the query string after storing them in memory (see IAM-492)
        this.treeResumptionParameters = {
          state: params.has('state') ? params.get('state') : undefined,
          code: params.has('code') ? params.get('code') : undefined,
          scope: params.has('scope') ? params.get('scope') : undefined,
          form_post_entry: params.has('form_post_entry') ? params.get('form_post_entry') : undefined,
          responsekey: params.has('responsekey') ? params.get('responsekey') : undefined,
        };
        params.delete('state');
        params.delete('code');
        params.delete('scope');
        params.delete('form_post_entry');
        params.delete('responsekey');
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
      }

      // Once the URL params and state have been updated, update the URL to have just the parameters we want going forwards
      replaceUrlParams(this.realm, params);
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
          // listen on body.appendchild and append to #body-append-el instead
          this.mutationObserver = new MutationObserver((records) => {
            const nodeList = records[records.length - 1].addedNodes || [];

            // Don't alter the position where any recaptcha nodes are added to the UI
            if (!doNewNodesContainRecaptchaV2(nodeList)) {
              Array.prototype.forEach.call(nodeList, (node) => {
                document.getElementById('body-append-el').appendChild(node);
              });
              this.mutationObserver.disconnect();
            }
          });
          this.mutationObserver.observe(document.body, { childList: true });
          // only hide next button if we know it should be hidden (webAuthn, deviceId)
          if (this.backendScriptsIdsContains('clientScriptOutputData', this.step)) {
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
        'update-auth-id': (authId) => {
          this.step.payload.authId = authId;
        },
        'update-screen-reader-message': (messageType, message) => {
          this.screenReaderMessageType = messageType;
          this.screenReaderMessage = message;
        },
        // event emitted from FrField
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
    getPageNodeFooter() {
      try {
        return this.stage && this.$sanitize(this.getLocalizedString(this.stage.pageFooter, i18n.global.locale, i18n.global.fallbackLocale));
      } catch (e) {
        return null;
      }
    },
    getStepParams() {
      const paramString = getCurrentQueryString();
      const paramsObj = parseParameters(paramString);
      if (paramsObj.authIndexValue) {
        paramsObj.authIndexValue = decodeURI(paramsObj.authIndexValue);
      }
      const stepParams = {
        query: paramsObj, // add all params in the route to step query params by default e.g. "noSession"
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

      // decode goTo and goToOnFail params and add ti step query params in any case
      stepParams.query.goto = (paramsObj.goto) ? decodeURIComponent(paramsObj.goto) : undefined;
      stepParams.query.gotoOnFail = (paramsObj.gotoOnFail) ? decodeURIComponent(paramsObj.gotoOnFail) : undefined;
      // add the "suspendId" for email redirects or "code", "state" and "scope" in other case to step query params
      if (this.suspendedId) {
        stepParams.query.suspendedId = this.suspendedId;
      } else if (this.treeResumptionParameters) {
        stepParams.query = { ...stepParams.query, ...this.treeResumptionParameters };
      }

      // stepParams.query.realm never needs to be included. We are already sending stepParams.realmPath which is what the
      // sdk uses to build the authenticate url ('/am/json/realms/root/realms/alpha/authenticate').
      // When realm is included ('/am/json/realms/root/realms/alpha/authenticate?realm=/alpha') this can confuse
      // some parts of am like SAML (see FRAAS-6573).
      delete stepParams.query.realm;

      return stepParams;
    },
    /**
     * @description Performs DOM and URL actions necessary to execute a redirect based on the passed callback.
     * Stores step information for resuming the tree if needed.
     * @param {Object} redirectCallback the redirect callback that informs how and where to redirect the user
     */
    handleRedirectCallback(redirectCallback) {
      const redirectUrl = redirectCallback.getOutputByName('redirectUrl');
      const redirectByPost = redirectCallback.getOutputByName('redirectMethod') === 'POST';
      const expectToReturnFromRedirect = redirectCallback.getOutputByName('trackingCookie');

      if (expectToReturnFromRedirect) {
        // Save current step information for later resumption of tree.
        addTreeResumeDataToStorage(this.step, this.realm);
      }

      if (redirectByPost) {
        // Build and submit a post form that submits the passed redirect data
        const redirectData = redirectCallback.getOutputByName('redirectData');
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
        // Plain redirect
        window.location.href = redirectUrl;
      }
    },
    /**
     * @description Returns boolean true if payload has session timeout error code
     * @param {Object} payload - step payload data
     * @param {Boolean} suspendedIdWasSet - Whether suspendId was set upon navigation to this step
     * @returns {Boolean}
     */
    isSessionTimedOut(payload, suspendedIdWasSet) {
      return (
        (payload.detail && payload.detail.errorCode === '110')
        || (suspendedIdWasSet && payload.code.toString() === '401')
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

      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
      }

      this.decideToRememberUsername();

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
          const previousStep = this.step;
          this.isFirstStep = !previousStep;

          // Check if web storage exists before trying to use it - see IAM-1873
          if (this.$store.state.SharedStore.webStorageAvailable) {
            const realmAndTreeInitialStep = JSON.parse(sessionStorage.getItem('initialStep')) || '';
            const realmAndTreeKey = `${stepParams.realmPath}/${stepParams.tree || ''}`;
            if (realmAndTreeInitialStep && realmAndTreeInitialStep.key === realmAndTreeKey) {
              initialStep = new FRStep(realmAndTreeInitialStep.step.payload);
            }
            if (this.isFirstStep && step.type !== 'LoginFailure') {
              sessionStorage.setItem('initialStep', JSON.stringify(
                {
                  key: realmAndTreeKey,
                  step,
                },
              ));
            }
          }
          this.step = step;

          // Tree resumption parameters should generally only be supplied once, so we remove them from memory after we've sent them to the SDK (see IAM-492)
          if (this.treeResumptionParameters) {
            this.treeResumptionParameters = undefined;
          }

          // At this point we have used suspendedId if it was set so we can remove it so it
          // is not used in further auth steps, and we only need to remember that it WAS set.
          let suspendedIdWasSet = false;
          if (this.suspendedId) {
            this.suspendedId = null;
            suspendedIdWasSet = true;
          }

          switch (step.type) {
            case 'LoginSuccess':
              this.checkAndNotifyPromotionParentOfLoginSuccess();
              // Check if web storage exists before trying to use it - see IAM-1873
              if (this.$store.state.SharedStore.webStorageAvailable) {
                sessionStorage.removeItem('initialStep');
              }
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
              if (this.retry && this.isSessionTimedOut(step.payload, suspendedIdWasSet)) {
                this.retry = false;
                this.loginFailure = true;
                this.retryWithNewAuthId(previousStep, stepParams);
              } else if (suspendedIdWasSet && this.isSessionTimedOut(step.payload, suspendedIdWasSet)) {
                this.errorMessage = step.payload.message || this.$t('login.loginFailure');
                this.linkToTreeStart = this.getLinkToTreeStart(stepParams);
                this.loading = false;
                this.loginFailure = true;
              } else {
                this.redirectToFailure(step).then(() => {
                  this.errorMessage = step.payload.message || this.$t('login.loginFailure');
                  this.step = initialStep;
                  this.retry = true;
                  if (this.step && this.step.callbacks) {
                    this.componentList = [];
                    this.buildTreeForm();
                  }
                  if (this.step?.payload && this.allowListingsEnabled(this.step.payload.authId)) {
                    this.getNewAuthId(stepParams).then((authId) => {
                      this.step.payload.authId = authId;
                      this.loading = false;
                      this.loginFailure = true;
                    });
                  } else {
                    this.loading = false;
                    this.loginFailure = true;
                  }
                });
              }
              this.isFirstStep = true;
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
        },
        () => {
          this.$emit('component-ready', 'error');
          this.errorMessage = this.$t('login.issueConnecting');
          this.redirectToFailure(this.step);
          this.loading = false;
        }).finally(() => {
          this.$emit('set-theme', this.realm, this.treeId, this.nodeThemeId);
        });
    },
    /**
     * Determine if there is a gotoOnFail parameter. If it exists, verify and redirect to that url or hash
     * Redirect to failureUrl when it exists, and display login failure message if not
     *
     * @param {Object} step - callback metadata containing url of failure
     *
     * @returns {Promise}
     */
    redirectToFailure(step) {
      const urlParams = new URLSearchParams(window.location.search);
      const gotoOnFail = urlParams.get('gotoOnFail');

      return new Promise((resolve) => {
        if (gotoOnFail) {
          this.verifyGotoUrlAndRedirect(gotoOnFail, this.realm, false, true)
            .then((res) => {
              if (res && res.length) {
                window.location.href = encodeURI(res);
              } else if (has(step, 'payload.detail.failureUrl') && step.payload.detail.failureUrl.length) {
                window.location.href = step.payload.detail.failureUrl;
              } else {
                resolve();
              }
            })
            .catch((error) => {
              this.showErrorMessage(error, this.$t('login.verifyUrlError'));
              resolve();
            });
        } else if (has(step, 'payload.detail.failureUrl') && step.payload.detail.failureUrl.length) {
          window.location.href = step.payload.detail.failureUrl;
        } else {
          resolve();
        }
      });
    },
    /**
    * AllowListings is a AM auth tree setting that can be enabled. When it is
    * enabled an extra whitelist-state parameter is sent in the authId of every
    * Authentication request to AM. This function determines whether that
    * setting is enabled or not.
    * @param {String} authId - the authId to test for AllowListings
    * @returns {Boolean} - whether AllowListings is enabled or not
    */
    allowListingsEnabled(authId) {
      return !!this.decodeJwt(authId)['whitelist-state'];
    },
    /**
    * Get a new authId by calling the SDK's FRAuth.next function with no step.
    * @param {Object} stepParams - step params
    * @returns {String} the new auth id
    */
    getNewAuthId(stepParams) {
      return FRAuth.next(undefined, stepParams)
        .then((step) => step.payload.authId);
    },
    /**
     * Retry a previously failed step with a new authId. this.nextStep is
     * called with the previously failed step and the new authId
     *
     * @param {Object} previousStep - previous step data with prototype intact
     * @param {Object} stepParams - step params
     *
     */
    retryWithNewAuthId(previousStep, stepParams) {
      this.getNewAuthId(stepParams)
        .then((authId) => {
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
     * @param {URLSearchParams} params - params.get(string)
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
    /**
     * Sends a postMessage to the parent window notifying of login success if this window has been opened
     * by the promotion ingress environment in the promotion hierarchy.
     *
     * @event postMessage
     */
    checkAndNotifyPromotionParentOfLoginSuccess() {
      // Check if web storage exists before trying to use it - see IAM-1873
      if (this.$store.state.SharedStore.webStorageAvailable) {
        if (sessionStorage.getItem('parentIsPromotionIngressEnvironment') === 'true') {
          window.opener.postMessage('loginSuccess', this.$store.state.SharedStore.fraasPromotionIngressUrl);
        }
      }
    },
    /**
     * Gets an alternate field type based on policy requirements
     *
     * @param {Array} policyRequirements
     * @returns {String} - dataType string
     */
    getAlternateFieldType(policyRequirements) {
      let dataType = '';
      // Check policyRequirements for date policies and set dataType accordingly
      if (policyRequirements.includes('VALID_DATE_TIME_FORMAT')) {
        dataType = 'datetime';
      } else if (policyRequirements.includes('VALID_DATE') || policyRequirements.includes('VALID_DATE_FORMAT')) {
        dataType = 'date';
      } else if (policyRequirements.includes('VALID_TIME_FORMAT')) {
        dataType = 'time';
      } else if (policyRequirements.includes('VALID_ENUM_VALUE')) {
        dataType = 'select';
      }
      return dataType;
    },
    /**
     * Decides whether to save the value of a username field to localStorage
     * based on the value of the rememberMe checkbox and whether the current step
     * includes a username field
     *
     * @returns {String} username
     */
    decideToRememberUsername() {
      if (this.$store.state.SharedStore.webStorageAvailable) {
        if (this.rememberMeValue && this.step.getCallbacksOfType(this.FrCallbackType.NameCallback).length) {
          const usernameValue = this.step
            .getCallbacksOfType(this.FrCallbackType.NameCallback)[0]
            .getInputValue();
          localStorage.setItem('frUsername', usernameValue);
        } else if (this.rememberMeVisible && this.rememberMeValue === false) {
          localStorage.removeItem('frUsername');
        }
      }
    },
    /**
     * Gets a username that has been stored in localStorage and returns it if
     * it exists, returns null if it does not
     *
     * @returns {String} username
     */
    getRememberedUsernameIfExists() {
      let username = null;
      if (this.$store.state.SharedStore.webStorageAvailable) {
        username = localStorage.getItem('frUsername');
        // If username exists in local storage, set the checkbox value to true
        if (username) {
          this.rememberMeValue = true;
        }
      }
      return username;
    },
    /**
     * Sets a remembered username in the username field of the current auth step
     * and shows the rememberMe checkbox
     *
     */
    setRememberedUsername() {
      const hasNameCallback = this.componentList.find((component) => component.callback.getType() === this.FrCallbackType.NameCallback);
      if (this.journeyRememberMeEnabled && hasNameCallback) {
        this.rememberMeVisible = true;
        const remembered = this.getRememberedUsernameIfExists();
        if (remembered) {
          this.componentList.find((component) => component.callback.getType() === this.FrCallbackType.NameCallback).callbackSpecificProps.value = remembered;
        }
      } else {
        this.rememberMeVisible = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#callbacksPanel :deep {
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

.card-footer {
  border: 0;
  padding: 0;
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

// The NVDA screen reader struggles to read elements with the 'hidden' attribute. This behaves the same but allows the screen reader to read out the legend.
.legend-hidden {
  position: absolute !important;
  height: 1px; width: 1px;
  overflow: hidden;
}
</style>
