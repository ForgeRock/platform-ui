<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrCenterCard :show-logo="true">
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
        <form>
          <div
            id="callbacksPanel"
            ref="callbacksPanel"
            @keyup.enter="nextStep" />
          <BButton
            v-show="showNextButton"
            class="btn btn btn-block btn-lg btn-primary mt-3"
            type="submit"
            variant="primary"
            ref="callbackSubmitButton"
            @click="nextStep">
            {{ $t('login.next') }}
          </BButton>
        </form>
        <div
          v-if="loginFailure"
          class="h-100 d-flex">
          <div class="m-auto fr-center-card">
            <p>{{ errorMessage }}</p>
            <a
              @click="reloadTree"
              href="#/">
              {{ $t('login.tryAgain') }}
            </a>
          </div>
        </div>
      </BCardBody>
      <BCardBody v-show="loading">
        <div class="h-100 d-flex">
          <div class="m-auto fr-center-card">
            <BounceLoader :color="loadingColor" />
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
  FRAuth, FRWebAuthn, Config,
} from '@forgerock/javascript-sdk';
import Vue from 'vue';
import WithCallback from '@forgerock/platform-shared/src/hoc/CallbackHoc';
import FrField from '@forgerock/platform-shared/src/components/Field';
import BooleanAttributeInputCallback from '@/components/callbacks/BooleanAttributeInputCallback';
import CenterCard from '@/components/utils/CenterCard';
import ChoiceCallback from '@/components/callbacks/ChoiceCallback';
import ConfirmationCallback from '@/components/callbacks/ConfirmationCallback';
import DeviceProfileCallback from '@/components/callbacks/DeviceProfileCallback';
import KbaCreateCallback from '@/components/callbacks/KbaCreateCallback';
import HiddenValueCallback from '@/components/callbacks/HiddenValueCallback';
import ReCaptchaCallback from '@/components/callbacks/ReCaptchaCallback';
import SelectIdPCallback from '@/components/callbacks/SelectIdPCallback';
import TextOutputCallback from '@/components/callbacks/TextOutputCallback';
import SuspendedTextOutputCallback from '@/components/callbacks/SuspendedTextOutputCallback';
import styles from '@/scss/main.scss';
import TermsAndConditionsCallback from '@/components/callbacks/TermsAndConditionsCallback';
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import i18n from '@/i18n';

export default {
  name: 'Login',
  components: {
    FrCenterCard: CenterCard,
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
      loading: true,
      loadingColor: styles.basecolor,
      header: '',
      description: '',
      loginFailure: false,
      step: undefined,
      kbaCallbackCount: 0,
      showNextButton: false,
      errorMessage: '',
      authIndexValue: undefined,
      suspendedId: undefined,
    };
  },
  mounted() {
    this.evaluateUrlParams();

    // configure FRAuth
    Config.set({
      serverConfig: { baseUrl: `${process.env.VUE_APP_AM_URL}/` },
      tree: this.authIndexValue || this.$route.params.tree || undefined,
    });

    this.nextStep();
  },
  methods: {
  /**
    * @description Injects an instance of a specified component into the callbacksPanel
    * @param {Object} the component object to by added
    * @param {Object} properties used for rendering the component object
    */
    addComponent(component, propsData) {
      const ComponentClass = Vue.extend(component);
      const instance = new ComponentClass({
        propsData,
        i18n,
      });

      instance.$mount();

      this.$refs.callbacksPanel.appendChild(instance.$el);
    },
    addField(type, callback, index) {
      const failedPolicies = (callback.getFailedPolicies) ? callback.getFailedPolicies() : [];
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
    /**
      * @description Gets callbacks needed for authentication when this.step is undefined, and submits callback values when
      * this.step is defined. Then determines based on step.type what action to take.
      */
    nextStep(event) {
      if (event) {
        event.preventDefault();
      }
      const stepParams = {};

      if (this.suspendedId) {
        stepParams.query = {
          suspendedId: this.suspendedId,
        };
      } else if (this.code && this.state && this.scope) {
        stepParams.query = {
          code: this.code,
          state: this.state,
          scope: this.scope,
        };
      }

      this.clearCallbacks();
      FRAuth.next(this.step, stepParams).then((step) => {
        this.loading = false;
        this.step = step;

        switch (step.type) {
        case 'LoginSuccess':
          // check for gotoURL
          this.verifyGotoUrlAndRedirect(step.getSuccessUrl());
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
      }, () => {
        this.errorMessage = this.$t('login.issueConnecting');
        this.redirectToFailure(this.step);
        this.loading = false;
      });
    },
    clearCallbacks() {
      this.header = '';
      this.description = '';
      this.$refs.callbacksPanel.innerHTML = '';
      this.showNextButton = false;
      this.loading = true;
    },
    buildTreeForm() {
      const firstInput = this.$el.querySelector('input');
      this.$refs.callbacksPanel.innerHTML = '';
      this.showNextButton = true;

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
          this.loading = true;
          setTimeout(() => {
            this.nextStep();
          }, callback.getWaitTime());
          break;
        case 'ReCaptchaCallback':
          this.addComponent(ReCaptchaCallback, {
            callback,
            index,
          });
          break;
        case 'RedirectCallback':
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
          this.addField('password', callback, index);
          break;
        case 'SelectIdPCallback':
          callback.setInputValue('localAuthentication');
          this.addComponent(SelectIdPCallback, {
            callback,
            index,
            continueWithText: this.$t('login.social.continueWith'),
            orText: this.$t('login.social.or'),
            callbackSubmitButton: this.$refs.callbackSubmitButton,
          });
          break;
        default:
          this.addField('text', callback, index);
        }
      });

      if (firstInput) {
        // focus on the first input after render
        firstInput.focus();
      }
    },
    /**
     * Redirect to failureUrl when it exists, and displays login failure message if not
     *
     * @param {Object} step - callback metadata containing url of failure
     */
    redirectToFailure(step) {
      if (has(step, 'payload.detail.failureUrl') && step.payload.detail.failureUrl.length) {
        window.location.href = step.payload.detail.failureUrl;
      }
      this.loginFailure = true;
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
    /**
     * @description Look at the url and see if we are returning to a tree from an Email Suspend Node or Redirect Callback.
     * Must be default route and contain the strings "suspendedId=" and "authIndexValue=" for Email Suspend Node.
     * Must contain the strings "state=" and "code=" and "scope=" for redirect callback.
     */
    evaluateUrlParams() {
      let fixUrl = false;

      if (this.$route.name === 'Login' && window.location.search.includes('suspendedId=') && window.location.search.includes('authIndexValue=')) {
        const urlParams = new URLSearchParams(window.location.search.substring(1));
        this.authIndexValue = urlParams.get('authIndexValue');
        this.suspendedId = urlParams.get('suspendedId');

        fixUrl = true;
      } else if (window.location.search.includes('state=') && window.location.search.includes('code=') && window.location.search.includes('scope=')) {
        const urlParams = new URLSearchParams(window.location.search.substring(1));
        this.state = urlParams.get('state');
        this.code = urlParams.get('code');
        this.scope = urlParams.get('scope');

        // session storage is used to resume a tree after returning from a redirect
        const stepInfo = this.getStepFromStorage();
        this.authIndexValue = stepInfo.authIndexValue;
        this.step = stepInfo.step;

        fixUrl = true;
      }
      if (fixUrl) {
        // remove query params from the url
        window.history.replaceState(null, null, window.location.pathname);
        // reset the hash to the proper tree
        window.location.hash = `service/${this.authIndexValue}`;
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
  }
</style>
