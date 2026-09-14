<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      class="mb-3"
      :value="userId"
      :disabled="readOnly"
      type="select"
      :label="$t('governance.accounts.accountOwner')"
      :placeholder="$t('common.placeholders.typeToSearchFor', { item: 'user' })"
      :internal-search="false"
      :options="userOptions"
      @search-change="debouncedSearch"
      @input="setUserId" />
    <FrField
      class="mb-3"
      :value="accountType"
      :disabled="readOnly"
      type="text"
      :label="$t('governance.accounts.accountType')"
      @input="setAccountType" />
  </div>
</template>

<script setup>
/**
 * Account-level fields shown when no request form is assigned: a typeahead
 * user select for "userId" (the account owner) and a text field for
 * "accountType" (its classification). Both keys are emitted flat, matching the
 * account-level key options offered by the form editor for assigned forms.
 * An initial page of users is fetched on mount so the dropdown has options
 * before the user types, matching the other resource selects.
 */
import {
  computed, onBeforeUnmount, onMounted, ref, watch,
} from 'vue';
import { debounce } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import store from '@/store';
import i18n from '@/i18n';

defineOptions({ name: 'AccountOwnerFields' });

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  userResourceName: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(['update:modelValue']);

// The managed user resource is realm-scoped (e.g. alpha_user); parents may
// override it explicitly for deployments that name it differently.
const resolvedUserResourceName = computed(() => props.userResourceName
  || `${store.state.realm || 'alpha'}_user`);

const userId = ref(props.modelValue.userId);
const accountType = ref(props.modelValue.accountType);
const userOptions = ref([]);

// Parents may populate modelValue asynchronously (e.g. after a fetch
// resolves), so synchronize the local field state whenever the prop changes.
watch(() => props.modelValue, (value) => {
  userId.value = value?.userId;
  accountType.value = value?.accountType;
});

const SEARCH_FIELDS = ['givenName', 'sn', 'userName'];

/**
 * Queries users matching the given search string and builds the select options.
 * @param {String} query - The search term.
 */
function search(query) {
  const params = {
    pageSize: 10,
    fields: SEARCH_FIELDS.join(','),
    queryFilter: query
      ? SEARCH_FIELDS.map((field) => `${field} sw "${query}"`).join(' or ')
      : true,
  };
  getManagedResourceList(resolvedUserResourceName.value, params)
    .then(({ data }) => {
      userOptions.value = (data?.result || []).map((user) => ({
        value: user._id,
        text: i18n.global.t('common.userFullNameUserName', {
          givenName: user.givenName,
          sn: user.sn,
          userName: user.userName,
        }),
      }));
    })
    .catch(() => {
      userOptions.value = [];
    });
}

const debouncedSearch = debounce(search, 500);

onMounted(() => {
  search('');
});

onBeforeUnmount(() => {
  debouncedSearch.cancel();
});

/**
 * Emits the current field values, dropping empty ones.
 */
function emitUpdate() {
  emit('update:modelValue', {
    ...(userId.value ? { userId: userId.value } : {}),
    ...(accountType.value ? { accountType: accountType.value } : {}),
  });
}

/**
 * Updates the selected user and emits the field values.
 * @param {String} value - The selected user's id.
 */
function setUserId(value) {
  userId.value = value;
  emitUpdate();
}

/**
 * Updates the account type and emits the field values.
 * @param {String} value - The account type.
 */
function setAccountType(value) {
  accountType.value = value;
  emitUpdate();
}
</script>
