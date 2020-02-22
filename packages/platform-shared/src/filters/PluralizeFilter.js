import pluralize from 'pluralize';

export default function (value) {
  if (process.env.VUE_APP_I18N_LOCALE === 'en') {
    return pluralize(value);
  }
  return value;
}
