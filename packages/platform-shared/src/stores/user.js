/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// eslint-disable-next-line import/prefer-default-export
export const useUserStore = defineStore('user', () => {
  // API properties
  const managedResource = ref('');
  const userSearchAttribute = ref('');

  // Privilege based properties
  const idmRoles = ref([]);
  const adminUser = computed(() => idmRoles.value.includes('internal/role/openidm-admin') || idmRoles.value.includes('openidm-admin'));
  const amRoles = ref([]);
  const realmAdmin = computed(() => amRoles.value.includes('ui-realm-admin'));
  const amAdmin = ref(false);
  const privileges = ref({});
  const hasFederationAdminPrivilege = computed(() => privileges.value.FederationAdmin === true);

  // Presentational properties
  const company = ref('');
  const email = ref('');
  const givenName = ref('');
  const sn = ref('');
  const userId = ref('');
  const userName = ref('');

  const name = computed(() => {
    if (givenName.value || sn.value) {
      return `${givenName.value} ${sn.value}`.trim();
    }
    return userName.value || userId.value;
  });

  const effectiveRoles = computed(() => ([
    ...(adminUser.value ? ['adminUser'] : []),
    ...(realmAdmin.value ? ['realmAdmin'] : []),
    ...(amAdmin.value ? ['amAdmin'] : []),
  ]));

  const allRoles = computed(() => ([
    ...effectiveRoles.value,
    ...idmRoles.value,
    ...amRoles.value,
  ]));

  const userDetails = computed(() => ({
    name: name.value,
    userName: userName.value,
    company: company.value,
    email: email.value,
    roles: effectiveRoles.value,
  }));

  function setUserDetails(details) {
    givenName.value = details.givenName;
    sn.value = details.sn;
    email.value = details.mail;
    company.value = details.company;
    if (details.managedResource) {
      managedResource.value = details.managedResource;
    }
    if (details.userName) {
      userName.value = details.userName;
    }
  }

  function setInternalUserDetails() {
    givenName.value = 'Platform';
    sn.value = 'Admin';
    email.value = 'No Email';
    company.value = 'System';
  }

  return {
    managedResource,
    userSearchAttribute,
    privileges,
    amAdmin,
    realmAdmin,
    adminUser,
    email,
    givenName,
    name,
    hasFederationAdminPrivilege,
    userId,
    userName,
    userDetails,
    setUserDetails,
    setInternalUserDetails,
    sn,
    idmRoles,
    amRoles,
    effectiveRoles,
    allRoles,
  };
});
