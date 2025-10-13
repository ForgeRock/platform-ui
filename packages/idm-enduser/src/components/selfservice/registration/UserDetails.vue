<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <component
    :is="inline ? 'div' : VeeForm"
    v-slot="slotProps"
    as="div">
    <BForm>
      <BFormGroup
        class="mb-3"
        v-for="(property, key) in userDetails"
        :key="key">
        <FrField
          v-if="property.type === 'string'"
          v-model="saveDetails[key]"
          :label="property.description"
          :validation="calculateValidation(property)" />
        <FrField
          v-else-if="property.type === 'boolean'"
          v-model="saveDetails[key]"
          :label="property.title" />
      </BFormGroup>
      <FrPolicyPasswordInput
        v-if="!isSocialReg"
        @is-valid="setValidPassword($event)"
        v-model="saveDetails.password"
        resource-type="managed"
        resource-name="user"
        initial-policy-endpoint="policy/selfservice/registration"
        validation-endpoint="policy/selfservice/registration/?_action=validateObject"
        password-property="/user/password"
        payload-object="user"
        :num-columns="1"
        use-idm-policies-only />
      <BFormGroup class="mb-4">
        <FrField
          v-for="(preference, key) in userPreferences"
          :key="key"
          class="mb-2"
          v-model="saveDetails.preferences[key]"
          type="checkbox"
          :label="preference.description" />
      </BFormGroup>

      <BButton
        v-if="!inline"
        @click="save"
        block
        size="lg"
        variant="primary"
        :disabled="!slotProps?.meta?.valid || !validPassword">
        {{ $t("common.form.signUp") }}
      </BButton>
    </BForm>
  </component>
</template>

<script setup>
/**
 * @description Selfservice stage for generating user details and displaying social buttons available. Works the same alone and in allinone
 * */
import { Form as VeeForm } from 'vee-validate';
import { onMounted, ref, watch } from 'vue';
import {
  BButton,
  BForm,
  BFormGroup,
} from 'bootstrap-vue';
import {
  clone,
  each,
  get,
  has,
  isUndefined,
} from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrPolicyPasswordInput from '@forgerock/platform-shared/src/components/PolicyPasswordInput';
// import SocialButtons from '@/components/utils/SocialButtons';

const props = defineProps({
  selfServiceDetails: {
    type: Object,
    required: true,
  },
  inline: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:data', 'advanceStage', 'password-valid']);

const saveDetails = ref({});
const userDetails = ref({});
const userPreferences = ref({});
const isSocialReg = ref(get(props.selfServiceDetails, 'tag') !== 'initial');
const validPassword = ref(false);

/**
 * Retrieves and returns the user data required for the registration process.
 * @returns {Object} The user data object containing relevant registration details.
 */
function getData() {
  const details = clone(saveDetails.value);
  delete details.confirmPassword;

  if (isSocialReg.value) {
    delete details.password;
  }

  return { user: details };
}

/**
 * Calculates the validation rules or status for a given property.
 * @param {string} property - The property to validate.
 * @returns {string[]} The validation result or rules for the specified property.
 */
function calculateValidation(property) {
  const validators = [];

  if (property.required) validators.push('required');
  if (property.policies) {
    // Add policy vee validators correlations here
    each(property.policies, (policy) => {
      if (policy.policyId === 'valid-email-address-format') {
        validators.push('email');
      }
    });
  }
  return validators.join('|');
}

/**
 * Sets the validity state of the user's password.
 * @param {boolean} isValid - Indicates whether the password meets the required criteria.
 */
function setValidPassword(isValid) {
  validPassword.value = isValid;
  emit('password-valid', isValid);
}

/**
 * Saves the user details entered during registration.
 */
function save() {
  emit('advanceStage', getData());
}

watch(saveDetails.value, (newVal) => {
  const details = clone(newVal);
  delete details.confirmPassword;
  if (isSocialReg.value) {
    delete details.password;
  }
  emit('update:data', { user: details });
}, { deep: true });

onMounted(() => {
  if (props.selfServiceDetails?.requirements?.registrationProperties) {
    userDetails.value = props.selfServiceDetails.requirements.registrationProperties.properties;

    if (has(props.selfServiceDetails, 'requirements.properties.user.default')
          && !isUndefined(props.selfServiceDetails, 'requirements.properties.user.default')) {
      each(props.selfServiceDetails.requirements.properties.user.default, (value, key) => {
        userDetails.value[key].socialValue = value;
      });
    }

    each(props.selfServiceDetails.requirements.registrationProperties.required, (prop) => {
      userDetails.value[prop].required = true;
    });

    each(props.selfServiceDetails.requirements.registrationProperties.properties, (_value, key) => {
      if (userDetails.value[key].type === 'boolean') {
        saveDetails.value[key] = false;
      } else {
        saveDetails.value[key] = '';
      }
    });
  }

  if (props.selfServiceDetails?.requirements?.registrationPreferences) {
    saveDetails.value.preferences = {};
    userPreferences.value = props.selfServiceDetails.requirements.registrationPreferences;

    each(userPreferences.value, (_value, key) => {
      saveDetails.value.preferences[key] = false;
    });
  }

  saveDetails.value.password = '';
});

</script>

<style lang="scss" scoped>
:deep(.fr-policy-list-item) {
  text-align: left;
}
</style>
