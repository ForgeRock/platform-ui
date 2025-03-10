<!-- Copyright (c) 2019-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import {
  last, has, noop,
} from 'lodash';
import {
  CallbackType, FRWebAuthn, WebAuthnStepType,
} from '@forgerock/javascript-sdk';
import createRealmPath from '../../utils/createRealmPath';
import NotificationMixin from '../NotificationMixin';

export const FrCallbackType = {
  ...CallbackType,
  RecoveryCodesComponent: 'RecoveryCodesComponent',
  RedirectCallback: 'RedirectCallback',
  SelectIdPCallback: 'SelectIdPCallback',
  SuspendedTextOutputCallback: 'SuspendedTextOutputCallback',
  WebAuthnComponent: 'WebAuthnComponent',
  PushChallengeNumber: 'PushChallengeNumber',
};

export function getIdFromSession() {
  return this.getRequestService({
    context: 'AM',
    apiVersion: 'protocol=1.0,resource=2.0',
  }).post('/users?_action=idFromSession', {}, { withCredentials: true });
}

export function getUserInfo(session) {
  const urlParams = new URLSearchParams(window.location.search);
  const realm = urlParams.get('realm');
  const realmPath = createRealmPath(realm);
  const path = realmPath.length !== 0 ? `/realms/root/${realmPath}/users/${session.data.id}` : `/users/${session.data.id}`;

  return this.getRequestService({
    context: 'AM',
    apiVersion: 'protocol=1.0,resource=2.0',
  }).get(path, { withCredentials: true });
}

export function getConfigurationInfo(realm) {
  const realmPath = createRealmPath(realm);
  const requestPath = realmPath.length !== 0 ? `/realms/root/${realmPath}/serverinfo/*` : '/serverinfo/*';

  return this.getRequestService({
    context: 'AM',
    apiVersion: 'protocol=1.0,resource=1.1',
  }).get(requestPath, { withCredentials: true, suppressEvents: true });
}
// isDefaultPath is looking for a path that looks like '/am/console' or '/auth/console'
export function isDefaultPath(path) {
  return last(path.split('/')) === 'console';
}

export function isSamlURL(url) {
  return url.includes('/Consumer/metaAlias') || url.includes('/saml2');
}

/**
  * @param {string} url - current url after successful login
  * If the url contains a 'goto' query (i.e. ?goto=www.test.com)
  * then validate the goto url.
  *
  * If it has been registered in AM, redirect the user to the url
  * Else redirect to the default login url.
  */
export function verifyGotoUrlAndRedirect(url, realm, isAdmin = false, isGotoOnFail = false) {
  const urlParams = new URLSearchParams(window.location.search);
  let gotoUrl;

  // This aligns the goto parameter order to match what was used in AM and what is documented in the Docs
  const alignGotoPrecedence = process.env.VUE_APP_ALIGN_GOTO_PRECEDENCE;
  if (alignGotoPrecedence === 'true' || alignGotoPrecedence === true) {
    gotoUrl = !isGotoOnFail
      ? JSON.stringify({ goto: url })
      : JSON.stringify({ goto: urlParams.get('gotoOnFail') });
  } else {
    gotoUrl = !isGotoOnFail
      ? JSON.stringify({ goto: urlParams.get('goto') || url })
      : JSON.stringify({ goto: urlParams.get('gotoOnFail') });
  }

  urlParams.delete('goto');
  urlParams.delete('gotoOnFail');
  urlParams.delete('realm');

  const ampersand = urlParams.toString().length ? '&' : '';
  const paramsToString = urlParams.toString().length ? `${urlParams.toString()}` : '';
  const redirectUserBasedOnType = () => {
    if (isAdmin) {
    // admin user
      return `${process.env.VUE_APP_ADMIN_URL}?realm=${realm}${ampersand}${paramsToString}`;
    }
    // end user
    return `${process.env.VUE_APP_ENDUSER_URL}?realm=${realm}${ampersand}${paramsToString}`;
  };

  return this.getRequestService({
    context: 'AM',
    apiVersion: 'protocol=2.1,resource=3.0',
    realm,
  })
    .post('/users?_action=validateGoto', gotoUrl, { withCredentials: true })
    .then((res) => {
      const { successURL } = res.data;
      if (!isDefaultPath(successURL) && successURL !== 'undefined' && successURL !== null && successURL !== 'null') {
        return successURL;
      }
      if (isDefaultPath(successURL) && isGotoOnFail) {
        return false;
      }
      if (isDefaultPath(successURL) && !isDefaultPath(url)) {
        return url;
      }
      if (isDefaultPath(successURL) && isSamlURL(JSON.parse(gotoUrl).goto)) {
        return JSON.parse(gotoUrl).goto;
      }
      return redirectUserBasedOnType();
    })
    .catch(() => redirectUserBasedOnType());
}

/**
 * @description Determines if passed in callback is set to required or has a required policy
 * @param {Object} callback - callback to check if required
 * @returns {Boolean} True if passed in callback is required
 */
export function isCallbackRequired(callback) {
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
}

/**
 * @description provides translated policy errors for a callback
 * @param {Object} callback - callback to translate policy validation errors for
 * @returns {Array} an array of translated policty validation error messages
 */
export function getTranslatedPolicyFailures(callback) {
  const failedPolicies = callback.getFailedPolicies
    ? callback.getFailedPolicies()
    : [];
  return failedPolicies.map((policy) => this.$t(`common.policyValidationMessages.${policy.policyRequirement}`, policy.params));
}

/**
 * @description gets field information to show when rendering login forms
 * @param {Object} callback specific step callback
 * @param {Object} index callback index
 * @returns {Object} field props needed for Field component
 */
export function getField(callback, index) {
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
    defaultText: callback.getOutputByName('defaultText', ''),
  };
}

/**
 * @description determine if any backend scripts in the given SDK step have id's which contain a passed string
 * @param {String} matcher the string to check against script ids
 * @param {Object} step the SDK step to check within
 * @returns {Boolean} whether any backend scripts within the given step contain the passed matcher string
 */
export function backendScriptsIdsContains(matcher, step) {
  const typeArr = step.getCallbacksOfType(FrCallbackType.HiddenValueCallback)
    .map((callback) => callback.getOutputByName('id', ''));
  return typeArr.indexOf(matcher) >= 0;
}

/**
 * @description  Invokes WebAuthn registration or authentication
 * @param {Number} type enum number that represents WebAuthn type WebAuthnStepType.Authentication or WebAuthnStepType.Registration
 * @param {Object} step the current SDK step
 * @returns {Promise} SDK WebAuthn promise resolved when WebAuthn is completed
 */
export function createWebAuthnCallbackPromise(type, step) {
  if (type === WebAuthnStepType.Authentication) {
    return FRWebAuthn.authenticate(step);
  }
  return FRWebAuthn.register(step);
}

/**
 * @description provides mappings for props and listeners associated with specific callbacks required for a UI showing callbacks
 * @param {String} componentType the type of component to provide props and listeners for
 * @param {Number} index the index of the current callback in the callback list
 * @param {Array} componentList the list of current callback components
 * @param {Object} currentStage the stage property for the current SDK step
 * @param {Object} currentStep the current SDK step
 * @param {String} realm the realm to validate password requirements against
 */
export function getComponentPropsAndEvents(componentType, callBackIndex, componentList, currentStage, currentStep, realm) {
  const existsInComponentList = (type) => componentList.find((component) => component.type === `Fr${type}`);
  const componentPropsAndEvents = {
    ChoiceCallback: () => {
      let stage;
      if (currentStage?.ChoiceCallback) {
        stage = currentStage.ChoiceCallback.shift();
      }
      return { callbackSpecificProps: { stage } };
    },
    ConfirmationCallback: () => {
      // when the current auth step is showing a push challenge, we want to display the button as a link with the PushChallengeNumber view.
      const authStepIsShowingPushChallenge = currentStep.getCallbacksOfType(FrCallbackType.HiddenValueCallback)?.[0]?.getInputValue() === 'pushChallengeNumber';
      const stage = currentStage?.ConfirmationCallback?.shift();
      const showButtonsAsLinks = stage?.showButtonsAsLinks;
      const callbackSpecificProps = {
        stage: stage || {},
        variant: existsInComponentList(FrCallbackType.WebAuthnComponent) || authStepIsShowingPushChallenge || showButtonsAsLinks ? 'link' : 'primary',
      };
      return {
        callbackSpecificProps,
      };
    },
    ConsentMappingCallback: () => ({
      callbackSpecificProps: { callbacks: currentStep.callbacks },
      listeners: ['disable-next-button', 'did-consent'],
    }),
    HiddenValueCallback: () => ({
      listeners: ['hidden-value-callback-ref'],
    }),
    PushChallengeNumber: () => ({
      // when the current auth step is showing a push challenge, pass the message from PollingWaitCallback to the PushChallengeNumber view.
      callbackSpecificProps: {
        pushMessage: currentStep.getCallbacksOfType(FrCallbackType.PollingWaitCallback)?.[0]?.getMessage(),
      },
    }),
    KbaCreateCallback: () => ({
      callbackSpecificProps: { showHeader: !existsInComponentList(FrCallbackType.KbaCreateCallback) },
      listeners: ['disable-next-button'],
    }),
    PollingWaitCallback: () => {
      // when the current auth step is showing a push challenge, we want to hide the spinner and message of this callback, and instead display the message in the PushChallengeNumber view.
      const authStepIsShowingPushChallenge = currentStep.getCallbacksOfType(FrCallbackType.HiddenValueCallback)?.[0]?.getInputValue() === 'pushChallengeNumber';
      const callbackSpecificProps = {
        hideSpinnerAndMessage: authStepIsShowingPushChallenge,
      };
      return {
        callbackSpecificProps,
      };
    },
    ReCaptchaCallback: () => ({
      listeners: ['next-step-callback', 'disable-next-button'],
    }),
    SelectIdPCallback: () => ({
      callbackSpecificProps: { isOnlyCallback: currentStep.callbacks.length === 1 },
      listeners: ['hide-next-button', 'disable-next-button'],
    }),
    TextOutputCallback: () => {
      const isMfaRegistrationStep = currentStep.getCallbacksOfType(FrCallbackType.HiddenValueCallback)?.[0]?.getInputValue() === 'mfaDeviceRegistration';
      return {
        callbackSpecificProps: { isFirstRenderedCallback: componentList.length === 0, isMfaRegistrationStep },
        listeners: ['disable-next-button', 'has-scripts', 'hide-next-button', 'next-step-callback', 'update-screen-reader-message'],
      };
    },
    ValidatedCreatePasswordCallback: () => {
      let stage;
      if (currentStage?.ValidatedCreatePasswordCallback) {
        stage = currentStage.ValidatedCreatePasswordCallback.shift();
      }
      return {
        callbackSpecificProps: {
          callBackIndex,
          overrideInitialPolicies: true,
          realm,
          stage,
        },
        listeners: ['disable-next-button', 'next-step-callback', 'update-auth-id'],
      };
    },
    WebAuthnComponent: () => {
      const webAuthnType = FRWebAuthn.getWebAuthnStepType(currentStep);
      const webAuthnPromise = createWebAuthnCallbackPromise(webAuthnType, currentStep);
      return {
        callbackSpecificProps: { webAuthnType, webAuthnPromise },
      };
    },
  };
  return componentPropsAndEvents[componentType] ? componentPropsAndEvents[componentType]() : {};
}

export default {
  name: 'LoginMixin',
  mixins: [NotificationMixin],
  data() {
    return {
      FrCallbackType,
    };
  },
  methods: {
    logoutUser() {
      window.logout();
    },
    getIdFromSession,
    getUserInfo,
    getConfigurationInfo,
    isDefaultPath,
    isSamlURL,
    verifyGotoUrlAndRedirect,
    isCallbackRequired,
    getTranslatedPolicyFailures,
    getField,
    backendScriptsIdsContains,
    getComponentPropsAndEvents,
  },
};
</script>
