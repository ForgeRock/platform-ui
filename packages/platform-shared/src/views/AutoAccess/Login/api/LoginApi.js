/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';

const TENANT_ID = '21638f94-210e-4463-9ee1-fd4d2e1b0ed0';

export const loginUser = (userName, password) => new Promise((resolve, reject) => {
  const payload = {
    username: userName,
    password,
  };
  const myHeaders = {
    headers: {
      'X-TENANT-ID': TENANT_ID,
      'Content-Type': 'application/json',
    },
  };
  axios
    .post('/api/authentication/login', payload, myHeaders)
    .then((response) => {
      resolve(response.data);
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        // logout();
      }
      reject(error);
    });
});

export const refreshToken = (token) => new Promise((resolve, reject) => {
  const myHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-TENANT-ID': TENANT_ID,
      'Content-Type': 'application/json',
    },
  };
  axios
    .post('/api/authentication/renewToken', null, myHeaders)
    .then((response) => {
      resolve(response.data);
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        // logout();
      }
      reject(error);
    });
});
