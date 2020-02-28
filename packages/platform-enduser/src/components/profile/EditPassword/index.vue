<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrListItem
    :collapsible="true"
    :panel-shown="false">
    <template v-slot:list-item-header>
      <div class="d-inline-flex w-100 media">
        <div class="media-body align-self-center">
          <h6>{{ $t('pages.profile.accountSecurity.password') }}</h6>
        </div>
        <div class="d-flex ml-3 align-self-center">
          <div
            class="btn btn-sm btn-link float-right btn-cancel"
            @click="clearComponent()"
            ref="cancel">
            {{ $t('common.cancel') }}
          </div>
          <div class="btn btn-sm btn-link float-right btn-edit">
            {{ $t('common.reset') }}
          </div>
        </div>
      </div>
    </template>

    <template v-slot:list-item-collapse-body>
      <div class="d-inline-flex w-100">
        <BForm class="w-100">
          <ValidationObserver ref="observer">
            <BRow>
              <BCol sm="8">
                <BFormGroup>
                  <label for="currentPassword">
                    {{ $t('pages.profile.accountSecurity.currentPassword') }}
                  </label>
                  <ValidationProvider
                    ref="provider"
                    :name="$t('pages.profile.accountSecurity.currentPassword')"
                    rules="required"
                    v-slot="{ errors }">
                    <div class="form-label-password form-label-group mb-0">
                      <BFormInput
                        id="currentPassword"
                        :name="$t('pages.profile.accountSecurity.currentPassword')"
                        :class="[{'is-invalid': errors.length > 0}, 'form-control']"
                        :type="inputCurrent"
                        v-model="currentPassword"
                      />
                      <div class="input-group-append">
                        <BBtn
                          @click="revealCurrent"
                          class="btn btn-secondary"
                          type="button">
                          <i
                            v-if="showCurrent"
                            class="material-icons-outlined">
                            visibility
                          </i>
                          <i
                            v-else
                            class="material-icons-outlined">
                            visibility_off
                          </i>
                        </BBtn>
                      </div>
                    </div>
                    <FrValidationError
                      :validator-errors="errors"
                      field-name="currentPassword" />
                  </ValidationProvider>
                </BFormGroup>

                <FrPolicyPasswordInput
                  :policy-api="`${this.managedResource}/${this.userId}`"
                  v-model="newPassword">
                  <template v-slot:custom-input>
                    <BFormGroup class="mb-3">
                      <label for="newPassword">
                        {{ $t('pages.profile.accountSecurity.newPassword') }}
                      </label>
                      <ValidationProvider
                        name="password"
                        rules="required|policy">
                        <div class="form-label-password form-label-group mb-0">
                          <BFormInput
                            id="newPassword"
                            :type="inputNew"
                            v-model="newPassword"
                            name="password"
                          />
                          <div class="input-group-append">
                            <button
                              @click="revealNew"
                              class="btn btn-secondary"
                              type="button">
                              <i
                                v-if="showNew"
                                class="material-icons-outlined">
                                visibility
                              </i>
                              <i
                                v-else
                                class="material-icons-outlined">
                                visibility_off
                              </i>
                            </button>
                          </div>
                        </div>
                      </ValidationProvider>
                    </BFormGroup>
                  </template>
                </FrPolicyPasswordInput>

                <FrLoadingButton
                  type="button"
                  variant="primary"
                  class="ld-ext-right mb-3"
                  :label="$t('pages.profile.accountSecurity.savePassword')"
                  :loading="loading"
                  @click="onSavePassword" />

                <div
                  v-if="this.passwordReset"
                  class="text-nowrap pb-2">
                  {{ $t('pages.profile.accountSecurity.rememberPassword') }} <RouterLink to="PasswordReset">
                    {{ $t('pages.profile.accountSecurity.resetPassword') }}
                  </RouterLink>
                </div>
              </BCol>
            </BRow>
          </ValidationObserver>
        </BForm>
      </div>
    </template>
  </FrListItem>
</template>
<script>
import { mapState } from 'vuex';
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import ListItem from '@forgerock/platform-shared/src/components/ListItem/';
import PolicyPasswordInput from '@forgerock/platform-shared/src/components/PolicyPasswordInput';
import ValidationErrorList from '@forgerock/platform-shared/src/components/ValidationErrorList';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import LoadingButton from '@/components/utils/LoadingButton';

/**
 * @description Allows a user to change their password, makes use of policy password component, similar to registration it will only allow a user to change password
 * as long as it passes policy requirements (policy.json).
 *
 */
export default {
  name: 'EditPassword',
  mixins: [
    NotificationMixin,
  ],
  components: {
    FrListItem: ListItem,
    FrLoadingButton: LoadingButton,
    FrPolicyPasswordInput: PolicyPasswordInput,
    FrValidationError: ValidationErrorList,
    ValidationProvider,
    ValidationObserver,
  },
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userId,
      managedResource: (state) => state.UserStore.managedResource,
      passwordReset: (state) => state.ApplicationStore.passwordReset,
    }),
  },
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      loading: false,
      showNew: true,
      showCurrent: true,
      inputCurrent: 'password',
      inputNew: 'password',
    };
  },
  methods: {
    clearComponent() {
      this.currentPassword = '';
      this.newPassword = '';
      this.$refs.observer.reset();
    },
    resetComponent() {
      this.loading = false;
      this.currentPassword = '';
      this.newPassword = '';
      this.$refs.cancel.click();
    },
    displayError(error) {
      if (error.response.status === 403) {
        this.$refs.provider.setErrors([this.$t('common.policyValidationMessages.INCORRECT_CREDENTIALS')]);
      }
    },
    async onSavePassword() {
      const headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'X-OpenIDM-Reauth-Password': this.encodeRFC5987IfNecessary(this.currentPassword),
      };
      const payload = [{ operation: 'add', field: '/password', value: this.newPassword }];
      const onSuccess = this.resetComponent.bind(this);
      const onError = this.displayError.bind(this);

      this.$refs.observer.reset();

      const isValid = await this.$refs.observer.validate();
      if (isValid) {
        this.$emit('updateProfile', payload, { headers, onSuccess, onError });
      } else {
        this.displayNotification('IDMMessages', 'error', this.$t('pages.profile.accountSecurity.invalidPassword'));
      }
    },
    revealNew() {
      if (this.inputNew === 'password') {
        this.inputNew = 'text';
        this.showNew = false;
      } else {
        this.inputNew = 'password';
        this.showNew = true;
      }
    },
    revealCurrent() {
      if (this.inputCurrent === 'password') {
        this.inputCurrent = 'text';
        this.showCurrent = false;
      } else {
        this.inputCurrent = 'password';
        this.showCurrent = true;
      }
    },
  },
};
</script>
