/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { filterTests, retryableBeforeEach } from '../../../../e2e/util';
import { addOverrides, deleteOverrides } from '../api/localizationApi.e2e';
import { prepareJourneyTemplate } from '../utils/manageJourneys';

// Login config translations
const enTranslations = {
  login: {
    login: {
      next: 'Next Test',
    },
    overrides: {
      UserName: 'User Name Test',
      Password: 'Password Test',
      Loginfailure: 'Login Failure Override',
    },
  },
};

const frTranslations = {
  login: {
    login: {
      next: 'Suivant Test',
    },
    overrides: {
      UserName: 'Nom d\'utilisateur Test',
    },
  },
};

const frcaTranslations = {
  login: {
    login: {
      next: 'Suivant Test frca',
    },
  },
};

// Theme/Journey config translations and functions
const loginRealm = Cypress.env('IS_FRAAS') ? '/alpha' : '/';
const userRealm = Cypress.env('IS_FRAAS') ? 'alpha_' : '';
const userPassword = 'Rg_GRg9k&e';

const mainPageTranslations = {
  headerLinks: {
    en: [
      { name: 'Link 1', link: '#' },
      { name: 'Disabled', link: '#' },
      { name: 'Link 2', link: '#' },
    ],
    cs: [
      { name: 'Odkaz 1', link: '#' },
      { name: 'Zakázáno', link: '#' },
      { name: 'Odkaz 2', link: '#' },
    ],
  },
  pageMessages: {
    en: 'Heres a journey pages Message!',
    cs: 'Tady je zpráva z Journey message tematu!',
  },
  messageNodeLinks: {
    en: [{
      name: 'Español',
      link: `?realm=${loginRealm}&authIndexType=service&authIndexValue=Registration - Translated&locale=es`,
    }, {
      name: 'Čeština',
      link: `?realm=${loginRealm}&authIndexType=service&authIndexValue=Registration - Translated&locale=cs`,
    }, {
      name: 'Undefined locale',
      link: `?realm=${loginRealm}&authIndexType=service&authIndexValue=Registration - Translated&locale=wrong`,
    }],
    cs: [{
      name: 'Español',
      link: `?realm=${loginRealm}&authIndexType=service&authIndexValue=Registration - Translated&locale=es`,
    }, {
      name: 'English',
      link: `?realm=${loginRealm}&authIndexType=service&authIndexValue=Registration - Translated&locale=en`,
    }, {
      name: 'Undefined locale',
      link: `?realm=${loginRealm}&authIndexType=service&authIndexValue=Registration - Translated&locale=wrong`,
    }],
  },
  messageNodeMessages: {
    en: 'Heres message node message in EN!',
    cs: 'Zde je zpráva v CS!',
  },
  messageNodePositiveButton: {
    en: 'Next',
    cs: 'Dále',
  },
  messageNodeNegativeButton: {
    en: 'Next negative',
    cs: 'Další negativní',
  },
  footerHeadings: {
    en: ['Company', 'Support', 'Community'],
    cs: ['Společnost', 'Podpora', 'Komunita'],
  },
  footerLinks: {
    en: [
      { name: 'About Us', link: '#' },
      { name: 'Contact Us', link: '#' },
      { name: 'Privacy & Terms', link: '#' },
      { name: 'Help Center', link: '#' },
      { name: 'Docs', link: '#' },
      { name: 'Privacy & Terms', link: '#' },
      { name: 'Facebook', link: '#' },
      { name: 'Twitter', link: '#' },
      { name: 'Forum', link: '#' },
      { name: 'Rob Roy Markets, Inc', link: '#' },
    ],
    cs: [
      { name: 'O nás', link: '#' },
      { name: 'Kontakty', link: '#' },
      { name: 'Podmínky ochrany osobních údajů', link: '#' },
      { name: 'Centrum nápovědy', link: '#' },
      { name: 'Dokumentace', link: '#' },
      { name: 'Podmínky ochrany osobních údajů', link: '#' },
      { name: 'Facebook', link: '#' },
      { name: 'Twitter', link: '#' },
      { name: 'Forum', link: '#' },
      { name: 'Rob Roy Markets, Inc', link: '#' },
    ],
  },
};

const registrationPageTranslations = {
  messageNodeHeading: {
    en: 'Sign Up',
    cs: 'Zaregistruj se',
  },
  messageNodeQuestion: {
    en: 'Already have an account?',
    cs: 'Už máš účet?',
  },
  messageNodeLinks: {
    en: [{
      name: 'Sign In',
      link: '#/service/Login',
    }, {
      name: 'Forgot your username?',
      link: '#/service/ForgottenUsername',
    }, {
      name: 'Forgot your password?',
      link: '#/service/ResetPassword',
    }].concat(mainPageTranslations.messageNodeLinks.en),
    cs: [{
      name: 'Přihlaš se',
      link: '#/service/Login',
    }, {
      name: 'Zapomenuté uživatelské jméno?',
      link: '#/service/ForgottenUsername',
    }, {
      name: 'Zapomenuté heslo?',
      link: '#/service/ResetPassword',
    }].concat(mainPageTranslations.messageNodeLinks.cs),
  },
  messageNodeSecurityQuestion: {
    firstQuestion: 'What\'s your favorite color?',
    secondQuestion: 'Who was your first employer?',
    en: { placeholder: 'Select a security question' },
    cs: { placeholder: 'Vytvoř si bezpečnostní otázku' },
  },
  messageNodeMessages: {
    en: 'Page Footer here!',
    cs: 'Zápatí stránky zde!',
  },
};

const successRegistrationPageTranslations = {
  messageNodeMessages: {
    en: 'An email has been sent to the address you entered. Click the link in that email to proceed.',
    cs: 'Na vámi zadanou adresu byl odeslán e-mail. Pokračujte kliknutím na odkaz v e-mailu.',
  },
};

function verifyHeaderTranslations(locale) {
  // Get Header links translations
  const headerLinks = mainPageTranslations.headerLinks[locale];

  cy.get('.navbar-collapse').within(() => {
    // Check all links in Header
    cy.get('a').each(($element, index) => {
      cy.wrap($element)
        .should('have.text', headerLinks[index].name)
        .and('have.attr', 'href', headerLinks[index].link);
    });
  });
}

function verifyMessageTranslations(locale) {
  // Get Journey pages Message translations
  const journeyPagesMessage = mainPageTranslations.pageMessages[locale];

  // Verify Journey pages Message translations
  cy.findByText(journeyPagesMessage).should('be.visible');
}

function verifyFooterTranslations(locale) {
  // Get Footer headings translations
  const footerHeadings = mainPageTranslations.footerHeadings[locale];
  // Get Footer links translations
  const footerLinks = mainPageTranslations.footerLinks[locale];

  cy.get('#appFooter').within(() => {
    // Check all Footer headings in H5
    cy.findAllByRole('heading').each(($element, index) => {
      cy.wrap($element).should('contain', footerHeadings[index]);
    });

    // Check all links in Footer
    cy.get('a').each(($element, index) => {
      cy.wrap($element)
        .should('have.text', footerLinks[index].name)
        .and('have.attr', 'href', footerLinks[index].link);
    });
  });
}

function verifyMainPageTranslations(locale) {
  // Wait for a page to load & check for positive Message Node button
  cy.findByRole('button', { name: mainPageTranslations.messageNodePositiveButton[locale], timeout: 10000 }).should('be.visible');

  // Check Header translations
  verifyHeaderTranslations(locale);

  // Check for Journey pages Message
  verifyMessageTranslations(locale);

  // Check Message Node translations
  const messageNodeLinks = mainPageTranslations.messageNodeLinks[locale];

  cy.get('.card-header').within(() => {
    // Check all links in Message Node
    cy.get('a').each(($element, index) => {
      cy.wrap($element)
        .should('contain', messageNodeLinks[index].name)
        .and('have.attr', 'href', messageNodeLinks[index].link);
    });
  });

  cy.get('.card-body').within(() => {
    // Check for Message Node Message
    cy.findByText(mainPageTranslations.messageNodeMessages[locale]).should('be.visible');
    // Check for negative Message Node button
    cy.findByRole('button', { name: mainPageTranslations.messageNodeNegativeButton[locale] }).should('be.visible');
  });

  // Check Footer translations
  verifyFooterTranslations(locale);
}

function verifyRegistrationPageTranslations(locale) {
  // Wait for a page to load
  cy.findByLabelText('Username', { timeout: 10000 }).should('be.visible');

  // Check Header translations
  verifyHeaderTranslations(locale);

  // Check for Journey pages Message
  verifyMessageTranslations(locale);

  // Check Message Node
  const messageNodeLinks = registrationPageTranslations.messageNodeLinks[locale];

  cy.get('.card-header').within(() => {
    // Check Message Node header
    cy.findByText(registrationPageTranslations.messageNodeHeading[locale]).should('be.visible');

    // Check Message Node question
    cy.findByText(registrationPageTranslations.messageNodeQuestion[locale]).should('be.visible');

    // Check all links in Message Node
    cy.get('a').each(($element, index) => {
      cy.wrap($element)
        .should('contain', messageNodeLinks[index].name)
        .and('have.attr', 'href', messageNodeLinks[index].link);
    });
  });

  cy.get('.card-body').within(() => {
    // Check for first Multiselect placeholder message (only one required by default for Cloud Tenants)
    cy.findAllByText(registrationPageTranslations.messageNodeSecurityQuestion[locale].placeholder).first().should('be.visible');

    if (!Cypress.env('IS_FRAAS')) {
      // Check for second Multiselect placeholder message (only required by default for ForgeOps Tenants)
      cy.findAllByText(registrationPageTranslations.messageNodeSecurityQuestion[locale].placeholder).last().should('be.visible');
    }

    // Check for positive Message Node button
    cy.findByRole('button', { name: mainPageTranslations.messageNodePositiveButton[locale] }).should('be.visible');
  });

  // Check for Footer in Message Node
  cy.findByText(registrationPageTranslations.messageNodeMessages[locale]).should('be.visible');

  // Check Footer translations
  verifyFooterTranslations(locale);
}

function verifySuccessRegistrationPageTranslations(locale) {
  // Wait for a page to load & check Message Node
  cy.get('.card-body').within(() => {
    // Check for Message Node Message
    cy.findByText(successRegistrationPageTranslations.messageNodeMessages[locale], { timeout: 10000 }).should('be.visible');
  });

  // Check Header translations
  verifyHeaderTranslations(locale);

  // Check for Journey pages Message
  verifyMessageTranslations(locale);

  // Check Footer translations
  verifyFooterTranslations(locale);
}

function fillOutTranslatedRegistrationForm(userName, userEmail) {
  // Fill in only required fields for user registration
  cy.findByLabelText('Username').type(userName);
  cy.findByLabelText('First Name').type(userName);
  cy.findByLabelText('Last Name').type('Translation');
  cy.findByLabelText('Email Address').type(userEmail);
  cy.findByLabelText('Password').type(userPassword);

  // Fill in first translated security question (only one required by default for Cloud Tenants)
  cy.findAllByRole('combobox').first().click();
  cy.findAllByText(registrationPageTranslations.messageNodeSecurityQuestion.firstQuestion).first().click();
  cy.findAllByLabelText(`Answer for: ${registrationPageTranslations.messageNodeSecurityQuestion.firstQuestion}`).first().type('yellow');

  if (!Cypress.env('IS_FRAAS')) {
    // Fill in second translated security question (only required by default for ForgeOps Tenants)
    cy.findAllByRole('combobox').last().click();
    cy.findAllByText(registrationPageTranslations.messageNodeSecurityQuestion.secondQuestion).last().click();
    cy.findAllByLabelText(`Answer for: ${registrationPageTranslations.messageNodeSecurityQuestion.secondQuestion}`).first().type('life');
  }
}

filterTests(['@forgeops', '@cloud'], () => {
  describe('Login config translations', () => {
    const loginBaseUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=Login`;

    // Add config translation overrides
    before(() => {
      // Login as admin and upload config translation overrides
      cy.loginAsAdmin().then(() => {
        addOverrides('en', enTranslations);
        addOverrides('fr', frTranslations);
        addOverrides('fr-ca', frcaTranslations);
        cy.logout();
      });
    });

    it('Should override the text of the next button, username placeholder, and password placeholder', () => {
      // Set up intercept
      cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');

      // Visit base page of our Login Journey with default locale
      cy.visit(`${loginBaseUrl}#/`);

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Check override translations are applied correctly for default locale
      cy.findByRole('button', { name: 'Next Test', timeout: 10000 }).should('be.visible');
      cy.findByLabelText('User Name Test').should('be.visible');
      cy.findByLabelText('Password Test').should('be.visible');
    });

    it('Should override the text of the login failure message', () => {
      // Set up how many times we should click on the Next button to trigger the 'Loginfailure' message
      const timesClicked = Cypress.env('IS_FRAAS') ? 6 : 1;

      // Set up intercept
      cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');

      // Visit base page of our Login Journey with default locale
      cy.visit(`${loginBaseUrl}#/`);

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Click on the Next button to trigger the 'Loginfailure' message
      for (let i = 0; i < timesClicked; i += 1) {
        // Check override translations are applied correctly for default locale
        cy.findByRole('button', { name: 'Next Test', timeout: 10000 }).should('be.visible').click();

        // Wait for a Journey page to fully load
        cy.wait('@themerealmConfig', { timeout: 10000 });
      }

      // Check override translations are applied correctly for default locale
      cy.findAllByRole('alert').should('be.visible').contains('Login Failure Override');
    });

    it('Should display French overrides when locale query parameter is "fr"', () => {
      // Set up intercept
      cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');

      // Visit base page of our Login Journey with added locale
      cy.visit(`${loginBaseUrl}&locale=fr#/`);

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Check override translations are applied correctly for added locale
      cy.findByRole('button', { name: 'Suivant Test', timeout: 10000 }).should('be.visible');
      cy.findByLabelText('Nom d\'utilisateur Test').should('be.visible');

      // English fallback is used when french is not present
      cy.findByLabelText('Password Test').should('be.visible');
    });

    it('Should fallback to a general locale when a specific one is not present', () => {
      // Set up intercept
      cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');

      // Visit base page of our Login Journey with added locale
      cy.visit(`${loginBaseUrl}&locale=fr-ca#/`);

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Check override translations are applied correctly for added locale and fallback locale
      // fr-ca
      cy.findByRole('button', { name: 'Suivant Test frca', timeout: 10000 }).should('be.visible');
      // fr
      cy.findByLabelText('Nom d\'utilisateur Test').should('be.visible');
      // en
      cy.findByLabelText('Password Test').should('be.visible');
    });

    after(() => {
      // Login as admin and delete config translation overrides after tests
      cy.loginAsAdmin().then(() => {
        deleteOverrides('en');
        deleteOverrides('fr');
        deleteOverrides('fr-ca');
      });
    });
  });

  describe('Checks correct behavior of translated Theme/Journey with pages and nodes', () => {
    const journeyTemplate = 'Registration_translated_journey_template.json';
    const locationUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=Registration%20-%20Translated#/`;
    const defaultLocale = 'en';
    let preparedJourney;

    before(() => {
      // Prepare Journey template with correct Realm redirects and Identity Resources
      preparedJourney = prepareJourneyTemplate(journeyTemplate, { loginRealm, userRealm });

      // Login as admin and import translated Journey with translated Theme
      cy.importTreesViaAPI([preparedJourney]);
      cy.logout();
    });

    retryableBeforeEach(() => {
      // Visit base page of our translated Journey
      cy.visit(locationUrl);
    });

    after(() => {
      // Login as admin and delete translated Journey with translated Theme
      cy.deleteTreesViaAPI([preparedJourney]);
    });

    it('Check default Theme/Journey translations (EN), create user and verify email message', () => {
      // Select translation for this test
      const locale = 'en';
      const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
      const userEmail = `${userName}@test.com`;

      // Check main page of translated Journey
      verifyMainPageTranslations(locale);

      // Move to the next page of Journey
      cy.findByRole('button', { name: mainPageTranslations.messageNodePositiveButton[locale] }).click();

      // Check registration page of translated Journey
      verifyRegistrationPageTranslations(locale);

      // Fill out registration form for the user
      fillOutTranslatedRegistrationForm(userName, userEmail);

      // Proceed with registering user
      cy.findByRole('button', { name: mainPageTranslations.messageNodePositiveButton[locale] }).click();

      // Check success registration page of translated Journey
      verifySuccessRegistrationPageTranslations(locale);
    });

    it('Check CS Theme/Journey translations, create user and verify email message', () => {
      // Select translation for this test
      const locale = 'cs';
      const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
      const userEmail = `${userName}@test.com`;

      // Wait for a page to load
      cy.findByRole('button', { name: mainPageTranslations.messageNodePositiveButton[defaultLocale], timeout: 10000 }).should('be.visible');

      // Switch to CS locale
      cy.findByRole('link', { name: '| Čeština |' }).click();

      // Check main page of translated Journey
      verifyMainPageTranslations(locale);

      // Move to the next page of Journey
      cy.findByRole('button', { name: mainPageTranslations.messageNodePositiveButton[locale] }).click();

      // Check registration page of translated Journey
      verifyRegistrationPageTranslations(locale);

      // Fill out registration form for the user
      fillOutTranslatedRegistrationForm(userName, userEmail);

      // Proceed with registering user
      cy.findByRole('button', { name: mainPageTranslations.messageNodePositiveButton[locale] }).click();

      // Check success registration page of translated Journey
      verifySuccessRegistrationPageTranslations(locale);
    });

    // TODO: Re-enable this test when https://bugster.forgerock.org/jira/browse/OPENAM-21997 gets fixed
    xit('Check default fallback Theme/Journey translations (EN), create user and verify email message', () => {
      const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
      const userEmail = `${userName}@test.com`;

      // Wait for a page to load
      cy.findByRole('button', { name: mainPageTranslations.messageNodePositiveButton[defaultLocale], timeout: 10000 }).should('be.visible');

      // Switch to ES locale
      cy.findByRole('link', { name: '| Undefined locale |' }).click();

      // Check main page of translated Journey
      verifyMainPageTranslations(defaultLocale);

      // Move to the next page of Journey
      cy.findByRole('button', { name: mainPageTranslations.messageNodePositiveButton[defaultLocale] }).click();

      // Check registration page of translated Journey
      verifyRegistrationPageTranslations(defaultLocale);

      // Fill out registration form for the user
      fillOutTranslatedRegistrationForm(userName, userEmail);

      // Proceed with registering user
      cy.findByRole('button', { name: mainPageTranslations.messageNodePositiveButton[defaultLocale] }).click();

      // Check success registration page of translated Journey
      verifySuccessRegistrationPageTranslations(defaultLocale);
    });
  });
});
