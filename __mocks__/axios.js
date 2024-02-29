/**
 * Copyright 2023-2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/* eslint-disable no-console */
const axiosCreateErrorMessage = 'Un-mocked call made to Axios create. All API calls should be mocked';
const axiosRequestErrorMessage = 'Un-mocked API call made with Axios. All API calls should be mocked';

const mockedApiCall = jest.fn().mockImplementation(() => {
  console.error(axiosRequestErrorMessage);
  return Promise.resolve();
});

function mockedCreate() {
  console.error(axiosCreateErrorMessage);
  return {
    get: mockedApiCall,
    patch: mockedApiCall,
    post: mockedApiCall,
    put: mockedApiCall,
    interceptors: {
      response: {
        use: jest.fn(),
      },
    },
  };
}

const mockedAxios = {
  all: jest.fn((promisesArray) => Promise.all(promisesArray)),
  spread: jest.fn((callback) => (arr) => {
    callback(...arr);
  }),
  defaults: {
    adapter: '',
  },
  get: mockedApiCall,
  patch: mockedApiCall,
  post: mockedApiCall,
  put: mockedApiCall,
  create: mockedCreate,
};

module.exports = {
  ...mockedAxios,
  default: mockedAxios,
};
