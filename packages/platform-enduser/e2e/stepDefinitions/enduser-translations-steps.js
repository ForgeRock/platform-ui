import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { random } from 'lodash';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import { addOverrides, deleteOverrides } from '../api/localizationApi.e2e';
import { frTranslations, jaTranslations, enTranslations } from '../fixtures/enduser-locales-translations';
import { importJourneysViaAPI, deleteJourneysViaAPI } from '../utils/manageJourneys';

// TODO: Delete Features and env conditionals when https://pingidentity.atlassian.net/browse/IAM-8259 is resolved

before(() => {
  if (Cypress.spec.relative.includes('enduser-translations.feature')) {
    cy.loginAsAdmin().then(() => {
      createIDMUser().then((res) => {
        Cypress.env('endUserName', res.body.userName);
        Cypress.env('endUserID', res.body._id);
      });

      if (Cypress.env('IS_FRAAS')) {
        // Override default Login journey, new one includes a theme with all enduser profile sections active
        importJourneysViaAPI(['QA-Default_Login_with_all_enduser_sections_active.json']);
      }

      // Mock requests for social identity providers
      cy.intercept('GET', '**/am/json/realms/root/realms/alpha/selfservice/socialIdentityProviders', { fixture: 'social-identity-provider-mock.json' });
      cy.intercept('GET', '**/openidm/managed/alpha_user/**', (req) => {
        req.continue((res) => {
          res.body.aliasList = [`google-${random(Number.MAX_SAFE_INTEGER)}`];
        });
      });

      // Mock requests for Consent data
      cy.intercept('GET', '**/openidm/consent*', { fixture: 'enduser-consent-mock.json' });

      // Mock requests for Trusted Devices data
      cy.intercept('GET', '**/am/json/realms/root/realms/alpha/users/*/devices/profile*', { fixture: 'enduser-trusted-device-data-mock.json' });
      cy.logout();
    });
  }
});

after(() => {
  if (Cypress.spec.relative.includes('enduser-translations.feature')) {
    cy.logout();
    cy.loginAsAdmin().then(() => {
      // Delete locale overrides for all languages added on the test
      deleteOverrides('ja');
      deleteOverrides('fr', false);
      deleteOverrides('en', false);

      if (Cypress.env('IS_FRAAS')) {
        // Delete all dependencies added tot he tenant and restore default Login journey
        deleteJourneysViaAPI(['QA-Default_Login_with_all_enduser_sections_active.json']);
      }
      // Delete enduser created for testing
      deleteIDMUser(Cypress.env('endUserID'));

      // Restore 'en' language on the Cypress browser
      Cypress.env('LOCALE', 'en');

      cy.logout();
    });
  }
});

Given('language override for {string} is added', (locale) => {
  switch (locale) {
    case 'fr':
      addOverrides('fr', frTranslations);
      break;
    case 'ja':
      addOverrides('ja', jaTranslations);
      break;
    case 'en':
      addOverrides('en', enTranslations);
      break;
    default:
      break;
  }
});

When('language override for {string} is deleted', (locale) => {
  deleteOverrides(locale);
});

Then('sidebar translations are in {string}', (language) => {
  switch (language) {
    case 'french':
      cy.findByRole('link', { name: 'Mes applications en français' }).should('be.visible');
      cy.findByRole('link', { name: 'Tableau de bord' }).should('be.visible');
      cy.findByRole('link', { name: 'Profil' }).should('be.visible');
      break;
    case 'japanese':
      cy.findByRole('link', { name: 'プロフィール' }).should('be.visible');
      cy.findByRole('link', { name: '私のフランス語アプリケーション' }).should('be.visible');
      cy.findByRole('link', { name: 'ダッシュボード' }).should('be.visible');
      break;
    default:
      break;
  }
});

Then('dashboard translations are in {string}', (language) => {
  switch (language) {
    case 'french':
      cy.findByRole('button', { name: 'Éditer le profil en français' }).should('be.visible');
      break;
    case 'japanese':
      cy.findByRole('button', { name: 'プロフィール編集' }).should('be.visible');
      break;
    case 'english':
      cy.findByRole('button', { name: 'Edit Your Profile' }).should('be.visible');
      break;
    case 'overriden english':
      cy.findByRole('button', { name: 'Overriden button' }).should('be.visible');
      break;
    default:
      break;
  }
});

Then('profile translations are in {string}', (language) => {
  switch (language) {
    case 'french':
      cy.findByRole('heading', { name: 'Sécurité du compte en français' }).should('be.visible');
      cy.findByText('Gérez votre mot de passe et vos appareils de confiance').should('be.visible');
      cy.findByRole('heading', { name: 'Nom d\'utilisateur' }).should('be.visible');
      cy.findByRole('heading', { name: 'Mot de passe' }).should('be.visible');
      cy.findByRole('heading', { name: 'Vérification en deux étapes' }).should('be.visible');
      cy.findByRole('heading', { name: 'Questions de sécurité' }).should('be.visible');
      cy.findAllByText('Réinitialiser').should('be.visible').and('have.attr', 'href');

      // Open Edit personal info modal and verify translations inside
      cy.findByRole('button', { name: 'Éditer les informations personnelles en français' }).should('be.visible').and('be.enabled').click();
      cy.findByRole('heading', { name: 'Détails de l\'utilisateur' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Prénom' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Nom de famille' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Courriel' }).should('be.visible');
      cy.findByRole('button', { name: 'Close' }).click();

      // Open Update Profile Picture modal and verify translations inside
      cy.scrollTo('top');
      cy.findByRole('button', { name: 'Modifier l\'image de profil' }).click();
      cy.findByRole('heading', { name: 'Modifier l\'image de profil' }).should('be.visible');
      cy.findByText('Vous pouvez télécharger une image de profil en utilisant le champ ci-dessous').should('be.visible');
      cy.findByText('L\'image sera redimensionnée pour s\'adapter à la boîte de l\'avatar').should('be.visible');
      cy.findByText('Nous recommandons une image de 200x200 pixels pour une meilleure qualité').should('be.visible');
      cy.findByRole('heading', { name: 'Conseils' }).should('be.visible');
      cy.findByRole('textbox', { name: 'URL de l\'image de profil' }).should('be.visible');
      cy.findByRole('button', { name: 'Close' }).click();

      // Social Login translations
      cy.findByRole('heading', { name: 'Connexion sociale' }).should('be.visible');
      cy.findByText('Connectez-vous à votre compte en utilisant des fournisseurs d\'identité sociale.').should('be.visible');
      cy.findByRole('tab', { name: 'Google Google Connecté' }).should('be.visible').click();
      cy.findByRole('button', { name: 'Déconnecter' }).should('be.visible').click();
      cy.findByRole('heading', { name: 'Déconnecter google?' }).should('be.visible');
      cy.findByText('Êtes-vous sûr de vouloir déconnecter google en tant que fournisseur d\'identité sociale?').should('be.visible');
      cy.findByRole('button', { name: 'Annuler', exact: false }).should('be.visible')
        .siblings().should('have.text', 'Déconnecter')
        .click();
      cy.findByRole('alert', { name: 'google déconnecté avec succès.' }).should('be.visible').within(() => { cy.findByRole('button', { name: 'Close' }).click({ force: true }); });
      cy.findByRole('tab', { name: 'Google Google Non connecté' }).should('be.visible');

      // Trusted devices card translations
      // cy.findByRole('heading', { name: 'Appareils de confiance en français' }).should('be.visible');
      // cy.findByText('Les appareils qui ont accédé à votre compte.').should('be.visible');
      cy.findByRole('heading', { name: 'Mac (Browser)' }).scrollIntoView().should('be.visible').click();
      cy.findByRole('heading', { name: 'Système d\'exploitation' }).should('be.visible');
      cy.findByRole('heading', { name: 'Navigateur' }).should('be.visible');
      cy.findByRole('heading', { name: 'Processeur' }).should('be.visible');
      // cy.findByRole('button', { name: 'Supprimer l\'appareil', exact: false }).should('be.visible');
      // TODO: Blocked by https://pingidentity.atlassian.net/browse/IAM-7396, uncomment when fixed (All commented lines in this Trusted Devices section)

      // Oauth Applications card translations
      cy.findByRole('heading', { name: 'Applications autorisées' }).should('be.visible');
      cy.findByText('Applications auxquelles vous avez donné accès à vos informations personnelles.').should('be.visible');
      cy.findByRole('tab', { name: 'endUserUIClient endUserUIClient' }).should('be.visible').click();
      cy.findByText('Partagé avec endUserUIClient').should('be.visible');
      cy.findByText('Expirééé').should('be.visible');
      cy.findByRole('button', { name: 'Révoquer l\'accès' }).should('be.visible').click();
      cy.findByRole('heading', { name: 'Révoquer l\'accès au compte pour endUserUIClient?' }).should('be.visible');
      cy.findByText('endUserUIClient n\'aura plus accès aux données de votre compte.').should('be.visible');
      cy.findByRole('button', { name: 'Close' }).click({ force: true });

      // Preferences card translations
      cy.findByRole('heading', { name: 'Préférences' }).should('be.visible');
      cy.findByText('Définissez vos préférences de communication.').should('be.visible');
      cy.findByRole('heading', { name: 'Envoyez-moi des offres spéciales et des services' }).should('be.visible');
      cy.findByRole('heading', { name: 'Envoyez-moi des nouvelles et des mises à jour' }).should('be.visible');

      // Consent card translations
      cy.findByRole('heading', { name: 'Partage des données personnelles' }).should('be.visible');
      cy.findByRole('heading', { name: 'Contrôlez comment vos données sont partagées avec des tiers.' }).should('be.visible');
      cy.findByText('Contrôlez comment vos données sont partagées avec des tiers.').should('be.visible');
      cy.findByRole('button', { name: 'Autoriser' }).should('be.visible').click();
      cy.findByRole('heading', { name: 'Autoriser l\'accès' }).should('be.visible');
      cy.findByText('Accès au compte').should('be.visible');
      cy.findByRole('button', { name: 'Annuler', exact: false }).should('be.visible')
        .siblings().should('have.text', 'Autoriser')
        .click();
      cy.findByRole('alert', { name: 'Votre profil a été mis à jour.' }).should('be.visible').within(() => { cy.findByRole('button', { name: 'Close' }).click({ force: true }); });
      cy.findByRole('button', { name: 'Refuser' }).should('be.visible');

      // Account Control card translations
      cy.findByRole('heading', { name: 'Contrôles du compte' }).should('be.visible');
      cy.findByText('Téléchargez ou supprimez les données de votre compte.').should('be.visible');
      cy.findByRole('heading', { name: 'Téléchargez vos données' }).should('be.visible').click();
      cy.findByText('Téléchargez les données de votre profil de compte, y compris les informations personnelles, l\'activité du compte, les données des appareils, les accords de confidentialité et de consentement.').should('be.visible');
      cy.findByRole('heading', { name: 'Supprimer le compte' }).should('be.visible').click();
      cy.findByText('Supprimez définitivement toutes les données de votre compte.').should('be.visible');
      cy.findByRole('button', { name: 'Supprimer le compte' }).should('be.visible').click();
      cy.findByRole('heading', { name: 'Supprimer définitivement votre compte?' }).should('be.visible').click();
      cy.findByText('Êtes-vous sûr de vouloir supprimer définitivement les données de votre compte?').should('be.visible');
      cy.findByText('Cette action est irréversible.').should('be.visible');
      cy.findByRole('button', { name: 'Close' }).click({ force: true });
      break;
    case 'japanese':
      cy.findByRole('button', { name: '個人情報の編集' }).should('be.visible').and('be.enabled');
      cy.findByRole('heading', { name: 'アカウントのセキュリティ' }).should('be.visible');

      // Trusted devices card translations
      // cy.findByRole('heading', { name: '信頼できる家電製品' }).should('be.visible');
      // cy.findByText('アカウントにアクセスしたデバイス.').should('be.visible');
      // TODO: Blocked by https://pingidentity.atlassian.net/browse/IAM-7396, uncomment when fixed
      break;
    default:
      break;
  }
});

Then('Applications page translations are in {string}', (language) => {
  switch (language) {
    case 'french':
      cy.findByRole('heading', { name: 'Applications en français' }).should('be.visible');
      cy.findByRole('searchbox', { name: 'Rechercher en français' }).should('be.visible');
      break;
    case 'japanese':
      cy.findByRole('heading', { name: 'アプリケーション' }).should('be.visible');
      cy.findByRole('searchbox', { name: '検索' }).should('be.visible');
      break;
    default:
      break;
  }
});
