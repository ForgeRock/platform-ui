/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';

export const testData = {
  data: {
    result: [
      {
        _id: '6c8f411f-db0e-4fb3-a92d-2281dc6ef7a8',
        profileImage: null,
        givenName: 'test_history',
        sn: 'user_1',
        userName: 'reportadmin',
      },
      {
        _id: '13c0ab62-a072-4e52-ba47-c0ee43d7b9fd',
        profileImage: null,
        givenName: 'Binni',
        sn: 'Crinkley',
        userName: 'Binni@IGATestQA.onmicrosoft.com',
      },
      {
        _id: 'a82cc159-4f81-4698-962c-e42e1ea8eeb0',
        profileImage: null,
        givenName: 'Dieter',
        sn: 'Brigden',
        userName: 'Dieter@IGATestQA.onmicrosoft.com',
      },
      {
        _id: 'be7d07d6-6989-4069-84e4-c4513367fe5e',
        profileImage: null,
        givenName: 'Court',
        sn: 'McGibbon',
        userName: 'Court@IGATestQA.onmicrosoft.com',
      },
      {
        _id: 'c9c2073e-92ab-43ee-b072-914b3b3df81a',
        profileImage: null,
        givenName: 'Barth',
        sn: 'Vasnev',
        userName: 'Barth@IGATestQA.onmicrosoft.com',
      },
      {
        _id: '0ab8ea10-8f70-4af2-b482-a164eb5949ff',
        profileImage: null,
        givenName: 'Bernice',
        sn: 'Hablot',
        userName: 'Bernice@IGATestQA.onmicrosoft.com',
      },
      {
        _id: '80cc3894-071a-4f33-bc52-cd022ced981f',
        profileImage: null,
        givenName: 'Denny',
        sn: 'Jahn',
        userName: 'Denny@IGATestQA.onmicrosoft.com',
      },
      {
        _id: '97a08c4f-861f-4614-9e45-4901482edd33',
        profileImage: null,
        givenName: 'Ariela',
        sn: 'Stonuary',
        userName: 'Ariela@IGATestQA.onmicrosoft.com',
      },
      {
        _id: '2bc6a2bb-a1a5-4c13-a631-a5db755ffd78',
        profileImage: null,
        givenName: 'Chris',
        sn: 'Green',
        userName: 'chris@IGATestQA.onmicrosoft.com',
      },
      {
        _id: 'e656beee-d1b2-45e8-9991-c25c653dba99',
        profileImage: null,
        givenName: 'Alyson',
        sn: 'Skelly',
        userName: 'Alyson@IGATestQA.onmicrosoft.com',
      },
    ],
    resultCount: 10,
    pagedResultsCookie: 'AAAAAAAAADM=',
    totalPagedResultsPolicy: 'NONE',
    totalPagedResults: -1,
    remainingPagedResults: -1,
  },
};

export const testUserResponseTransformed = [
  {
    meta: {
      givenName: 'test_history',
      sn: 'user_1',
      profileImage: null,
      type: 'user',
      userName: 'reportadmin',
    },
    multiselectId: 'reportadmin',
    text: 'reportadmin',
    value: '6c8f411f-db0e-4fb3-a92d-2281dc6ef7a8',
  },
  {
    meta: {
      givenName: 'Binni',
      sn: 'Crinkley',
      profileImage: null,
      type: 'user',
      userName: 'Binni@IGATestQA.onmicrosoft.com',
    },
    multiselectId: 'Binni@IGATestQA.onmicrosoft.com',
    text: 'Binni@IGATestQA.onmicrosoft.com',
    value: '13c0ab62-a072-4e52-ba47-c0ee43d7b9fd',
  },
  {
    meta: {
      givenName: 'Dieter',
      sn: 'Brigden',
      profileImage: null,
      type: 'user',
      userName: 'Dieter@IGATestQA.onmicrosoft.com',
    },
    multiselectId: 'Dieter@IGATestQA.onmicrosoft.com',
    text: 'Dieter@IGATestQA.onmicrosoft.com',
    value: 'a82cc159-4f81-4698-962c-e42e1ea8eeb0',
  },
  {
    meta: {
      givenName: 'Court',
      sn: 'McGibbon',
      profileImage: null,
      type: 'user',
      userName: 'Court@IGATestQA.onmicrosoft.com',
    },
    multiselectId: 'Court@IGATestQA.onmicrosoft.com',
    text: 'Court@IGATestQA.onmicrosoft.com',
    value: 'be7d07d6-6989-4069-84e4-c4513367fe5e',
  },
  {
    meta: {
      givenName: 'Barth',
      sn: 'Vasnev',
      profileImage: null,
      type: 'user',
      userName: 'Barth@IGATestQA.onmicrosoft.com',
    },
    multiselectId: 'Barth@IGATestQA.onmicrosoft.com',
    text: 'Barth@IGATestQA.onmicrosoft.com',
    value: 'c9c2073e-92ab-43ee-b072-914b3b3df81a',
  },
  {
    meta: {
      givenName: 'Bernice',
      sn: 'Hablot',
      profileImage: null,
      type: 'user',
      userName: 'Bernice@IGATestQA.onmicrosoft.com',
    },
    multiselectId: 'Bernice@IGATestQA.onmicrosoft.com',
    text: 'Bernice@IGATestQA.onmicrosoft.com',
    value: '0ab8ea10-8f70-4af2-b482-a164eb5949ff',
  },
  {
    meta: {
      givenName: 'Denny',
      sn: 'Jahn',
      profileImage: null,
      type: 'user',
      userName: 'Denny@IGATestQA.onmicrosoft.com',
    },
    multiselectId: 'Denny@IGATestQA.onmicrosoft.com',
    text: 'Denny@IGATestQA.onmicrosoft.com',
    value: '80cc3894-071a-4f33-bc52-cd022ced981f',
  },
  {
    meta: {
      givenName: 'Ariela',
      sn: 'Stonuary',
      profileImage: null,
      type: 'user',
      userName: 'Ariela@IGATestQA.onmicrosoft.com',
    },
    multiselectId: 'Ariela@IGATestQA.onmicrosoft.com',
    text: 'Ariela@IGATestQA.onmicrosoft.com',
    value: '97a08c4f-861f-4614-9e45-4901482edd33',
  },
  {
    meta: {
      givenName: 'Chris',
      sn: 'Green',
      profileImage: null,
      type: 'user',
      userName: 'chris@IGATestQA.onmicrosoft.com',
    },
    multiselectId: 'chris@IGATestQA.onmicrosoft.com',
    text: 'chris@IGATestQA.onmicrosoft.com',
    value: '2bc6a2bb-a1a5-4c13-a631-a5db755ffd78',
  },
  {
    meta: {
      givenName: 'Alyson',
      sn: 'Skelly',
      profileImage: null,
      type: 'user',
      userName: 'Alyson@IGATestQA.onmicrosoft.com',
    },
    multiselectId: 'Alyson@IGATestQA.onmicrosoft.com',
    text: 'Alyson@IGATestQA.onmicrosoft.com',
    value: 'e656beee-d1b2-45e8-9991-c25c653dba99',
  },
];

export function mockAxios(getFn) {
  return jest.spyOn(axios, 'create').mockReturnValue({
    get: getFn,
    interceptors: {
      response: {
        use: jest.fn().mockReturnValue(false),
      },
    },
  });
}
