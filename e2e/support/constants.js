/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Admin pages
 */
export const ADMIN_PAGES = {
  DASHBOARD: { label: 'Dashboard', url: 'dashboard/overview' },
  MONITORING: { label: 'monitoring', url: 'monitoring' },
  APPLICATIONS: { label: 'Applications', url: 'applications' },
  OAUTH2_CLIENTS: { label: 'OAuth2 Clients', url: 'oauth-clients' },
  JOBS: { label: 'Jobs', url: 'jobs' },
  GATEWAYS_AND_AGENTS: { label: 'Gateways & Agents', url: 'gateways-agents' },
  HOSTED_PAGES: { label: 'Hosted Pages', url: 'hosted-pages' },
  IDENTITIES_MANAGE: { label: 'Identities/Manage', url: 'managed-identities' },
  IDENTITIES_CONNECT: { label: 'Identities/Connect', url: 'connect' },
  IDENTITIES_IMPORT: { label: 'Identities/Import', url: 'import' },
  IDENTITIES_CONFIGURE: { label: 'Identities/Configure', url: 'configure' },
  EVENT_HOOKS: { label: 'Event Hooks', url: 'events' },
  JOURNEYS: { label: 'Journeys', url: 'journeys' },
  EMAIL_TEMPLATES: { label: 'Email/Templates', url: 'email/templates' },
  EMAIL_PROVIDER: { label: 'Email/Provider', url: 'provider' },
  SCRIPTS_AUTH_SCRIPTS: { label: 'Scripts/Auth Scripts', url: 'scripts' },
  SCRIPTS_CUSTOM_ENDPOINTS: { label: 'Scripts/Custom Endpoints', url: 'customEndpoints' },
  SECURITY_PASSWORD_POLICY: { label: 'Security/Password Policy', url: 'password-policy' },
  SECURITY_SECURITY_QUESTIONS: { label: 'Security/Security Questions', url: 'security-questions' },
  TERMS_AND_CONDITIONS: { label: 'Terms & Conditions', url: 'terms-conditions' },
  USER_PROFILE: { label: 'User/Profile', url: 'profile' },
  USER_TENANT_SETTINGS: { label: 'User/Tenant Settings', url: 'tenant-settings/global-settings' },
  REALM_REALM_SETTINGS: { label: 'Realm/Realm Settings', url: 'realm/details' },
};

/**
 * Journeys
 */
export const JOURNEYS = {
  DEFAULT_REGISTRATION: { name: 'Registration', path: 'Registration' },
  DEFAULT_LOGIN: { name: 'Login', path: 'Login' },
  SCRIPTED_CONFIRMATION_CALLBACKS: { name: 'Scripted Confirmation Callbacks', path: 'QA%20-%20Scripted%20Decision%20Node%20with%20ConfirmationCallbacks#/' },
  ALL_SECTIONS_ACTIVE: { name: 'All sections active', path: 'QA%20-%20Default%20Login%20with%20all%20enduser%20sections%20active' },
  GO_TO_ON_FAIL_URL_VALIDATION: { name: 'gotoOnFail URL validation', path: 'QA%20-%20gotoOnFail%20URL%20validation', fileName: 'QA-gotoOnFail_URL_validation_template' },
  REGISTRATION_WITHOUT_EMAIL: { name: 'Registration without email', path: 'QA%20-%20Registration%20without%20email', fileName: 'QA-Registration_without_email_template' },
  PASSWORD_RESET_BY_KBA: { name: 'Password reset by KBA', path: 'QA%20-%20Password%20reset%20by%20KBA', fileName: 'QA-Password_reset_by_KBA_template' },
  REGISTRATION_WITH_ES_LOCALE: { name: 'Registration with ES locale', path: 'Registration&locale=es#' },
  AUXILIAR: { name: 'Auxiliar', path: 'Auxiliar%20journey', fileName: 'QA-Auxiliar_Journey' },
};

/**
 * Maps UI field labels to their corresponding JSON keys for theme API calls.
 */
export const THEME_UI_FIELD_MAPPING = {
  'Brand Color': 'primaryColor',
};

/**
 * Stores the values that some data can have according the environment in which the tests are running (cloud or forgeops)
 */

const isCloud = Cypress.env('IS_FRAAS');
export const ENV_VALUES = {
  DEFAULT_THEME: isCloud ? 'Starter Theme' : 'ForgeRock Theme',
};
