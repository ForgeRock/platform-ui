/**
 * Builds API URL using a search value
 *
 * @param {string} filterString - Required current search value
 * @param {array} displayFields - Required array of field names that we want to query on
 * @param {object} schemaProps - Required metadata of current schema
 */
// eslint-disable-next-line import/prefer-default-export
export function generateSearchQuery(filterString, displayFields, schemaProps) {
  let filterUrl = '';

  if (filterString.length > 0) {
    // remove nested properties
    const filteredFields = displayFields.filter((field) => (!field.includes('/')));

    filteredFields.forEach((field, index) => {
      let type = 'string';

      if (schemaProps?.[field]) {
        type = schemaProps[field].type;
      }

      if (type === 'number' && !Number.isNaN(Number(parseInt(filterString, 10)))) {
        // Search based on number and proper number value
        if ((index + 1) < filteredFields.length) {
          filterUrl = `${filterUrl}${field} eq ${filterString} OR `;
        } else {
          filterUrl = `${filterUrl}${field} eq ${filterString}`;
        }
      } else if (type === 'boolean' && (filterString === 'true' || filterString === 'false')) {
        // Search based on boolean and proper boolean true/false
        if ((index + 1) < filteredFields.length) {
          filterUrl = `${filterUrl}${field} eq ${filterString} OR `;
        } else {
          filterUrl = `${filterUrl}${field} eq ${filterString}`;
        }
      } else if ((index + 1) < filteredFields.length) {
        // Fallback to general string search if all other criteria fails
        // IAM-1003 revealed an issue with some url encoding differences between
        // chrome and IE. Need to use %22 instead of " to avoid the encoding
        filterUrl = `${filterUrl}${field} sw "${filterString}" OR `;
      } else {
        filterUrl = `${filterUrl}${field} sw "${filterString}"`;
      }
    });
  } else {
    filterUrl = 'true';
  }

  return filterUrl;
}
