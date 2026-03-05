/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { getNotFoundBackNavigation } from '@forgerock/platform-shared/src/utils/notFoundNavigation';
import { translationExists } from '@forgerock/platform-shared/src/utils/translations';
import NotFound from './index';

jest.mock('@forgerock/platform-shared/src/composables/breadcrumb');
jest.mock('@forgerock/platform-shared/src/utils/notFoundNavigation');
jest.mock('@forgerock/platform-shared/src/utils/translations');

// Mocked translation keys
const localesMock = {
  'common.back': 'Back',
  'pages.notFound.couldNotFind': "We couldn't find the page you were looking for.",
  'pages.notFound.returnRoute': 'Return to {returnRoute}',
  'pageTitles.KnownRoute': 'Known Route Title',
};

describe('NotFound component', () => {
  const setBreadcrumbMock = jest.fn();

  function setup() {
    return mount(NotFound, {
      global: {
        stubs: { RouterLink: true },
        mocks: {
          $t: (key) => localesMock[key],
        },
      },
    });
  }

  let wrapper;

  beforeEach(() => {
    useBreadcrumb.mockReturnValue({ setBreadcrumb: setBreadcrumbMock });
    getNotFoundBackNavigation.mockReturnValue(null);
    translationExists.mockImplementation((key) => key in localesMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('NotFound', () => {
    it('renders the 404 message', () => {
      wrapper = setup();
      expect(wrapper.find('h1').text()).toBe('404');
      expect(wrapper.text()).toContain("We couldn't find the page you were looking for.");
    });

    it('sets the breadcrumb and previous route correctly without back navigation', () => {
      const to = {};
      const from = { name: 'PreviousPage', path: '/previous' };
      const next = jest.fn((callback) => {
        callback(wrapper.vm);
      });

      wrapper = setup();
      NotFound.beforeRouteEnter(to, from, next);

      expect(next).toHaveBeenCalled();
      expect(wrapper.vm.previousRoute).toEqual(from);

      // 'PreviousPage' is not in the mocked pageTitles, so falls back to common.back
      expect(setBreadcrumbMock).toHaveBeenCalledWith('/previous', localesMock['common.back']);
    });

    it('sets the breadcrumb and previous route correctly with back navigation state', () => {
      getNotFoundBackNavigation.mockReturnValue({
        backLabel: 'FooBar',
        backPath: '/foo-bar',
      });
      const next = jest.fn((callback) => {
        callback(wrapper.vm);
      });

      wrapper = setup();
      NotFound.beforeRouteEnter({}, {}, next);

      expect(next).toHaveBeenCalled();
      expect(wrapper.vm.previousRoute).toEqual({
        name: 'FooBar',
        path: '/foo-bar',
      });

      // 'FooBar' is not in the mocked pageTitles, so falls back to common.back
      expect(setBreadcrumbMock).toHaveBeenCalledWith('/foo-bar', localesMock['common.back']);
    });

    it('sets the breadcrumb with a translated title when the pageTitles key exists', () => {
      getNotFoundBackNavigation.mockReturnValue({
        backLabel: 'KnownRoute',
        backPath: '/known-route',
      });
      const next = jest.fn((callback) => {
        callback(wrapper.vm);
      });

      wrapper = setup();
      NotFound.beforeRouteEnter({}, {}, next);

      expect(setBreadcrumbMock).toHaveBeenCalledWith('/known-route', localesMock['pageTitles.KnownRoute']);
    });
  });

  describe('getRouteTitle', () => {
    it('returns the translated page title when the pageTitles key exists', () => {
      wrapper = setup();
      expect(wrapper.vm.getRouteTitle('KnownRoute')).toBe('Known Route Title');
    });

    it('returns null when the pageTitles key does not exist', () => {
      wrapper = setup();
      expect(wrapper.vm.getRouteTitle('SomeUnknownRoute')).toBeNull();
    });
  });

  describe('getButtonLabel', () => {
    it('returns the returnRoute translation wrapping the page title when the key exists', () => {
      wrapper = setup();
      expect(wrapper.vm.getButtonLabel('KnownRoute')).toBe(localesMock['pages.notFound.returnRoute']);
    });

    it('returns common.back when the pageTitles key does not exist', () => {
      wrapper = setup();
      expect(wrapper.vm.getButtonLabel('SomeUnknownRoute')).toBe('Back');
    });
  });
});
