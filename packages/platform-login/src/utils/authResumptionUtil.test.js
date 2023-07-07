/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable indent */
import {
  hasReentryToken,
  doURLParamsContainAnyResumptionParameter,
  resumingTreeFollowingRedirect,
  resumingSuspendedTree,
  doesNewAuthUrlContainExtraQueryParams,
} from './authResumptionUtil';

describe('hasReentryToken', () => {
  const mockedWindowDocumentCookie = jest.spyOn(window.document, 'cookie', 'get');

  afterAll(() => {
    mockedWindowDocumentCookie.mockRestore();
  });

  it.each`
    name                                               | cookieString                                      | expectedValue
    ${'Determines when the reentry cookie is present'} | ${'name=oeschger; reentry=authId; SameSite=None'} | ${true}
    ${'Determines when the reentry cookie is missing'} | ${'name=oeschger; SameSite=None'}                 | ${false}
    `('$name', ({ cookieString, expectedValue }) => {
      mockedWindowDocumentCookie.mockReturnValueOnce(cookieString);
      expect(hasReentryToken()).toBe(expectedValue);
  });
});

describe('doURLParamsContainAnyResumptionParameter', () => {
  it.each`
    name                                   | paramString              | expectedValue
    ${'Query including state'}             | ${'state=123'}           | ${true}
    ${'Query including code'}              | ${'code=123'}            | ${true}
    ${'Query including scope'}             | ${'scope=123'}           | ${true}
    ${'Query including form_post_entry'}   | ${'form_post_entry=123'} | ${true}
    ${'Query including responsekey'}       | ${'responsekey=123'}     | ${true}
    ${'Query including no matched params'} | ${'bob=123'}             | ${false}
    `('$name', ({ paramString, expectedValue }) => {
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

  it.each`
  name                                                                                | paramString    | storageValue | cookieString                       | expectedValue
  ${'Is resuming when a resume query param is present and resume data is in storage'} | ${'state=123'} | ${'present'} | ${'name=oeschger;'}                | ${true}
  ${'Is resuming when a reentry cookie is present and resume data is in storage'}     | ${'bill=123'}  | ${'present'} | ${'name=oeschger; reentry=authId'} | ${true}
  ${'Is not resuming when there is no resume data in storage'}                        | ${'state=123'} | ${null}      | ${'name=oeschger; reentry=authId'} | ${false}
  `('$name', ({
    paramString, storageValue, cookieString, expectedValue,
  }) => {
    mockedWindowDocumentCookie.mockReturnValueOnce(cookieString);
    mockedLocalStorageGetItem.mockReturnValueOnce(storageValue);

    expect(resumingTreeFollowingRedirect(new URLSearchParams(paramString))).toBe(expectedValue);
  });
});

describe('resumingSuspendedTree', () => {
  it.each`
    name                                                                                                       | routeName  | paramString                           | expectedValue
    ${'Is resuming when the route is login, the suspend param is present and a tree param is present'}         | ${'login'} | ${'suspendedId=1&authIndexValue=bob'} | ${true}
    ${'Is not resuming when the route is not login, the suspend param is present and a tree param is present'} | ${'log'}   | ${'suspendedId=1&authIndexValue=bob'} | ${false}
    ${'Is not resuming when the route is login, the suspend param is present and a tree param is absent'}      | ${'login'} | ${'suspendedId=1'}                    | ${false}
    ${'Is not resuming when the route is login, the suspend param is absent and a tree param is present'}      | ${'login'} | ${'authIndexValue=1'}                 | ${false}
    `('$name', ({ routeName, paramString, expectedValue }) => {
      expect(resumingSuspendedTree(routeName, new URLSearchParams(paramString))).toBe(expectedValue);
  });
});

describe('doesNewAuthUrlContainExtraQueryParams', () => {
  it.each`
    name                                                                       | oldQuery | newQuery | expectedValue
    ${'Identifies when the newURL has more query parameters'}                  | ${''} | ${'?a=1&b=2'} | ${true}
    ${'Identifies when the newURL has differing query parameters'}             | ${'?a=1'} | ${'?b=1'} | ${true}
    ${'Identifies when the newURL has query parameters with different content'} | ${'?a=1'} | ${'?a=2'} | ${true}
    ${'Identifies when the newURL has matching query parameters'}              | ${'?a=1'} | ${'?a=1'} | ${false}
    ${'Ignores realm parameters'}                                              | ${'?realm=a&a=1'} | ${'?realm=b&a=1'} | ${false}
    ${'Ignores service/value parameter pairs'}                                 | ${'?authIndexType=service&authIndexValue=tree1&a=1'} | ${'?authIndexType=service&authIndexValue=tree2&a=1'} | ${false}
  `('$name', ({ oldQuery, newQuery, expectedValue }) => {
    const oldUrl = `https://blah.com${oldQuery}`;
    const newUrl = `https://blah.com${newQuery}`;
    expect(doesNewAuthUrlContainExtraQueryParams(oldUrl, newUrl)).toBe(expectedValue);
  });
});
