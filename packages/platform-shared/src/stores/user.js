/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
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
  const idmUIAdminRoles = ref([]);

  // adminUser is actually an IDM admin user which is different from an AM admin user
  const adminUser = computed(() => idmUIAdminRoles.value.some((role) => idmRoles.value.includes(role)));
  const amRoles = ref([]);
  const realmAdmin = computed(() => amRoles.value.includes('ui-realm-admin') || amRoles.value.includes('ui-global-admin'));
  const amAdmin = ref(false);
  const privileges = ref({});
  const hasFederationAdminPrivilege = computed(() => privileges.value.FederationAdmin === true);
  const hasTenantAuditorPrivilege = computed(() => privileges.value.TenantAuditor === true);
  const hasIDMUsersViewPrivilege = computed(() => privileges.value.IDMUsersView === true);

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

  function setIDMUsersViewPrivilege(value) {
    privileges.value = {
      ...privileges.value,
      IDMUsersView: value,
    };
  }

  function $reset() {
    managedResource.value = '';
    userSearchAttribute.value = '';
    idmRoles.value = [];
    idmUIAdminRoles.value = [];
    amRoles.value = [];
    privileges.value = {};
    company.value = '';
    email.value = '';
    givenName.value = '';
    sn.value = '';
    userId.value = '';
    userName.value = '';
    amAdmin.value = false;
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
    hasTenantAuditorPrivilege,
    hasIDMUsersViewPrivilege,
    userId,
    userName,
    userDetails,
    setUserDetails,
    setInternalUserDetails,
    sn,
    idmRoles,
    idmUIAdminRoles,
    amRoles,
    effectiveRoles,
    allRoles,
    setIDMUsersViewPrivilege,
    $reset,
  };
});
