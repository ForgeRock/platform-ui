/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
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
