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
      slot="center-card-body"
    >
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
          <p>{{ $t('login.loginFailure') }}</p>
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
import BooleanAttributeInputCallback from '@/components/callbacks/BooleanAttributeInputCallback';
import CenterCard from '@/components/utils/CenterCard';
import ChoiceCallback from '@/components/callbacks/ChoiceCallback';
import FloatingLabelInput from '@/components/utils/FloatingLabelInput';
import KbaCreateCallback from '@/components/callbacks/KbaCreateCallback';
import ReCaptchaCallback from '@/components/callbacks/ReCaptchaCallback';
import SelectIdPCallback from '@/components/callbacks/SelectIdPCallback';
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
      loadingColor: styles.baseColor,
      header: '',
      description: '',
      loginFailure: false,
      step: undefined,
      kbaCallbackCount: 0,
      showNextButton: false,
    };
  },
  mounted() {
    Config.set({
      serverConfig: { baseUrl: `${process.env.VUE_APP_AM_URL}/` },
      tree: this.$route.params.tree || undefined,
    });

    this.nextStep();
  },
  methods: {
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

        return this.$t(`policyValidationMessages.${tempPolicy.policyRequirement}`, tempPolicy.params);
      });
    },
    nextStep() {
      this.clearCallbacks();
      FRAuth.next(this.step).then((step) => {
        this.loading = false;
        this.header = step.getHeader();
        this.description = step.getDescription();
        this.step = step;

        if (step.getSessionToken()) {
          // if there is a tokenId then redirect to enduser ui
          window.location.href = process.env.VUE_APP_ENDUSER_URL;
        } else if (step.getError()) {
          this.loginFailure = true;
        } else {
          this.buildTreeForm();
        }
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
        case 'ValidatedCreatePasswordCallback':
          this.addFloatingLabelInput('password', callback, index);
          break;
        case 'KbaCreateCallback':
          this.addComponent(KbaCreateCallback, {
            callback,
            index,
            descriptionText: this.$t('login.kba.description'),
            customQuestonOptionText: this.$t('login.kba.custom'),
            requiredText: this.$t('policyValidationMessages.REQUIRED'),
            uniqueText: this.$t('policyValidationMessages.UNIQUE'),
            showHeader: this.kbaCallbackCount === 0,
            callbackSubmitButton: this.$refs.callbackSubmitButton,
          });

          this.kbaCallbackCount += 1;
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
    reloadTree(event) {
      event.preventDefault();
      window.location.reload();
    },
  },
};
</script>

<style lang="scss" scoped>
    #callbacksPanel /deep/ {
      br {
        display: none;
      }

      div.INFORMATION {
        margin-bottom: 10px;
      }
    }
</style>
