/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { ADMIN_PAGES } from '../support/constants';

/**
* generates the URL of the page based on the ADMIN_PAGES constants file
* @param {page} pageToNavigate This can be either the page name or the page URL
* @param {isUrl} isUrl Indicates if the value of the page param is an URL or the name of the page. By default it uses the page name.
*/
function generatePageURL(pageToNavigate, isUrl) {
  const pageURL = isUrl ? pageToNavigate : Object.values(ADMIN_PAGES).find((page) => page.label === pageToNavigate).url;
  const realm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';
  return `${Cypress.config().baseUrl}/platform/?realm=${realm}#/${pageURL}`;
}

export default generatePageURL;
