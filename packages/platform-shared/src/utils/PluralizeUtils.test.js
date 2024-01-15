import { pluralizeValue } from './PluralizeUtils';

describe('PluralizeUtils', () => {
  beforeEach(() => {
    process.env.VUE_APP_I18N_LOCALE = 'en';
  });

  it('Pluralizes singular words', () => {
    expect(pluralizeValue('test')).toBe('tests');
  });

  it('Pluralizes index to indices', () => {
    expect(pluralizeValue('index')).toBe('indices');
  });

  it('Does not pluralize words that are already plural', () => {
    expect(pluralizeValue('Users')).toBe('Users');
  });

  it('Pluralizes numbers', () => {
    expect(pluralizeValue('123') === '123s' || pluralizeValue('123') === '123S').toBe(true);
  });

  it('Pluralizes sentences', () => {
    expect(pluralizeValue('This is a sentence')).toBe('This is a sentences');
  });

  it('Pluralizes spaces', () => {
    expect(pluralizeValue(' ') === ' s' || pluralizeValue(' ') === ' S').toBe(true);
  });

  it('Pluralizes characters', () => {
    expect(pluralizeValue('*#()Q&#@$') === '*#()Q&#@$s' || pluralizeValue('*#()Q&#@$') === '*#()Q&#@$S').toBe(true);
  });

  it('Pluralizes Captial words and appends a capital S', () => {
    expect(pluralizeValue('USER')).toBe('USERS');
  });

  it('Does not pluralize if in a different locale', () => {
    process.env.VUE_APP_I18N_LOCALE = 'fr';
    expect(pluralizeValue('test')).toBe('test');
  });
});
