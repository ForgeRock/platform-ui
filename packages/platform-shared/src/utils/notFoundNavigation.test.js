/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { navigateToNotFound, getNotFoundBackNavigation } from './notFoundNavigation';

describe('navigateToNotFound', () => {
  it('navigates to NotFound route with default back navigation options', () => {
    const mockRouter = {
      replace: jest.fn(),
    };

    navigateToNotFound(mockRouter);

    expect(mockRouter.replace).toHaveBeenCalledWith({
      name: 'NotFound',
      state: {
        __notFoundBack: {
          backPath: '/dashboard/overview',
          backLabel: 'Dashboard',
        },
      },
    });
  });

  it('navigates to NotFound route with custom back navigation options', () => {
    const mockRouter = {
      replace: jest.fn(),
    };

    navigateToNotFound(mockRouter, {
      backPath: '/custom/path',
      backLabel: 'CustomLabel',
    });

    expect(mockRouter.replace).toHaveBeenCalledWith({
      name: 'NotFound',
      state: {
        __notFoundBack: {
          backPath: '/custom/path',
          backLabel: 'CustomLabel',
        },
      },
    });
  });

  it('navigates to NotFound route with partial custom options', () => {
    const mockRouter = {
      replace: jest.fn(),
    };

    navigateToNotFound(mockRouter, {
      backPath: '/home',
    });

    expect(mockRouter.replace).toHaveBeenCalledWith({
      name: 'NotFound',
      state: {
        __notFoundBack: {
          backPath: '/home',
          backLabel: 'Dashboard',
        },
      },
    });
  });
});

describe('getNotFoundBackNavigation', () => {
  it('returns back navigation object when present in state', () => {
    const state = {
      __notFoundBack: {
        backPath: '/some/path',
        backLabel: 'SomeLabel',
      },
    };

    const result = getNotFoundBackNavigation(state);

    expect(result).toEqual({
      backPath: '/some/path',
      backLabel: 'SomeLabel',
    });
  });

  it('returns null when state is null', () => {
    const result = getNotFoundBackNavigation(null);

    expect(result).toBeNull();
  });

  it('returns null when state is undefined', () => {
    const result = getNotFoundBackNavigation(undefined);

    expect(result).toBeNull();
  });

  it('returns null when state does not contain __notFoundBack key', () => {
    const state = {
      someOtherKey: 'value',
    };

    const result = getNotFoundBackNavigation(state);

    expect(result).toBeNull();
  });

  it('returns null when state is an empty object', () => {
    const state = {};

    const result = getNotFoundBackNavigation(state);

    expect(result).toBeNull();
  });
});
