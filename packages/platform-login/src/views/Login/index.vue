<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <FrCenterCard
    :hide-footer="true"
    :logo-path="logo"
    :show-logo="true">
    <template #center-card-header>
      <div v-if="!loading">
        <h2 class="h2">
          {{ header }}
        </h2>
        <p
          v-if="description"
          class="text-center mb-0"
          v-html="description" />
      </div>
    </template>

    <template #center-card-body>
      <BCardBody
        v-show="!loading"
        id="callbacksPanel">
        <FrAlert
          :show="loginFailure"
          :dismissible="false"
          variant="error"
          class="p-3 text-left">
          {{ errorMessage }}
        </FrAlert>
        <div id="body-append-el">
          <!-- for backend scripts -->
          <form
            id="wrapper"
            v-if="showScriptElms"
          >
            <!-- needed for GetAuthenticationApp, RecoveryCodeDisplay-->
            <div id="callback_0" />
            <div>
              <fieldset />
            </div>
            <input
              id="loginButton_0"
              role="button"
              type="submit"
              @click.prevent="backendScriptsHandler"
              hidden>
          </form>
        </div>
        <form>
          <template
            v-for="(component) in componentList ">
            <Component
              class="callback-component"
              :callback="component.callback"
              :field="component.field"
              :index="component.index"
              :step="component.step"
              :is="component.type"
              :key="component.key"
              v-bind="{...component.callbackSpecificProps}"
              v-on="{
                'next-step': (event, preventClear) => {
                  nextStep(event, preventClear);
                },
                ...component.listeners}"
            />
          </template>
          <BButton
            v-show="nextButtonVisible"
            class="btn-block mt-3"
            type="submit"
            variant="primary"
            :disabled="nextButtonDisabled"
            @click="nextStep">
            {{ buttonText }}
          </BButton>
        </form>
      </BCardBody>
      <BCardBody v-show="loading">
        <div class="h-100 d-flex">
          <div class="fr-center-card">
            <Spinner class="mb-4" />
          </div>
        </div>
      </BCardBody>
    </template>
  </FrCenterCard>
</template>

<script>
import {
  cloneDeep,
  each,
  find,
  has,
  noop,
} from 'lodash';
import {
  BButton,
  BCardBody,
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
    BRow,
    FrAlert,
    FrCenterCard,
    Spinner,
    FrBooleanAttributeInputCallback: () => import('@/components/callbacks/BooleanAttributeInputCallback'),
    FrChoiceCallback: () => import('@/components/callbacks/ChoiceCallback'),
    FrConfirmationCallback: () => import('@/components/callbacks/ConfirmationCallback'),
    FrConsentContainer: () => import('@/components/callbacks/ConsentMappingCallback'),
    FrDeviceProfileCallback: () => import('@/components/callbacks/DeviceProfileCallback'),
    FrField: () => import('@forgerock/platform-shared/src/components/Field'),
    FrHiddenValueCallback: () => import('@/components/callbacks/HiddenValueCallback'),
    FrKbaCreateCallback: () => import('@/components/callbacks/KbaCreateCallback'),
    FrPollingWaitCallback: () => import('@/components/callbacks/PollingWaitCallback'),
    FrReCaptchaCallback: () => import('@/components/callbacks/ReCaptchaCallback'),
    FrSelectIdPCallback: () => import('@/components/callbacks/SelectIdPCallback'),
    FrSuspendedTextOutputCallback: () => import('@/components/callbacks/SuspendedTextOutputCallback'),
    FrTermsAndConditionsCallback: () => import('@/components/callbacks/TermsAndConditionsCallback'),
    FrTextOutputCallback: () => import('@/components/callbacks/TextOutputCallback'),
    FrWebAuthnComponent: () => import('@/components/display/WebAuthn'),
    FrRecoveryCodesComponent: () => import('@/components/display/RecoveryCodes'),
  },
  props: {
    logo: {
      type: String,
      default: '',
    },
    buttonText: {
      type: String,
      default() {
        return this.$t('login.next');
      },
    },
  },
  mixins: [
    NotificationMixin,
    RestMixin,
    LoginMixin,
  ],
  data() {
    return {
      authIndexValue: undefined,
      componentList: [],
      description: '',
      errorMessage: '',
      header: '',
      hideRealm: false,
      initalStep: undefined,
      loading: true,
      loginFailure: false,
      nextButtonDisabled: false,
      nextButtonVisible: false,
      realm: '/',
      retry: undefined,
      showScriptElms: false,
      step: undefined,
      suspendedId: undefined,
    };
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.realm = urlParams.get('realm') || '/';

    this.getConfigurationInfo(this.realm)
      .then(this.setRealm)
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
     */
    backendScriptsHandler() {
      const type = this.backendScriptsIdentifier();
      const input = document.getElementById(type);
      if (input) {
        const hiddenCallback = this.step
          .getCallbacksOfType(FrCallbackType.HiddenValueCallback)
          .find((x) => x.getOutputByName('id', '') === type);
        hiddenCallback.setInputValue(input.value);
      }
      this.nextStep();
    },
    /**
     * @description identifies the script type by looking for a hidden callback
     * and matching it with known type. Different script types can be handled differently
     */
    backendScriptsIdentifier() {
      const legacyTypes = [
        'clientScriptOutputData',
      ];
      let type = '';
      this.step.getCallbacksOfType(FrCallbackType.HiddenValueCallback)
        .forEach((callback) => legacyTypes.forEach((legacyType) => {
          if (callback.getOutputByName('id', '') === legacyType) {
            type = legacyType;
          }
        }));
      return type;
    },

    /**
     * @description gets field information
     * @param {Object} callback specific step callback
     * @param {Object} index callback index
     * @returns {Object} field object needed for Field component
     */

    getField(callback, index) {
      const type = callback.getType();
      const fieldType = type === FrCallbackType.PasswordCallback || type === FrCallbackType.ValidatedCreatePasswordCallback ? 'password' : 'string';

      let prompt = '';
      if (callback.getPrompt) {
        prompt = callback.getPrompt();
      } else if (callback.getOutputByName) {
        try {
          prompt = callback.getOutputByName('prompt').value;
        } catch (e) {
          noop();
        }
      }
      return {
        title: prompt,
        type: fieldType,
        key: `callback_${index}`,
        value: callback.getInputValue(),
      };
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
     * @description Used to get listeners for callback components
     * @param {Object} properties object of any properties needed to have listners context
     * @param {Array} listenerArray array of string names to populate component listners
     * @returns {Object} returns object populated with specified listener functions
     */

    getListeners({ callback }, listenerArray = []) {
      const listeners = {
        'did-consent': (consent) => {
          this.step.callbacks.forEach((callbackItem) => { callbackItem.setInputValue(consent); });
        },
        'disable-next-button': (bool) => {
          this.nextButtonDisabled = bool;
        },
        'has-scripts': () => {
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
          const knownType = this.backendScriptsIdentifier();
          if (knownType) {
            this.nextButtonVisible = false;
          }
        },
        'hide-next-button': (bool) => {
          this.nextButtonVisible = !bool;
        },
        // event emited as camelcase from FrField
        valueChange: (value) => {
          if (callback && callback.setInputValue) {
            callback.setInputValue(value);
          }
        },
      };
      return listenerArray.reduce((acc, listener) => ({ ...acc, [listener]: listeners[listener] }), {});
    },

    getStepParams() {
      const stepParams = {
        query: {},
        tree: this.authIndexValue || this.$route.params.tree || undefined,
        realmPath: this.realm,
      };
      // remove tree from stepParams when undefined
      if (stepParams.tree === undefined || stepParams.tree === 'undefined') {
        delete stepParams.tree;
      }

      if (this.suspendedId) {
        stepParams.query.suspendedId = this.suspendedId;
      } else {
        const paramString = this.getCurrentQueryString();
        const paramsObj = this.parseParameters(paramString);

        stepParams.query = paramsObj;
        stepParams.query.code = this.code ? this.code : undefined;
        stepParams.query.state = this.state ? this.state : undefined;
        stepParams.query.scope = this.scope ? this.scope : undefined;
        stepParams.query.goto = (paramsObj.goto) ? decodeURIComponent(paramsObj.goto) : undefined;
        stepParams.query.gotoOnFail = (paramsObj.gotoOnFail) ? decodeURIComponent(paramsObj.gotoOnFail) : undefined;
      }
      return stepParams;
    },
    /**
     * @description Gets callbacks needed for authentication when this.step is undefined, and submits callback values when
     * this.step is defined. Then determines based on step.type what action to take.
     */
    nextStep(event, preventClear) {
      if (event) {
        event.preventDefault();
      }
      // for when no change is expected between steps (stops a flash of white)
      if (!preventClear) {
        this.loading = true;
        this.showScriptElms = false;
      }
      this.loginFailure = false;

      const stepParams = this.getStepParams();
      FRAuth.next(this.step, stepParams)
        .then((step) => {
          if (!this.initalStep) {
            this.initalStep = cloneDeep(step);
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
            if (this.retry) {
              this.retry = false;
              this.retryWithNewAuthId(previousStep, stepParams);
            } else {
              this.errorMessage = step.payload.message || this.$t('login.loginFailure');
              this.redirectToFailure(step);
              this.step = cloneDeep(this.initalStep);
              this.retry = true;
              if (this.step.callbacks) {
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
            // setup the form based on callback info/values obtained from this.step
            this.buildTreeForm();
            this.loading = false;
            break;
          }
        },
        () => {
          this.errorMessage = this.$t('login.issueConnecting');
          this.redirectToFailure(this.step);
          this.loading = false;
        });
    },
    buildTreeForm() {
      this.header = this.step.getHeader() || '';
      this.description = this.step.getDescription() || '';
      this.nextButtonVisible = true;

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
      this.step.callbacks.forEach((callback, index) => {
        const existsInComponentList = (type) => find(componentList, (component) => component.type === `Fr${type}`);
        let type = callback.getType();

        if (type === FrCallbackType.RedirectCallback) {
          this.nextButtonVisible = false;
          if (callback.getOutputByName('trackingCookie')) {
            // save current step information for later resumption of tree.
            sessionStorage.setItem('authIndexValue', this.authIndexValue || this.$route.params.tree);
            sessionStorage.setItem('step', JSON.stringify(this.step));
            sessionStorage.setItem('realm', this.realm);
          }
          window.location.href = callback.getOutputByName('redirectUrl');
          return;
        }

        // Use SDK to handle backend scripts that SDK can parse
        // Reasign type to use specific component
        if (type === FrCallbackType.TextOutputCallback || type === FrCallbackType.MetadataCallback) {
          const isWebAuthnStep = FRWebAuthn.getWebAuthnStepType(this.step) !== WebAuthnStepType.None;
          const isRecovertCodeStep = FRRecoveryCodes.isDisplayStep(this.step);
          if (isWebAuthnStep) {
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
        const componentPropsAndEvents = {
          ConfirmationCallback: {
            callbackSpecificProps: { variant: existsInComponentList(FrCallbackType.WebAuthnComponent) ? 'link' : 'primary' },
          },
          ConsentMappingCallback: {
            callbackSpecificProps: { callbacks: this.step.callbacks },
            listeners: ['disable-next-button', 'did-consent'],
          },
          KbaCreateCallback: {
            callbackSpecificProps: { showHeader: !existsInComponentList(FrCallbackType.KbaCreateCallback) },
            listeners: ['disable-next-button'],
          },
          SelectIdPCallback: {
            callbackSpecificProps: { isOnlyCallback: this.step.callbacks.length === 1 },
            listeners: ['hide-next-button', 'disable-next-button'],
          },
          TextOutputCallback: {
            listeners: ['has-scripts'],
          },
        };

        const component = {
          callback,
          callbackSpecificProps: componentPropsAndEvents[type] && componentPropsAndEvents[type].callbackSpecificProps
            ? componentPropsAndEvents[type].callbackSpecificProps
            : {},
          index,
          key: keyFromDate += 1,
          listeners: this.getListeners({ callback }, componentPropsAndEvents[type] && componentPropsAndEvents[type].listeners
            ? componentPropsAndEvents[type].listeners
            : []),
          type: this.$options.components[`Fr${type}`]
            ? `Fr${type}`
            : 'FrField',
          step: this.step,
        };

        if (component.type === 'FrField') {
          component.callbackSpecificProps.failedPolicies = this.getTranslatePolicyFailures(callback);
          component.field = this.getField(callback, index);
          component.listeners = this.getListeners({ callback }, ['valueChange']);
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
              window.location.href = res;
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
    /**
     * @description If session storage has step information, extract it and clear session storage
     * @returns {Object} two properties needed to resume tree: step and authIndex value
     */
    getStepFromStorage() {
      const step = sessionStorage.getItem('step');
      const authIndexValue = sessionStorage.getItem('authIndexValue');
      const realm = sessionStorage.getItem('realm');
      if (step !== null && authIndexValue !== null && realm !== null) {
        sessionStorage.clear();
        return { step: JSON.parse(step), authIndexValue, realm };
      }
      return { step: undefined, authIndexValue: undefined, realm: undefined };
    },
    removeUrlParams() {
      // remove query params from the url
      window.history.replaceState(null, null, window.location.pathname);
      // if a tree is defined reset the hash to the proper tree
      if (this.authIndexValue) {
        window.location.hash = `service/${this.authIndexValue}`;
      }
    },
    setRealm(config) {
      const amContext = process.env.VUE_APP_AM_URL;
      const dnsContext = `${window.location.origin}/am`;
      // using DNS - need to keep realm obscured
      if (amContext !== dnsContext) {
        this.hideRealm = true;
      }
      this.realm = config ? config.data.realm : '/';
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
    /**
     * @description Look at the url and see if we are returning to a tree from an Email Suspend Node or Redirect Callback.
     * Must be default route and contain the strings "suspendedId=" and "authIndexValue=" for Email Suspend Node.
     * Must contain the strings "state=" and "code=" and "scope=" for redirect callback.
     */
    evaluateUrlParams() {
      const paramString = this.getCurrentQueryString();
      const params = new URLSearchParams(paramString);
      const realm = params.get('realm') || '/';
      const hash = window.location.hash || '';

      if (realm) params.delete('realm');
      // arg query parameter handled in checkNewSession method
      if (params.get('arg') === 'newsession') params.delete('arg');
      if (this.$route.name === 'login' && paramString.includes('suspendedId=') && paramString.includes('authIndexValue=')) {
        this.authIndexValue = params.get('authIndexValue');
        this.suspendedId = params.get('suspendedId');

        this.removeUrlParams();
      } else if (paramString.includes('state=') || paramString.includes('code=') || paramString.includes('scope=')) {
        this.state = params.get('state');
        this.code = params.get('code');
        this.scope = params.get('scope');

        // session storage is used to resume a tree after returning from a redirect
        const stepInfo = this.getStepFromStorage();
        this.authIndexValue = stepInfo.authIndexValue;
        this.step = new FRStep(stepInfo.step.payload);
        this.realm = stepInfo.realm;

        this.removeUrlParams();
        window.history.replaceState(null, null, `?realm=${this.realm}`);
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

        const ampersand = params.toString().length > 1 ? '&' : '';
        const qMark = params.toString().length > 1 ? '?' : '';

        this.removeUrlParams();
        if (this.hideRealm) {
          window.history.replaceState(null, null, `${qMark}${params.toString()}${hash}`);
        } else {
          window.history.replaceState(null, null, `?realm=${this.realm}${ampersand}${params.toString()}${hash}`);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#callbacksPanel /deep/ {
  span.material-icons {
    line-height: 22px;
  }

  .callback-component:not(:last-of-type):not(.hidden) {
    margin-bottom: 1rem;
  }

  .hide-polling-spinner ~ .polling-spinner-container {
    display: none;
  }
}
</style>
