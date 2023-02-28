/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const mockedAxios = {
  all: jest.fn((promisesArray) => Promise.all(promisesArray)),
  // eslint-disable-next-line func-names
  create: jest.fn(function () {
    return this;
  }),
  interceptors: {
    response: {
      use: jest.fn(),
    },
  },
  // TODO: these request methods should me set to jest `fail()` once IAM-3643 is complete
  get: jest.fn().mockResolvedValue(),
  patch: jest.fn().mockResolvedValue(),
  post: jest.fn().mockResolvedValue(),
  put: jest.fn().mockResolvedValue(),
  spread: jest.fn((callback) => (arr) => {
    callback(...arr);
  }),
  defaults: {
    adapter: '',
  },
};

afterEach(() => {
  const mockedAxiosKeys = Object.keys(mockedAxios);
  mockedAxiosKeys.forEach((key) => {
    if (key === 'interceptors') {
      mockedAxios.interceptors.response.use.mockClear && mockedAxios.interceptors.response.use.mockClear();
    } else {
      mockedAxios[key].mockClear && mockedAxios[key].mockClear();
    }
  });
});

module.exports = mockedAxios;
