/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  hasReentryToken,
  doURLParamsContainAnyResumptionParameter,
  resumingTreeFollowingRedirect,
  resumingSuspendedTree,
} from './authResumptionUtil';

describe('hasReentryToken', () => {
  const mockedWindowDocumentCookie = jest.spyOn(window.document, 'cookie', 'get');

  afterAll(() => {
    mockedWindowDocumentCookie.mockRestore();
  });

  const testCases = [
    ['Determines when the reentry cookie is present', 'name=oeschger; reentry=authId; SameSite=None', true],
    ['Determines when the reentry cookie is missing', 'name=oeschger; SameSite=None', false],
  ];
  it.each(testCases)('%s', (name, cookieString, expectedValue) => {
    mockedWindowDocumentCookie.mockReturnValueOnce(cookieString);
    expect(hasReentryToken()).toBe(expectedValue);
  });
});

describe('doURLParamsContainAnyResumptionParameter', () => {
  const testCases = [
    ['Query including state', 'state=123', true],
    ['Query including code', 'code=123', true],
    ['Query including scope', 'scope=123', true],
    ['Query including form_post_entry', 'form_post_entry=123', true],
    ['Query including responsekey', 'responsekey=123', true],
    ['Query including no matched params', 'bob=123', false],
  ];
  it.each(testCases)('%', (name, paramString, expectedValue) => {
    expect(doURLParamsContainAnyResumptionParameter(new URLSearchParams(paramString))).toBe(expectedValue);
  });
});

describe('resumingTreeFollowingRedirect', () => {
  let mockedLocalStorageGetItem;
  let mockedWindowDocumentCookie;

  beforeEach(() => {
    mockedLocalStorageGetItem = jest.spyOn(Storage.prototype, 'getItem');
    mockedWindowDocumentCookie = jest.spyOn(window.document, 'cookie', 'get');
  });

  afterEach(() => {
    mockedLocalStorageGetItem.mockRestore();
    mockedWindowDocumentCookie.mockRestore();
  });

  const testCases = [
    ['Is resuming when a resume query param is present and resume data is in storage', 'state=123', 'present', 'name=oeschger;', true],
    ['Is resuming when a reentry cookie is present and resume data is in storage', 'bill=123', 'present', 'name=oeschger; reentry=authId', true],
    ['Is not resuming when there is no resume data in storage', 'state=123', null, 'name=oeschger; reentry=authId', false],
  ];
  it.each(testCases)('%s', (name, paramString, storageValue, cookieString, expectedValue) => {
    mockedWindowDocumentCookie.mockReturnValueOnce(cookieString);
    mockedLocalStorageGetItem.mockReturnValueOnce(storageValue);

    expect(resumingTreeFollowingRedirect(new URLSearchParams(paramString))).toBe(expectedValue);
  });
});

describe('resumingSuspendedTree', () => {
  const testCases = [
    ['Is resuming when the route is login, the suspend param is present and a tree param is present', 'login', 'suspendedId=1&authIndexValue=bob', true],
    ['Is not resuming when the route is not login, the suspend param is present and a tree param is present', 'log', 'suspendedId=1&authIndexValue=bob', false],
    ['Is not resuming when the route is login, the suspend param is present and a tree param is absent', 'login', 'suspendedId=1', false],
    ['Is not resuming when the route is login, the suspend param is absent and a tree param is present', 'login', 'authIndexValue=1', false],
  ];
  it.each(testCases)('%s', (name, routeName, paramString, expectedValue) => {
    expect(resumingSuspendedTree(routeName, new URLSearchParams(paramString))).toBe(expectedValue);
  });
});
