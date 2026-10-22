/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
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

describe('resumingTreeFollowingRedirect realm check (IAM-10763)', () => {
  let mockedLocalStorageGetItem;
  let mockedLocalStorageRemoveItem;
  let mockedWindowDocumentCookie;

  beforeEach(() => {
    mockedLocalStorageGetItem = jest.spyOn(Storage.prototype, 'getItem');
    mockedLocalStorageRemoveItem = jest.spyOn(Storage.prototype, 'removeItem');
    mockedWindowDocumentCookie = jest.spyOn(window.document, 'cookie', 'get');
  });

  afterEach(() => {
    mockedLocalStorageGetItem.mockRestore();
    mockedLocalStorageRemoveItem.mockRestore();
    mockedWindowDocumentCookie.mockRestore();
  });

  const storedFromAlpha = JSON.stringify({ realmAtRedirect: '/alpha', step: {} });
  const storedWithoutRealm = JSON.stringify({ step: {} });
  const noReentryCookie = 'name=oeschger;';
  const reentryCookie = 'name=oeschger; reentry=authId';

  const testCases = [
    ['Is resuming when the url realm matches the stored realm', 'state=123', noReentryCookie, '/alpha', storedFromAlpha, true],
    ['Is resuming when the url realm matches the stored realm apart from a leading slash', 'state=123', noReentryCookie, 'alpha', storedFromAlpha, true],
    ['Is resuming when the url has no realm (IAM-4533)', 'state=123', noReentryCookie, null, storedFromAlpha, true],
    ['Is not resuming when the url realm differs from the stored realm', 'state=123', noReentryCookie, 'bravo', storedFromAlpha, false],
    ['Is not resuming when only a reentry cookie is present and the url realm differs from the stored realm', 'bill=123', reentryCookie, 'bravo', storedFromAlpha, false],
    ['Is not resuming when the url realm is the root realm and the stored realm is not', 'state=123', noReentryCookie, '/', storedFromAlpha, false],
    ['Is resuming when the stored data has no realm', 'state=123', noReentryCookie, 'bravo', storedWithoutRealm, true],
    ['Is resuming when the stored data cannot be parsed', 'state=123', noReentryCookie, 'bravo', 'not json', true],
  ];
  it.each(testCases)('%s', (name, paramString, cookieString, urlRealm, storageValue, expectedValue) => {
    mockedWindowDocumentCookie.mockReturnValue(cookieString);
    mockedLocalStorageGetItem.mockReturnValue(storageValue);

    expect(resumingTreeFollowingRedirect(new URLSearchParams(paramString), urlRealm)).toBe(expectedValue);
  });

  it('Leaves the stored resumption data in place when the url realm differs from the stored realm', () => {
    mockedWindowDocumentCookie.mockReturnValue(reentryCookie);
    mockedLocalStorageGetItem.mockReturnValue(storedFromAlpha);

    resumingTreeFollowingRedirect(new URLSearchParams('state=123'), 'bravo');

    expect(mockedLocalStorageRemoveItem).not.toHaveBeenCalled();
  });
});

describe('resumingSuspendedTree', () => {
  const testCases = [
    ['Is resuming when the route is login, the suspend param is present and a tree param is present', 'login', 'suspendedId=1&authIndexValue=bob', true],
    ['Is not resuming when the route is not login, the suspend param is present and a tree param is present', 'log', 'suspendedId=1&authIndexValue=bob', false],
    ['Is resuming when the route is login, the suspend param is present and a tree param is absent (magic link)', 'login', 'suspendedId=1', true],
    ['Is not resuming when the route is login, the suspend param is absent and a tree param is present', 'login', 'authIndexValue=1', false],
  ];
  it.each(testCases)('%s', (name, routeName, paramString, expectedValue) => {
    expect(resumingSuspendedTree(routeName, new URLSearchParams(paramString))).toBe(expectedValue);
  });
});
