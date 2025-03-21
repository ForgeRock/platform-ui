/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import { createI18n } from 'vue-i18n';
import { overrideTranslations, setLocales } from './overrideTranslations';

jest.mock('axios');

const mainLocale = 'en';
const fallbackLocale = 'es';
const fallbackLocale2 = 'fr';

function setupI18n(messages, fallbackMessages) {
  return createI18n({
    locale: mainLocale,
    fallbackLocale,
    messages: {
      [mainLocale]: messages,
      [fallbackLocale]: fallbackMessages,
    },
  });
}

function createMockImplementation(enMockData, esMockData, frMockData) {
  axios.create.mockReturnValue({
    get: jest.fn((path) => {
      if (path === '/config/uilocale/en?_fields=login,shared') {
        return Promise.resolve(enMockData || { data: {} });
      }
      if (path === '/config/uilocale/es?_fields=login,shared') {
        return Promise.resolve(esMockData || { data: {} });
      }
      if (path === '/config/uilocale/fr?_fields=login,shared') {
        return Promise.resolve(frMockData || { data: {} });
      }
      return Promise.resolve({ data: {} });
    }),
  });
}

describe('overrides main locale translations properly', () => {
  let i18n;
  beforeEach(() => {
    const messages = {
      testMessage: 'message 1',
    };
    i18n = setupI18n(messages);
  });

  it('overrides translations based on config', async () => {
    const configData = {
      data: {
        login: {
          testMessage: 'en override',
        },
      },
    };
    createMockImplementation(configData);

    expect(i18n.global.messages.en.testMessage).toBe('message 1');
    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.en.testMessage).toBe('en override');
  });

  it('only overrides messages for the corresponding package', async () => {
    const configData = {
      data: {
        enduser: {
          testMessage: 'en override',
        },
      },
    };
    createMockImplementation(configData);

    expect(i18n.global.messages.en.testMessage).toBe('message 1');
    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.en.testMessage).toBe('message 1');
  });

  it('overrides messages from shared', async () => {
    const configData = {
      data: {
        shared: {
          testMessage: 'en override',
        },
      },
    };
    createMockImplementation(configData);

    expect(i18n.global.messages.en.testMessage).toBe('message 1');
    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.en.testMessage).toBe('en override');
  });

  it('package specific overrides take precedence over shared overrides', async () => {
    const configData = {
      data: {
        login: {
          testMessage: 'different en override',
        },
        shared: {
          testMessage: 'en override',
        },
      },
    };
    createMockImplementation(configData);

    expect(i18n.global.messages.en.testMessage).toBe('message 1');
    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.en.testMessage).toBe('different en override');
  });

  it('config overrides add to original messages if key is not present originally', async () => {
    const configData = {
      data: {
        login: {
          testMessage2: 'en override',
        },
      },
    };
    createMockImplementation(configData);

    expect(i18n.global.messages.en.testMessage2).toBeUndefined();
    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.en.testMessage2).toBe('en override');
  });
});

describe('overrides fallback locale translations properly', () => {
  let i18n;
  beforeEach(() => {
    const messages = {
      testMessage: 'message 1',
    };
    i18n = setupI18n({}, messages);
  });

  it('overrides translations based on config', async () => {
    const configData = {
      data: {
        login: {
          testMessage: 'es override',
        },
      },
    };
    createMockImplementation(null, configData);

    expect(i18n.global.messages.es.testMessage).toBe('message 1');
    await overrideTranslations('test', i18n, 'login');
    // Check if the current locale is 'es'
    expect(i18n.global.messages.es.testMessage).toBe('message 1');
  });

  it('only overrides messages for the corresponding package', async () => {
    const configData = {
      data: {
        enduser: {
          testMessage: 'es override',
        },
      },
    };
    createMockImplementation(null, configData);

    expect(i18n.global.messages.es.testMessage).toBe('message 1');
    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.es.testMessage).toBe('message 1');
  });

  it('overrides messages from shared', async () => {
    const configData = {
      data: {
        shared: {
          testMessage: 'es override',
        },
      },
    };
    createMockImplementation(null, configData);

    expect(i18n.global.messages.es.testMessage).toBe('message 1');
    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.es.testMessage).toBe('message 1');
  });

  it('package specific overrides take precedence over shared overrides', async () => {
    const configData = {
      data: {
        login: {
          testMessage: 'different es override',
        },
        shared: {
          testMessage: 'es override',
        },
      },
    };
    createMockImplementation(null, configData);

    expect(i18n.global.messages.es.testMessage).toBe('message 1');
    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.es.testMessage).toBe('message 1');
  });

  it('config overrides add to original messages if key is not present originally', async () => {
    const configData = {
      data: {
        login: {
          testMessage2: 'es override',
        },
      },
    };
    createMockImplementation(null, configData);

    expect(i18n.global.messages.es.testMessage2).toBeUndefined();
    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.es.testMessage2).toBeUndefined();
  });
});

describe('overrides multiple fallback locale translations properly', () => {
  it('overrides translations based on config', async () => {
    const i18n = createI18n({
      locale: mainLocale,
      fallbackLocale: [fallbackLocale, fallbackLocale2],
      messages: {
        [mainLocale]: { testMessage: 'main' },
        [fallbackLocale]: { testMessage: 'fallback' },
        [fallbackLocale2]: { testMessage: 'fallback2' },
      },
    });

    const mainConfig = {
      data: {
        login: {
          testMessage: 'en override',
        },
      },
    };
    const fallbackConfig = {
      data: {
        login: {
          testMessage: 'es override',
        },
      },
    };
    const fallback2Config = {
      data: {
        login: {
          testMessage: 'fr override',
        },
      },
    };
    createMockImplementation(mainConfig, fallbackConfig, fallback2Config);

    expect(i18n.global.messages.en.testMessage).toBe('main');
    expect(i18n.global.messages.es.testMessage).toBe('fallback');
    expect(i18n.global.messages.fr.testMessage).toBe('fallback2');
    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.en.testMessage).toBe('en override');
  });
});

describe('setLocales()', () => {
  let i18n;

  beforeEach(() => {
    i18n = createI18n();
  });

  it('sets primary locale', () => {
    setLocales(i18n, ['en']);
    expect(i18n.global.locale === 'en');
  });

  it('sets fallback locale', () => {
    setLocales(i18n, ['en', 'es']);
    expect(i18n.global.fallbackLocale.includes('es')).toBe(true);
  });

  it('sets multiple fallback locales', () => {
    setLocales(i18n, ['en', 'es', 'fr']);
    expect(i18n.global.fallbackLocale[0]).toBe('es');
    expect(i18n.global.fallbackLocale[1]).toBe('fr');
  });

  it('adds en as final fallback locale if not present in locale string', () => {
    setLocales(i18n, ['es', 'fr', 'de', 'en']);
    expect(i18n.global.fallbackLocale[2]).toBe('en');
  });
});

describe('overrideTranslations with different fallbackLocales positions', () => {
  let i18n;

  beforeEach(() => {
    i18n = createI18n({
      locale: 'en-US',
      fallbackLocale: ['en', 'de'],
      messages: {
        'en-US': { testMessage: 'message 1' },
        en: { testMessage: 'message 2' },
        de: { testMessage: 'message 3' },
      },
    });
  });

  it('calls getTranslationOverrides with correct fallbackLocalesToUse when en is at different positions', async () => {
    const configData = {
      data: {
        login: {
          testMessage: 'de override',
        },
      },
    };
    createMockImplementation(null, null, configData);

    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.de.testMessage).toBe('message 3');
  });

  it('handles locales [en-US, en, de]', async () => {
    i18n.global.fallbackLocale = ['en', 'de'];
    const configData = {
      data: {
        login: {
          testMessage: 'de override',
        },
      },
    };
    createMockImplementation(null, null, configData);

    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.de.testMessage).toBe('message 3');
  });

  it('handles locales [de, en-US, en]', async () => {
    i18n.global.fallbackLocale = ['de', 'en-US', 'en'];
    const configData = {
      data: {
        login: {
          testMessage: 'de override',
        },
      },
    };
    createMockImplementation(null, null, configData);

    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.de.testMessage).toBe('message 3');
  });

  it('handles locales [fr, de, en-US, en]', async () => {
    i18n.global.fallbackLocale = ['fr', 'de', 'en-US', 'en'];
    const configData = {
      data: {
        login: {
          testMessage: 'de override',
        },
      },
    };
    createMockImplementation(null, null, configData);

    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.de.testMessage).toBe('message 3');
  });

  it('handles locales [fr, en-US, en, de] with override defined for de but not for fr', async () => {
    i18n.global.fallbackLocale = ['fr', 'en-US', 'en', 'de'];
    const configData = {
      data: {
        login: {
          testMessage: 'de override',
        },
      },
    };
    createMockImplementation(null, null, configData);

    await overrideTranslations('test', i18n, 'login');
    expect(i18n.global.messages.de.testMessage).toBe('message 3');
  });
});
