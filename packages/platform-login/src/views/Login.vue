<template>
  <FrCenterCard :show-logo="true">
    <div slot="center-card-header">
      <h2 class="h2">
        {{ header }}
      </h2>
      <p
        class="text-center mb-0"
        v-html="description"
      />
    </div>

    <BCardBody
      v-if="!loading"
      slot="center-card-body"
    >
      <div id="loginPanel" />
      <div
        v-if="loginFailure"
        class="h-100 d-flex"
      >
        <div class="m-auto fr-center-card">
          <p>{{ $t('login.loginFailure') }}</p>
          <a
            @click="reloadTree"
            href="#/"
          >
            {{ $t('login.tryAgain') }}
          </a>
        </div>
      </div>
    </BCardBody>

    <BCardBody
      v-else
      slot="center-card-body"
    >
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
  find, has, noop, map,
} from 'lodash';
import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min';
import { BCardBody } from 'bootstrap-vue';
import ForgeRockEmbeddedLogin from 'forgerockembeddedlogin';
import Vue from 'vue';
import BooleanAttributeInputCallback from '@/components/callbacks/BooleanAttributeInputCallback';
import CenterCard from '@/components/utils/CenterCard';
import ChoiceCallback from '@/components/callbacks/ChoiceCallback';
import FloatingLabelInput from '@/components/utils/FloatingLabelInput';
import KbaCreateCallback from '@/components/callbacks/KbaCreateCallback';
import SelectIdPCallback from '@/components/callbacks/SelectIdPCallback';
import styles from '@/scss/main.scss';
import TermsAndConditionsCallback from '@/components/callbacks/TermsAndConditionsCallback';

export default {
  name: 'Login',
  components: {
    FrCenterCard: CenterCard,
    BCardBody,
    BounceLoader,
  },
  data() {
    return {
      loading: false,
      loadingColor: styles.baseColor,
      header: '',
      description: '',
      loginFailure: false,
    };
  },
  mounted() {
    this.setupEmbeddedLogin();
  },
  methods: {
    convertVueComponent(component, propsData) {
      const ComponentClass = Vue.extend(component);
      const instance = new ComponentClass({
        propsData,
      });

      instance.$mount();

      return instance;
    },
    getFloatingLabelInput(type, callback, index, prompt) {
      const failedPolicies = find(callback.output, { name: 'failedPolicies' });

      let translatedPolicyMessages = [];

      if (failedPolicies && has(failedPolicies, 'value') && failedPolicies.value.length) {
        translatedPolicyMessages = this.translatePolicyFailures(failedPolicies.value);
      }

      return this.convertVueComponent(FloatingLabelInput, {
        label: prompt,
        type,
        autofocus: (index === 0) ? 'true' : 'false',
        reveal: type === 'password',
        fieldName: `callback_${index}`,
        defaultValue: callback.input[0].value,
        validator: noop,
        failedPolicies: translatedPolicyMessages,
      });
    },
    translatePolicyFailures(failedPolicies) {
      return map(failedPolicies, (policy) => {
        const tempPolicy = JSON.parse(policy);

        return this.$t(`policyValidationMessages.${tempPolicy.policyRequirement}`, tempPolicy.params);
      });
    },
    setupEmbeddedLogin() {
      const vm = this;
      const authenticateUrl = `${process.env.VUE_APP_AM_URL}/json/realms/root/authenticate`;

      let kbaCallbackCount = 0;

      const login = new ForgeRockEmbeddedLogin({
        authenticateUrl: (vm.$route.name === 'service') ? `${authenticateUrl}?service=${vm.$route.params.tree}&authIndexType=service&authIndexValue=${vm.$route.params.tree}` : authenticateUrl,
        loginElement: document.getElementById('loginPanel'),
        successHandler() {
          window.location.href = process.env.VUE_APP_ADMIN_URL;
        },
        failureHandler() {
          // If there is a failureUrl defined redirect to there else clear out the page and display the loginFailure message with a "Try again" button
          if (has(this.currentCallbacks, 'detail.failureUrl') && this.currentCallbacks.detail.failureUrl.length) {
            window.location.href = this.currentCallbacks.detail.failureUrl;
          } else {
            vm.header = '';
            vm.description = '';
            this.loginElement.innerHTML = '';
            vm.loginFailure = true;
          }
        },
        postRenderHandler() {
          const firstInput = vm.$el.querySelector('input');

          vm.header = this.currentCallbacks.header;
          vm.description = this.currentCallbacks.description;
          kbaCallbackCount = 0;

          if (firstInput) {
            // focus on the first input after render
            firstInput.focus();
          }
        },
      });

      login.getLoginButtonText = () => vm.$t('login.next');

      login.renderNameCallback = (callback, index, prompt) => {
        const instance = vm.getFloatingLabelInput('text', callback, index, prompt);

        return Promise.resolve(instance.$el);
      };

      login.renderPasswordCallback = (callback, index, prompt) => {
        const instance = vm.getFloatingLabelInput('password', callback, index, prompt);

        return Promise.resolve(instance.$el);
      };

      login.renderNumberAttributeInputCallback = (callback, index, prompt) => {
        const instance = vm.getFloatingLabelInput('number', callback, index, prompt);

        return Promise.resolve(instance.$el);
      };
      // renderConfirmationCallbackOption renders the form's submit button
      login.renderConfirmationCallbackOption = (option, index, key) => {
        const el = document.createElement('div');
        el.innerHTML = `<input name="callback_${index}" type="submit" class="btn btn btn-block btn-lg btn-primary mt-3" index="${key}" value="${option}">`;
        return Promise.resolve(el.firstElementChild);
      };

      login.renderBooleanAttributeInputCallback = (callback, index, prompt) => {
        const instance = vm.convertVueComponent(BooleanAttributeInputCallback, {
          callback,
          index,
          prompt,
        });

        return Promise.resolve(instance.$el);
      };

      login.renderChoiceCallback = (callback, index, prompt, choices) => {
        const instance = vm.convertVueComponent(ChoiceCallback, {
          callback,
          index,
          prompt,
          choices,
        });

        return Promise.resolve(instance.$el);
      };

      // renderReCaptchaCallback was written in generic js/html for the ForgeRockEmbeddedLogin library.
      // It will be removed from here when a new version is released
      login.renderReCaptchaCallback = (option, index) => {
        const reCaptchaSiteKey = option.output[0].value;
        const reCaptchaContainer = document.createElement('div');
        const reCaptchaApiImport = document.createElement('script');
        const reCaptchaScript = document.createElement('script');
        const reCaptchaStyle = document.createElement('style');
        const reCaptchaHTML = document.createElement('div');
        const reCaptchaInput = document.createElement('input');
        const reCaptchaScriptSource = `
          var loginButton = document.querySelectorAll('input[type=submit][name^=callback]')[0],
              callback_index = ${index},
              /*
                  If callback_index is zero and the "name" attribute on loginButton is callback_1 we
                  know ReCaptcha is by itself on the page. In this case we will hide loginButton
                  and click it to submit the form automatically when ReCaptcha is complete.
              */
              standaloneMode = callback_index === 0 && loginButton && loginButton.name === "callback_1";

          if (standaloneMode) {
              loginButton.style.display = "none";
          }

          function handleCaptchaCallback(response) {
             document.getElementById("reCaptchaInput").value = response;

             if (standaloneMode) {
                 loginButton.click();
             }
          }
        `;

        const reCaptchaStyleSource = `
          .g-recaptcha>div {
              margin: auto;
          }
          .g-recaptcha>div>div {
             display: inline-block;
          }
        `;

        // add the api link
        reCaptchaApiImport.src = 'https://www.google.com/recaptcha/api.js';
        reCaptchaContainer.appendChild(reCaptchaApiImport);
        // add the script
        reCaptchaScript.innerHTML = reCaptchaScriptSource;
        reCaptchaContainer.appendChild(reCaptchaScript);
        // add the style
        reCaptchaStyle.innerHTML = reCaptchaStyleSource;
        reCaptchaContainer.appendChild(reCaptchaStyle);
        // define and add the g-recaptcha div
        reCaptchaHTML.className = 'g-recaptcha';
        reCaptchaHTML.setAttribute('data-sitekey', reCaptchaSiteKey);
        reCaptchaHTML.setAttribute('data-callback', 'handleCaptchaCallback');
        reCaptchaHTML.style = 'margin-bottom: 5px;';
        reCaptchaContainer.appendChild(reCaptchaHTML);
        // define the reCaptchaInput
        reCaptchaInput.type = 'hidden';
        reCaptchaInput.id = 'reCaptchaInput';
        reCaptchaInput.name = `callback_${index}`;
        reCaptchaContainer.appendChild(reCaptchaInput);

        reCaptchaContainer.style = 'display: inline;';

        return Promise.resolve(reCaptchaContainer);
      };

      login.renderTermsAndConditionsCallback = (callback, index) => {
        const instance = vm.convertVueComponent(TermsAndConditionsCallback, {
          callback,
          index,
          termsAndConditionsText: vm.$t('login.termsAndConditions'),
          agreeToTermsText: vm.$t('login.agreeToTerms'),
        });

        return Promise.resolve(instance.$el);
      };

      login.renderKbaCreateCallback = (callback, index) => {
        const instance = vm.convertVueComponent(KbaCreateCallback, {
          callback,
          index,
          descriptionText: vm.$t('login.kba.description'),
          customQuestonOptionText: vm.$t('login.kba.custom'),
          requiredText: vm.$t('policyValidationMessages.REQUIRED'),
          uniqueText: vm.$t('policyValidationMessages.UNIQUE'),
          showHeader: kbaCallbackCount === 0,
        });

        kbaCallbackCount += 1;

        return Promise.resolve(instance.$el);
      };

      login.renderSelectIdPCallback = (callback, index) => {
        const instance = vm.convertVueComponent(SelectIdPCallback, {
          callback,
          index,
          continueWithText: vm.$t('login.social.continueWith'),
          orText: vm.$t('login.social.or'),
        });

        return Promise.resolve(instance.$el);
      };

      // Overriding this function to handle callback types that don't currently exist in the forgerockembeddedlogin library
      login.renderUnknownCallback = (callback, index, prompt) => {
        switch (callback.type) {
          case 'BooleanAttributeInputCallback': return login.renderBooleanAttributeInputCallback(callback, index, prompt);
          case 'NumberAttributeInputCallback': return login.renderNumberAttributeInputCallback(callback, index, prompt);
          case 'ReCaptchaCallback': return login.renderReCaptchaCallback(callback, index, prompt);
          case 'TermsAndConditionsCallback': return login.renderTermsAndConditionsCallback(callback, index, prompt);
          case 'ValidatedCreatePasswordCallback': return login.renderPasswordCallback(callback, index, prompt);
          case 'KbaCreateCallback': return login.renderKbaCreateCallback(callback, index, prompt);
          case 'SelectIdPCallback': return login.renderSelectIdPCallback(callback, index, prompt);
          default: return login.renderNameCallback(callback, index, prompt);
        }
      };

      // Overriding this function to handle callback types that don't currently exist in the forgerockembeddedlogin library
      login.handleLoginSubmit = (event) => {
        event.preventDefault();

        // TODO investigate in the future rewriting this to be more vue centric for retreieveing the data from the form
        for (const entry of (new FormData(event.currentTarget))) { // eslint-disable-line no-restricted-syntax
          const callbackEntry = entry[0].match(/^callback_(\d+)$/);

          if (callbackEntry) {
            const thisCallback = login.currentCallbacks.callbacks[parseInt(callbackEntry[1], 10)];
            const kbaAnswerCallback = login.currentCallbacks.callbacks[parseInt(callbackEntry[1], 10) / 100];

            if (thisCallback && (thisCallback.type === 'BooleanAttributeInputCallback' || thisCallback.type === 'TermsAndConditionsCallback')) {
              const entryBoolean = entry[1];

              thisCallback.input[0].value = (entryBoolean === true || entryBoolean === 'true');
            } else if (thisCallback && thisCallback.type === 'NumberAttributeInputCallback') {
              const entryNumber = Number(entry[1]);

              thisCallback.input[0].value = entryNumber;
            } else if (thisCallback && !(thisCallback.type === 'KbaCreateCallback' && callbackEntry[1] === '000')) {
              const entryKBA = entry[1];

              thisCallback.input[0].value = entryKBA;
            } else if (kbaAnswerCallback) {
              const entryKBA = entry[1];

              kbaAnswerCallback.input[1].value = entryKBA;
            }
          }
        }

        return login.submitCallbacks();
      };

      login.startLogin();
    },
    reloadTree(event) {
      event.preventDefault();
      window.location.reload();
    },
  },
};
</script>

<style lang="scss" scoped>
    #loginPanel /deep/ {
      br {
        display: none;
      }

      div.INFORMATION {
        margin-bottom: 10px;
      }
    }
</style>
