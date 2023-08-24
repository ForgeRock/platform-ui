/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import _ from 'lodash';
import store from '@/store';

export const initServices = () => new Promise((resolve) => {
  const { token } = store.state.Authz;
  const newHeaders = {
    headers: {
      'X-TENANT-ID': 'autonomous-iam',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  axios
    .get('/jas/tenants', newHeaders)
    .then((tenantResponse) => {
      const tenants = tenantResponse.data;
      // eslint-disable-next-line no-undef
      resolve({ token, deployConfig, tenants });
    })
    .catch(() => resolve([]));
});

export const checkSession = () => {
  const userObj = store.state.Authz;
  const userToken = userObj.token;
  if (userToken) {
    const timeoutDuration = userObj.userTimeout * 1000;
    const userLoginTime = userObj.loginTime;
    const currentTime = new Date();
    const timeElapsed = currentTime.getTime() - userLoginTime.getTime();
    if (timeElapsed > timeoutDuration) {
      window.logout();
    } else {
      store.commit('Authz/setLoginTime', new Date());
    }
  }
};

export const logout = () => {
  window.localStorage.removeItem('userToken');
  store.commit('Authz/setToken', undefined);
};

export const storeUserInfo = (data) => {
  const { token } = data;
  const { exp, iat } = JSON.parse(atob(token?.split('.')[1]));
  const {
    dn, displayName, _groups,
  } = data.user;
  store.commit('Authz/setToken', token);
  const userGroups = Array.isArray(_groups) ? _groups.filter((g) => !`${g}`.toLowerCase().includes('user')) : [];
  const groups = userGroups
    ? userGroups.map((value) => value
      .replace('Zoran ', '')
      .replace(/ /, '-')
      .toLowerCase())
    : null;
  const userDetails = {
    givenName: displayName && displayName.split(' ').length > 0 ? displayName.split(' ')[0] : '',
    sn: displayName && displayName.split(' ').length > 1 ? displayName.split(' ')[1] : '',
    mail: dn && dn.includes(',') && dn.includes('=') ? dn.split(',')[0].split('=')[1] : '',
    company: groups && groups.length > 0 ? _.capitalize(groups[0]) : '',
    managedResource: '',
  };
  store.commit('UserStore/setUserDetails', userDetails);
  store.commit('Authz/setLoginTime', new Date());
  store.commit('Authz/setUserTimeout', exp - iat);
};
