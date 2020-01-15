<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrCenterCard :show-logo="true">
    <div
      v-if="!loading"
      slot="center-card-header">
      <h2 class="h2">
        {{ header }}
      </h2>
      <p
        class="text-center mb-0"
        v-html="description" />
    </div>

    <BCardBody
      v-show="!loading"
      slot="center-card-body">
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

    <BCardBody
      v-show="loading"
      slot="center-card-body">
      <div class="h-100 d-flex">
        <div class="m-auto fr-center-card">
          <BounceLoader :color="loadingColor" />
        </div>
      </div>
    </BCardBody>
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
import { FRAuth, Config } from '@forgerock/javascript-sdk';
import Vue from 'vue';
import FloatingLabelInput from '@forgerock/platform-shared/src/components/FloatingLabelInput';
import BooleanAttributeInputCallback from '@/components/callbacks/BooleanAttributeInputCallback';
import CenterCard from '@/components/utils/CenterCard';
import ChoiceCallback from '@/components/callbacks/ChoiceCallback';
import ConfirmationCallback from '@/components/callbacks/ConfirmationCallback';
import KbaCreateCallback from '@/components/callbacks/KbaCreateCallback';
import HiddenValueCallback from '@/components/callbacks/HiddenValueCallback';
import ReCaptchaCallback from '@/components/callbacks/ReCaptchaCallback';
import SelectIdPCallback from '@/components/callbacks/SelectIdPCallback';
import TextOutputCallback from '@/components/callbacks/TextOutputCallback';
import SuspendedTextOutputCallback from '@/components/callbacks/SuspendedTextOutputCallback';
import styles from '@/scss/main.scss';
import TermsAndConditionsCallback from '@/components/callbacks/TermsAndConditionsCallback';

export default {
  name: 'Login',
  components: {
    FrCenterCard: CenterCard,
    BButton,
    BCardBody,
    BounceLoader,
  },
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
      });

      instance.$mount();

      this.$refs.callbacksPanel.appendChild(instance.$el);
    },
    addFloatingLabelInput(type, callback, index) {
      const failedPolicies = (callback.getFailedPolicyKeys) ? callback.getFailedPolicyKeys() : [];
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

      return this.addComponent(FloatingLabelInput, {
        label: prompt,
        type,
        autofocus: (index === 0) ? 'true' : 'false',
        reveal: type === 'password',
        fieldName: `callback_${index}`,
        defaultValue: callback.getInputValue(),
        validator: noop,
        failedPolicies: translatedPolicyMessages,
        callback,
      });
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
    nextStep() {
      const stepParams = {};

      if (this.suspendedId) {
        stepParams.query = {
          suspendedId: this.suspendedId,
        };
      }

      this.clearCallbacks();
      FRAuth.next(this.step, stepParams).then((step) => {
        this.loading = false;
        this.step = step;

        switch (step.type) {
        case 'LoginSuccess':
          // redirect to successUrl
          window.location.href = step.getSuccessUrl();
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
          // Do nothing here. If someone is using MetadataCallback the would need to inject their logic here to utilize result
          // const metadata = callback.getData();
          break;
        case 'PasswordCallback':
          this.addFloatingLabelInput('password', callback, index);
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
          this.addFloatingLabelInput('password', callback, index);
          break;
        case 'SelectIdPCallback':
          this.addComponent(SelectIdPCallback, {
            callback,
            index,
            continueWithText: this.$t('login.social.continueWith'),
            orText: this.$t('login.social.or'),
            callbackSubmitButton: this.$refs.callbackSubmitButton,
          });
          break;
        default:
          this.addFloatingLabelInput('text', callback, index);
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
    evaluateUrlParams() {
      // Look at the url and see if we are returning to a tree from an Email Suspend Node.
      // Must be the default route and url must contain the strings "suspendedId=" and "authIndexValue="
      if (this.$route.name === 'default' && window.location.search.includes('suspendedId=') && window.location.search.includes('authIndexValue=')) {
        const urlParams = new URLSearchParams(window.location.search.substring(1));
        // set the authIndexValue and suspendedId to be used by FRAuth
        this.authIndexValue = urlParams.get('authIndexValue');
        this.suspendedId = urlParams.get('suspendedId');

        // remove query params from the url
        window.history.replaceState(null, null, window.location.pathname);
        // reset the hash to the propert tree
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
  }
</style>
