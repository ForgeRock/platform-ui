<template>
  <FrListItem
    :collapsible="true"
    :panel-shown="false">
    <div
      slot="list-item-header"
      class="d-inline-flex w-100 media">
      <div class="media-body align-self-center">
        <h6>{{ $t('pages.profile.accountSecurity.password') }}</h6>
      </div>
      <div class="d-flex ml-3 align-self-center">
        <div
          class="btn btn-sm btn-link float-right btn-cancel"
          @click="clearComponent()"
          ref="cancel">
          {{ $t('common.form.cancel') }}
        </div>
        <div class="btn btn-sm btn-link float-right btn-edit">
          {{ $t('common.form.reset') }}
        </div>
      </div>
    </div>

    <div
      slot="list-item-collapse-body"
      class="d-inline-flex w-100">
      <BForm class="w-100">
        <BRow>
          <BCol sm="8">
            <BFormGroup>
              <label for="currentPassword">
                {{ $t('pages.profile.accountSecurity.currentPassword') }}
              </label>
              <div class="form-label-password form-label-group mb-0">
                <BFormInput
                  id="currentPassword"
                  name="currentPassword"
                  data-vv-validate-on="submit"
                  :data-vv-as="$t('pages.profile.accountSecurity.currentPassword')"
                  :class="[{'is-invalid': errors.has('currentPassword')}, 'form-control']"
                  :type="inputCurrent"
                  v-model="currentPassword"
                  v-validate="'required'" />
                <div class="input-group-append">
                  <BBtn
                    @click="revealCurrent"
                    class="btn btn-secondary"
                    type="button">
                    <i :class="[{'fa-eye-slash': !showCurrent}, {'fa-eye': showCurrent}, 'fa']" />
                  </BBtn>
                </div>
              </div>
              <FrValidationError
                :validator-errors="errors"
                field-name="currentPassword" />
            </BFormGroup>

            <FrPasswordPolicyInput
              :policy-api="`${this.$root.userStore.state.managedResource}/${userId}`"
              v-model="newPassword">
              <BFormGroup
                class="mb-3"
                slot="custom-input">
                <label for="newPassword">
                  {{ $t('pages.profile.accountSecurity.newPassword') }}
                </label>
                <div class="form-label-password form-label-group mb-0">
                  <BFormInput
                    id="newPassword"
                    :type="inputNew"
                    v-model="newPassword"
                    name="password"
                    v-validate.initial="'required|policy'" />
                  <div class="input-group-append">
                    <button
                      @click="revealNew"
                      class="btn btn-secondary"
                      type="button">
                      <i :class="[{'fa-eye-slash': !showNew}, {'fa-eye': showNew}, 'fa']" />
                    </button>
                  </div>
                </div>
              </BFormGroup>
            </FrPasswordPolicyInput>

            <FrLoadingButton
              type="button"
              variant="primary"
              class="ld-ext-right mb-3"
              :label="$t('pages.profile.accountSecurity.savePassword')"
              :loading="loading"
              @click="onSavePassword" />

            <div
              v-if="this.$root.applicationStore.state.passwordReset"
              class="text-nowrap pb-2">
              {{ $t('pages.profile.accountSecurity.rememberPassword') }} <RouterLink to="PasswordReset">
                {{ $t('pages.profile.accountSecurity.resetPassword') }}
              </RouterLink>
            </div>
          </BCol>
        </BRow>
      </BForm>
    </div>
  </FrListItem>
</template>
<script>
import ListItem from '@/components/utils/ListItem';
import LoadingButton from '@/components/utils/LoadingButton';
import PolicyPasswordInput from '@/components/utils/PolicyPasswordInput';
import ValidationError from '@/components/utils/ValidationError';

/**
 * @description Allows a user to change their password, makes use of policy password component, similar to registration it will only allow a user to change password
 * as long as it passes policy requirements (policy.json).
 *
 */
export default {
	$_veeValidate: {
		validator: 'new',
	},
	name: 'EditPassword',
	components: {
		FrListItem: ListItem,
		FrLoadingButton: LoadingButton,
		FrPasswordPolicyInput: PolicyPasswordInput,
		FrValidationError: ValidationError,
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
			userId: this.$root.userStore.getUserState().userId,
		};
	},
	methods: {
		clearComponent() {
			this.currentPassword = '';
			this.newPassword = '';
			this.errors.clear();
		},
		resetComponent() {
			this.loading = false;
			this.currentPassword = '';
			this.newPassword = '';
			this.$refs.cancel.click();
		},
		displayError(error) {
			if (error.response.status === 403) {
				this.errors.add({
					field: 'currentPassword',
					msg: 'Incorrect password provided',
				});
			}
		},
		onSavePassword() {
			const headers = {
				'X-Requested-With': 'XMLHttpRequest',
				'X-OpenIDM-Reauth-Password': this.encodeRFC5987IfNecessary(this.currentPassword),
			};
			const payload = [{ operation: 'add', field: '/password', value: this.newPassword }];
			const onSuccess = this.resetComponent.bind(this);
			const onError = this.displayError.bind(this);

			this.errors.clear();

			this.$validator.validateAll().then((valid) => {
				if (valid) {
					this.$emit('updateProfile', payload, { headers, onSuccess, onError });
				} else {
					this.displayNotification('error', this.$t('pages.profile.accountSecurity.invalidPassword'));
				}
			});
		},
		validate() {
			return this.$validator.validateAll();
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
