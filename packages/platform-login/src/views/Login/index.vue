<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <FrCenterCard :show-logo="true">
    <template v-slot:center-card-header>
      <div v-if="!loading && !loginFailure">
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
        <div
          v-if="loginFailure"
          class="h-100 d-flex">
          <div class="m-auto fr-center-card">
            <p>{{ errorMessage }}</p>
            <BButton
              variant="link"
              @click="reloadTree"
              href="#/">
              {{ $t('login.tryAgain') }}
            </BButton>
          </div>
        </div>
        <form
          v-else>
          <div
            v-show="!showClone"
            id="callbacksPanel"
            ref="callbacksPanel"
            @keyup.enter="nextStep" />
          <div
            v-show="showClone"
            id="callbacksPanelClone"
            ref="callbacksPanelClone" />
          <BButton
            v-show="showNextButton"
            class="btn-block btn-lg mt-3"
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
          <div class="m-auto fr-center-card">
            <BounceLoader
              class="mb-4"
              :color="loadingColor" />
          </div>
        </div>
      </BCardBody>
    </template>
  </FrCenterCard>
</template>

<script>
import {
  has,
  map,
  noop,
} from 'lodash';
import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min';
import {
  BCardBody,
  BButton,
} from 'bootstrap-vue';
import {
  FRAuth, FRStep, FRWebAuthn, Config,
} from '@forgerock/javascript-sdk';
import Vue from 'vue';
import FrCenterCard from '@/components/utils/CenterCard';
import WithCallback from '@forgerock/platform-shared/src/hoc/CallbackHoc';
import FrField from '@forgerock/platform-shared/src/components/Field';
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
import ValidatedCreatePasswordCallback from '@/components/callbacks/ValidatedCreatePasswordCallback';
import styles from '@/scss/main.scss';
import TermsAndConditionsCallback from '@/components/callbacks/TermsAndConditionsCallback';
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import i18n from '@/i18n';

export default {
  name: 'Login',
  components: {
    FrCenterCard,
    BButton,
    BCardBody,
    BounceLoader,
  },
  mixins: [
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
      kbaCallbackCount: 0,
      loading: true,
      loadingColor: styles.basecolor,
      loginFailure: false,
      showClone: false,
      showNextButton: false,
      step: undefined,
      suspendedId: undefined,
      realm: '/',
      params: {},
    };
  },
  mounted() {
    this.getConfigurationInfo()
      .then(this.setRealm)
      .then((realm) => {
        this.evaluateUrlParams();
        // configure FRAuth

        Config.set({
          serverConfig: { baseUrl: `${process.env.VUE_APP_AM_URL}/` },
          tree: this.authIndexValue || this.$route.params.tree || undefined,
          realmPath: realm,
        });

        this.nextStep();
      });
  },
  methods: {
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

      instance.$mount();

      listeners.forEach((listener) => {
        instance.$on(listener.name, listener.callback);
      });

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
      const stepParams = { query: {}, tree: this.authIndexValue || this.$route.params.tree || undefined };
      if (this.suspendedId) {
        stepParams.query.suspendedId = this.suspendedId;
      } else {
        stepParams.query.code = this.code ? this.code : undefined;
        stepParams.query.state = this.state ? this.state : undefined;
        stepParams.query.scope = this.scope ? this.scope : undefined;
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

      const stepParams = this.getStepParams();
      FRAuth.next(this.step, stepParams).then(
        (step) => {
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
                return this.verifyGotoUrlAndRedirect(step.getSuccessUrl(), isAdmin);
              })
              .then((res) => {
                window.location.href = res;
              })
              .catch(() => {
                // attempt to redirect user on failure
                this.verifyGotoUrlAndRedirect(step.getSuccessUrl(), false)
                  .then((res) => {
                    window.location.href = res;
                  });
              });
            break;
          case 'LoginFailure':
            this.errorMessage = this.$t('login.loginFailure');
            this.redirectToFailure(step);
            break;
          default:
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
      this.loading = true;

      // need to set validateOnly flag for some callbacks in order to be able to advance the tree
      if (this.step) {
        const pwCallbacks = this.step.getCallbacksOfType('ValidatedCreatePasswordCallback');
        if (pwCallbacks.length) {
          pwCallbacks.forEach((cb) => {
            cb.setInputValue(false, 1);
          });
        }
      }
    },
    buildTreeForm() {
      const firstInput = this.$el.querySelector('input');
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
            sessionStorage.authIndexValue = this.authIndexValue || this.$route.params.tree;
            sessionStorage.step = JSON.stringify(this.step);
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
          this.addComponent(TextOutputCallback, { callback });
          break;
        case 'SuspendedTextOutputCallback':
          this.showNextButton = false;
          this.addComponent(SuspendedTextOutputCallback, { callback });
          break;
        case 'ValidatedCreatePasswordCallback':
          if (!callback.getOutputByName('policies').policies) {
            this.addField('password', callback, index);
          } else {
            this.addComponent(ValidatedCreatePasswordCallback, { callback, step: this.step, auth: FRAuth });
          }
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

      if (firstInput) {
        // focus on the first input after render
        firstInput.focus();
      }
    },
    /**
     * Determine if there is a gotoOnFail parameter. if it exists - verify and redirect to that url or hash
     * Redirect to failureUrl when it exists, and displays login failure message if not
     *
     * @param {Object} step - callback metadata containing url of failure
     */
    redirectToFailure(step) {
      const urlParams = new URLSearchParams(window.location.search);
      const gotoOnFail = urlParams.get('gotoOnFail');
      this.verifyGotoUrlAndRedirect(gotoOnFail, false)
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
    },
    reloadTree(event) {
      event.preventDefault();
      window.location.reload();
    },
    /**
     * @description If session storage has step information, extract it and clear session storage
     * @returns {Object} two properties needed to resume tree: step and authIndex value
     */
    getStepFromStorage() {
      const step = sessionStorage.getItem('step');
      const authIndexValue = sessionStorage.getItem('authIndexValue');
      if (step !== null && authIndexValue !== null) {
        sessionStorage.clear();
        return { step: JSON.parse(step), authIndexValue };
      }
      return { step: undefined, authIndexValue: undefined };
    },
    removeUrlParams() {
      // remove query params from the url
      window.history.replaceState(null, null, window.location.pathname);
      // reset the hash to the proper tree
      window.location.hash = `service/${this.authIndexValue}`;
    },
    setRealm(config) {
      const urlParams = new URLSearchParams(window.location.search);
      let rlm = urlParams.get('realm') || 'root';

      if (config.data.realm && config.data.realm !== '/' && config.data.realm !== 'root') {
        rlm = config.data.realm;
      }

      return rlm;
    },
    /**
     * @description Look at the url and see if we are returning to a tree from an Email Suspend Node or Redirect Callback.
     * Must be default route and contain the strings "suspendedId=" and "authIndexValue=" for Email Suspend Node.
     * Must contain the strings "state=" and "code=" and "scope=" for redirect callback.
     */
    evaluateUrlParams() {
      const paramString = this.getCurrentQueryString();
      const params = new URLSearchParams(paramString);

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

        this.removeUrlParams();
      }
      this.params = params;
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
