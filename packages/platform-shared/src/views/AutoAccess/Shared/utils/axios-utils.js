/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import { logout } from './login-utils';
import store from '@/store';

const TENANT_ID = '21638f94-210e-4463-9ee1-fd4d2e1b0ed0';

export const getData = (url, headers) => new Promise((resolve, reject) => {
  const myHeaders = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Signature keyId="service1-hmac", algorithm="hmac-sha256" , headers="date ", signature= "wPI+vI7qhC7LWFr3ceRV+UZH8rK+6Rg0+sgpyMppS/s="',
      'X-TENANT-ID': TENANT_ID,
      ...headers,
    },
  };
  axios
    .get(url, myHeaders)
    .then((response) => {
      resolve(response.data);
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        logout();
      }
      reject(error);
    });
});

export const getDataToken = (url, headers) => new Promise((resolve, reject) => {
  const { token } = store.state.AutoAccessAuth;
  const myHeaders = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-TENANT-ID': TENANT_ID,
      ...headers,
    },
  };
  axios
    .get(url, myHeaders)
    .then((response) => {
      resolve(response.data);
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        logout();
      }
      reject(error);
    });
});

export const postDataToken = (url, postData, headers) => new Promise((resolve, reject) => {
  const { token } = store.state.AutoAccessAuth;
  const myHeaders = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-TENANT-ID': TENANT_ID,
      ...headers,
    },
  };
  axios
    .post(url, postData, myHeaders)
    .then((response) => {
      resolve(response.data);
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        logout();
      }
      reject(error);
    });
});

export const postData = (url, sendData, headers) => new Promise((resolve, reject) => {
  const myHeaders = {
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${token}`,
      Authorization: 'Signature keyId="service1-hmac", algorithm="hmac-sha256" , headers="date ", signature= "wPI+vI7qhC7LWFr3ceRV+UZH8rK+6Rg0+sgpyMppS/s="',
      'X-TENANT-ID': TENANT_ID,
      ...headers,
    },
  };
  axios
    .post(url, sendData, myHeaders)
    .then((response) => {
      resolve(response.data);
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        logout();
      }
      reject(error);
    });
});

export const putData = (url, sendData, headers) => new Promise((resolve, reject) => {
  const { token } = store.state.Authz;

  const myHeaders = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...headers,
    },
  };
  axios
    .put(url, sendData, myHeaders)
    .then((response) => {
      resolve(response.data);
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        logout();
      }
      reject(error);
    });
});

export const patchData = (url, sendData, headers) => new Promise((resolve, reject) => {
  // const { token } = store.state.AutoAccessAuth;

  const myHeaders = {
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${token}`,
      Authorization: 'Signature keyId="service1-hmac", algorithm="hmac-sha256" , headers="date ", signature= "wPI+vI7qhC7LWFr3ceRV+UZH8rK+6Rg0+sgpyMppS/s="',
      'X-TENANT-ID': TENANT_ID,
      ...headers,
    },
  };
  axios
    .patch(url, sendData, myHeaders)
    .then((response) => {
      resolve(response.data);
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        logout();
      }
      reject(error);
    });
});

export const deletData = (url, payload, headers) => new Promise((resolve, reject) => {
  // const { token } = store.state.AutoAccessAuth;
  const myHeaders = {
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${token}`,
      Authorization: 'Signature keyId="service1-hmac", algorithm="hmac-sha256" , headers="date ", signature= "wPI+vI7qhC7LWFr3ceRV+UZH8rK+6Rg0+sgpyMppS/s="',
      'X-TENANT-ID': TENANT_ID,
      ...headers,
    },
    data: payload,
  };
  axios
    .delete(url, myHeaders)
    .then((response) => {
      resolve(response.data);
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        logout();
      }
      reject(error);
    });
});
