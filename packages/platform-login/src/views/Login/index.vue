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
    <template v-slot:center-card-header>
      <div v-if="!loading">
        <h2 class="h2">
          {{ header }}
        </h2>
        <p
          class="text-center mb-0"
          v-html="description" />
      </div>
    </template>

    <template v-slot:center-card-body>
      <BCardBody v-show="!loading">
        <div v-if="loginFailure">
          <div class="m-auto p-2 text-danger">
            <p>
              <i class="material-icons material-icons-outlined">
                error
              </i>
              {{ errorMessage }}
            </p>
          </div>
        </div>
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
          <div
            v-show="!showClone"
            id="callbacksPanel"
            ref="callbacksPanel" />
          <div
            v-show="showClone"
            id="callbacksPanelClone"
            ref="callbacksPanelClone" />
          <BButton
            v-show="showNextButton"
            class="btn-block mt-3"
            type="submit"
            variant="primary"
            ref="callbackSubmitButton"
            :disabled="disableNextButton"
            @click="nextStep">
            {{ $t('login.next') }}
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
  each,
  has,
  map,
  noop,
} from 'lodash';
import {
  BCardBody,
  BButton,
} from 'bootstrap-vue';
import {
  FRAuth,
  FRStep,
  FRWebAuthn,
  SessionManager,
  CallbackType,
} from '@forgerock/javascript-sdk';
import Vue from 'vue';
import FrCenterCard from '@forgerock/platform-shared/src/components/CenterCard';
import WithCallback from '@forgerock/platform-shared/src/hoc/CallbackHoc';
import FrField from '@forgerock/platform-shared/src/components/Field';
import Spinner from '@forgerock/platform-shared/src/components/Spinner';
import BooleanAttributeInputCallback from '@/components/callbacks/BooleanAttributeInputCallback';
import ChoiceCallback from '@/components/callbacks/ChoiceCallback';
import ConfirmationCallback from '@/components/callbacks/ConfirmationCallback';
import ConsentContainer from '@/components/callbacks/ConsentMappingCallback';
import DeviceProfileCallback from '@/components/callbacks/DeviceProfileCallback';
import KbaCreateCallback from '@/components/callbacks/KbaCreateCallback';
import HiddenValueCallback from '@/components/callbacks/HiddenValueCallback';
import ReCaptchaCallback from '@/components/callbacks/ReCaptchaCallback';
import PollingWaitCallback from '@/components/callbacks/PollingWaitCallback';
import SelectIdPCallback from '@/components/callbacks/SelectIdPCallback';
import TextOutputCallback from '@/components/callbacks/TextOutputCallback';
import SuspendedTextOutputCallback from '@/components/callbacks/SuspendedTextOutputCallback';
import TermsAndConditionsCallback from '@/components/callbacks/TermsAndConditionsCallback';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import i18n from '@/i18n';

export default {
  name: 'Login',
  components: {
    FrCenterCard,
    BButton,
    BCardBody,
    Spinner,
  },
  props: {
    logo: {
      type: String,
      default: '',
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
      callbacksPanelComponents: [],
      description: '',
      disableNextButton: false,
      errorMessage: '',
      header: '',
      hideRealm: false,
      kbaCallbackCount: 0,
      loading: true,
      loginFailure: false,
      realm: '/',
      retry: undefined,
      showClone: false,
      showNextButton: false,
      step: undefined,
      suspendedId: undefined,
      showScriptElms: false,
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
          .getCallbacksOfType(CallbackType.HiddenValueCallback)
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
        'webAuthnOutcome',
      ];
      let type = '';
      this.step.getCallbacksOfType(CallbackType.HiddenValueCallback)
        .forEach((callback) => legacyTypes.forEach((legacyType) => {
          if (callback.getOutputByName('id', '') === legacyType) {
            type = legacyType;
          }
        }));
      return type;
    },
    /**
     * @description Injects an instance of a specified component into the callbacksPanel
     * @param {Object} the component object to by added
     * @param {Object} properties used for rendering the component object
     */
    addComponent(component, propsData, listeners = []) {
      const ComponentClass = Vue.extend(component);
      const instance = new ComponentClass({
        propsData,
        i18n,
      });

      listeners.forEach((listener) => {
        instance.$on(listener.name, listener.callback);
      });

      instance.$mount();
      this.callbacksPanelComponents.push(instance.$el);
    },
    addField(type, callback, index) {
      const failedPolicies = callback.getFailedPolicies
        ? callback.getFailedPolicies()
        : [];

      let prompt = '';
      let translatedPolicyMessages = [];

      if (failedPolicies.length) {
        translatedPolicyMessages = this.translatePolicyFailures(failedPolicies);
      }

      if (callback.getPrompt) {
        prompt = callback.getPrompt();
      } else if (callback.getOutputByName) {
        try {
          prompt = callback.getOutputByName('prompt').value;
        } catch (e) {
          noop();
        }
      }
      const field = {
        title: prompt,
        type,
        key: `callback_${index}`,
        value: callback.getInputValue(),
      };

      return this.addComponent(WithCallback(FrField), {
        field,
        autofocus: index === 0,
        validator: noop,
        failedPolicies: translatedPolicyMessages,
        callback,
      });
    },
    /**
     * @description handles steps with metadata callbacks like webAuthn
     */
    metadataCallback(step) {
      const webAuthnStepType = FRWebAuthn.getWebAuthnStepType(step);
      if (webAuthnStepType === 0) {
        // Not a webAuthn step
        this.nextStep();
      } else if (webAuthnStepType === 1) {
        // Authenticate with a registered device
        this.showNextButton = false;
        FRWebAuthn.authenticate(step).then(() => {
          this.nextStep();
        });
      } else if (webAuthnStepType === 2) {
        // Register a new device
        this.showNextButton = false;
        FRWebAuthn.register(step).then(() => {
          this.nextStep();
        });
      }
    },
    translatePolicyFailures(failedPolicies) {
      return map(failedPolicies, (policy) => {
        const tempPolicy = JSON.parse(policy);

        return this.$t(`common.policyValidationMessages.${tempPolicy.policyRequirement}`, tempPolicy.params);
      });
    },
    getStepParams() {
      const stepParams = {
        query: {},
        tree: this.authIndexValue || this.$route.params.tree || undefined,
        realmPath: this.realm,
      };

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
      if (!preventClear) {
        this.clearCallbacks();
      }
      // if there is a login failure show the failure message and remove the session variable
      if (sessionStorage.getItem('loginFailure')) {
        this.loginFailure = true;
        this.errorMessage = this.$t('login.loginFailure');
        sessionStorage.removeItem('loginFailure');
      }

      const stepParams = this.getStepParams();
      FRAuth.next(this.step, stepParams).then(
        (step) => {
          const previousStep = this.step;
          this.loading = false;
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
              this.redirectToFailure(step);
            }
            break;
          default:
            // retry only when previous was undefined (first step)
            this.retry = !previousStep;
            // setup the form based on callback info/values obtained from this.step
            this.header = step.getHeader();
            this.description = step.getDescription();
            this.buildTreeForm();
            break;
          }
        },
        () => {
          this.errorMessage = this.$t('login.issueConnecting');
          this.redirectToFailure(this.step);
          this.loading = false;
        },
      );
    },
    clearCallbacks() {
      this.header = '';
      this.description = '';
      this.$refs.callbacksPanel.innerHTML = '';
      this.showNextButton = false;
      this.loginFailure = false;
      this.showScriptElms = false;
      this.loading = true;
    },
    buildTreeForm() {
      const firstInput = this.$el.querySelector('input');
      let pageRenderComplete;
      const pageRendered = new Promise((resolve) => { pageRenderComplete = resolve; });
      this.showNextButton = true;
      this.callbacksPanelComponents = [];

      // Ensure that Social Buttons appear at top of Page Node
      const pullToTop = 'SelectIdPCallback';
      this.step.callbacks.sort((currentCallback, otherCallback) => {
        if (currentCallback.payload.type === pullToTop) {
          return -1;
        }
        if (otherCallback.payload.type === pullToTop) {
          return 1;
        }
        return 0;
      });

      map(this.step.callbacks, (callback, index) => {
        const type = callback.getType();

        switch (type) {
        case 'BooleanAttributeInputCallback':
          this.addComponent(BooleanAttributeInputCallback, {
            callback,
            index,
          });
          break;
        case 'ChoiceCallback':
          this.addComponent(ChoiceCallback, {
            callback,
            index,
          });
          break;
        case 'ConfirmationCallback':
          this.showNextButton = false;
          this.addComponent(ConfirmationCallback, {
            callback,
            nextStep: this.nextStep,
          });
          break;
        case 'ConsentMappingCallback':
          if (index === 0) {
            const isRequired = this.step.callbacks[0].payload.output.find((item) => item.name === 'isRequired').value;
            this.disableNextButton = isRequired;
            this.addComponent(ConsentContainer,
              { callbacks: this.step.callbacks, isRequired },
              [
                {
                  name: 'canProceed',
                  callback: (checked) => {
                    this.disableNextButton = !checked;
                  },
                },
                {
                  name: 'didConsent',
                  callback: (didConsent) => {
                    this.step.callbacks.forEach((callbackItem) => { callbackItem.payload.input[0].value = didConsent; });
                  },
                },
              ]);
          }
          break;
        case 'DeviceProfileCallback':
          this.showNextButton = false;
          this.addComponent(DeviceProfileCallback, {
            callback,
            nextStep: this.nextStep,
          });
          break;
        case 'HiddenValueCallback':
          this.addComponent(HiddenValueCallback, {
            callback,
            index,
          });
          break;
        case 'KbaCreateCallback':
          this.addComponent(KbaCreateCallback, {
            callback,
            index,
            descriptionText: this.$t('login.kba.description'),
            customQuestonOptionText: this.$t('login.kba.custom'),
            requiredText: this.$t('common.policyValidationMessages.REQUIRED'),
            uniqueText: this.$t('common.policyValidationMessages.UNIQUE'),
            showHeader: this.kbaCallbackCount === 0,
            callbackSubmitButton: this.$refs.callbackSubmitButton,
          });

          this.kbaCallbackCount += 1;
          break;
        case 'MetadataCallback':
          // Do nothing here. If someone is using MetadataCallback they would need to inject their logic here to utilize result
          // const metadata = callback.getData();
          this.metadataCallback(this.step);
          break;
        case 'PasswordCallback':
          this.addField('password', callback, index);
          break;
        case 'PollingWaitCallback':
          this.showNextButton = false;
          this.addComponent(PollingWaitCallback, {
            callback,
            nextStep: this.nextStep,
          });
          break;
        case 'ReCaptchaCallback':
          this.addComponent(ReCaptchaCallback, {
            callback,
            index,
          });
          break;
        case 'RedirectCallback':
          this.showNextButton = false;
          if (callback.getOutputByName('trackingCookie')) {
            // save current step information for later resumption of tree.
            sessionStorage.setItem('authIndexValue', this.authIndexValue || this.$route.params.tree);
            sessionStorage.setItem('step', JSON.stringify(this.step));
            sessionStorage.setItem('realm', this.realm);
          }
          window.location.href = callback.getOutputByName('redirectUrl');
          break;
        case 'TermsAndConditionsCallback':
          this.addComponent(TermsAndConditionsCallback, {
            callback,
            index,
            termsAndConditionsText: this.$t('login.termsAndConditions'),
            agreeToTermsText: this.$t('login.agreeToTerms'),
          });
          break;
        case 'TextOutputCallback':
          this.addComponent(TextOutputCallback, { callback, pageRendered },
            [{
              name: 'hasScripts',
              callback: () => {
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
                  this.showNextButton = false;
                }
              },
            }]);
          break;
        case 'SuspendedTextOutputCallback':
          this.showNextButton = false;
          this.addComponent(SuspendedTextOutputCallback, { callback });
          break;
        case 'ValidatedCreatePasswordCallback':
          this.addField('password', callback, index);
          break;
        case 'SelectIdPCallback':
          callback.setInputValue('localAuthentication');
          this.addComponent(SelectIdPCallback, {
            callback,
            index,
            continueWithText: 'login.social.continueWith',
            orText: this.step.callbacks.length > 1 ? this.$t('login.social.or') : '',
            callbackSubmitButton: this.$refs.callbackSubmitButton,
          });
          break;
        default:
          this.addField('text', callback, index);
        }
      });

      // Makes and renders a temporary clone of the callbackPanel using vue
      // to prevent the flickering of the DOM caused by using non optimized
      // calls like appendChild
      // If there's no change in the DOM this prevents flickering
      this.$refs.callbacksPanelClone.innerHTML = this.$refs.callbacksPanel.innerHTML;
      this.showClone = true;
      this.$refs.callbacksPanel.innerHTML = '';
      this.callbacksPanelComponents.forEach((el) => {
        this.$refs.callbacksPanel.appendChild(el);
      });
      this.showClone = false;
      this.$refs.callbacksPanelClone.innerHTML = '';
      pageRenderComplete();

      if (firstInput) {
        // focus on the first input after render
        firstInput.focus();
      }
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
            this.loginFailure = true;
          })
          .catch((error) => {
            this.displayNotification('IDMMessages', 'error', error.response.data.message);
            this.loginFailure = true;
          });
      } else if (has(step, 'payload.detail.failureUrl') && step.payload.detail.failureUrl.length) {
        window.location.href = step.payload.detail.failureUrl;
      } else if (step === undefined) {
        // step will be undefined if there is an invalid realm
        this.loginFailure = true;
      } else {
        this.loading = true;
        sessionStorage.setItem('loginFailure', true);
        window.location.reload();
      }
    },
    reloadTree(event) {
      event.preventDefault();
      window.location.reload();
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
      // reset the hash to the proper tree
      window.location.hash = `service/${this.authIndexValue}`;
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
  br {
    display: none;
  }

  > div {
    margin-bottom: 1rem;
  }

  .hide-polling-spinner ~ .polling-spinner-container {
    display: none;
  }
}
</style>
