import PluralizeFilter from './PluralizeFilter';

describe('PluralizeFilter', () => {
  beforeEach(() => {
    process.env.VUE_APP_I18N_LOCALE = 'en';
  });

  it('Pluralizes singular words', () => {
    expect(PluralizeFilter('test')).toBe('tests');
  });

  it('Pluralizes index to indices', () => {
    expect(PluralizeFilter('index')).toBe('indices');
  });

  it('Does not pluralize words that are already plural', () => {
    expect(PluralizeFilter('Users')).toBe('Users');
  });

  it('Pluralizes numbers', () => {
    expect(PluralizeFilter('123') === '123s' || PluralizeFilter('123') === '123S').toBe(true);
  });

  it('Pluralizes sentences', () => {
    expect(PluralizeFilter('This is a sentence')).toBe('This is a sentences');
  });

  it('Pluralizes spaces', () => {
    expect(PluralizeFilter(' ') === ' s' || PluralizeFilter(' ') === ' S').toBe(true);
  });

  it('Pluralizes characters', () => {
    expect(PluralizeFilter('*#()Q&#@$') === '*#()Q&#@$s' || PluralizeFilter('*#()Q&#@$') === '*#()Q&#@$S').toBe(true);
  });

  it('Pluralizes Captial words and appends a capital S', () => {
    expect(PluralizeFilter('USER')).toBe('USERS');
  });

  it('Does not pluralize if in a different locale', () => {
    process.env.VUE_APP_I18N_LOCALE = 'fr';
    expect(PluralizeFilter('test')).toBe('test');
  });
});
