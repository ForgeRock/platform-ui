/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const DEFAULT_THEME_PARAMS = {
  accountCardBackgroundColor: '#ffffff',
  accountCardHeaderColor: '#23282e',
  accountCardInnerBorderColor: '#e7eef4',
  accountCardInputBackgroundColor: '#ffffff',
  accountCardInputBorderColor: '#c0c9d5',
  accountCardInputLabelColor: '#5e6d82',
  accountCardInputSelectColor: '#e4f4fd',
  accountCardInputSelectHoverColor: '#f6f8fa',
  accountCardInputTextColor: '#23282e',
  accountCardOuterBorderColor: '#e7eef4',
  accountCardShadow: 3,
  accountCardTabActiveColor: '#e4f4fd',
  accountCardTabActiveBorderColor: '#109cf1',
  accountCardTextColor: '#5e6d82',
  accountFooter: `<div class="d-flex justify-content-center py-4 w-100"><span class="pr-1">© ${new Date().getFullYear()}</span>\n<a href="#" target="_blank" class="text-body">My Company, Inc</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Privacy Policy</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Terms & Conditions</a></div>`,
  accountFooterEnabled: false,
  accountFooterScriptTag: '',
  accountFooterScriptTagEnabled: false,
  accountNavigationBackgroundColor: '#ffffff',
  accountNavigationTextColor: '#455469',
  accountNavigationToggleBorderColor: '#e7eef4',
  accountPageSections: {
    personalInformation: { enabled: true },
    accountSecurity: {
      enabled: true,
      subsections: {
        username: { enabled: true },
        password: { enabled: true },
        twoStepVerification: { enabled: true },
        securityQuestions: { enabled: false },
      },
    },
    social: { enabled: false },
    trustedDevices: { enabled: true },
    oauthApplications: { enabled: false },
    preferences: { enabled: false },
    consent: { enabled: false },
    accountControls: { enabled: false },
  },
  accountTableRowHoverColor: '#f6f8fa',
  backgroundColor: '#ffffff',
  backgroundImage: '',
  bodyText: '#23282e',
  boldLinks: false,
  buttonFocusBorderColor: '#0778d6',
  buttonRounded: 5,
  dangerColor: '#dc3545',
  darkColor: '#23282e',
  favicon: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg',
  fontFamily: 'Open Sans',
  infoColor: '#109cf1',
  journeyA11yAddFallbackErrorHeading: true,
  journeyCardBackgroundColor: '#ffffff',
  journeyCardHeaderBackgroundColor: '#ffffff',
  journeyCardShadow: 3,
  journeyCardBorderRadius: 4,
  journeyCardTextColor: '#5e6d82',
  journeyCardTitleColor: '#23282e',
  journeyFloatingLabels: true,
  journeyFocusElement: 'header',
  journeyFocusFirstFocusableItemEnabled: false,
  journeyFooter: `<div class="d-flex justify-content-center py-4 w-100"><span class="pr-1">© ${new Date().getFullYear()}</span>\n<a href="#" target="_blank" class="text-body">My Company, Inc</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Privacy Policy</a><a href="#" target="_blank" style="color: #0000ee" class="pl-3 text-body">Terms & Conditions</a></div>`,
  journeyFooterEnabled: false,
  journeyFooterScriptTag: '',
  journeyFooterScriptTagEnabled: false,
  journeyHeader: '<div class="d-flex justify-content-center py-4 flex-grow-1">Header Content</div>',
  journeyHeaderEnabled: false,
  journeyHeaderSkipLinkEnabled: false,
  journeyInputBackgroundColor: '#ffffff',
  journeyInputBorderColor: '#c0c9d5',
  journeyInputLabelColor: '#5e6d82',
  journeyInputSelectColor: '#e4f4fd',
  journeyInputSelectHoverColor: '#f6f8fa',
  journeyInputTextColor: '#23282e',
  journeyRememberMeEnabled: false,
  journeyRememberMeLabel: '',
  journeyTheaterMode: false,
  journeyJustifiedContent: '',
  journeyJustifiedContentEnabled: false,
  journeyJustifiedContentMobileViewEnabled: false,
  journeyLayout: 'card',
  journeySignInButtonPosition: 'flex-column',
  lightColor: '#f6f8fa',
  linkActiveColor: '#0a6eab',
  linkActiveColorOnDark: '#0a6eab',
  linkColor: '#109cf1',
  linkColorOnDark: '#109cf1',
  linkedTrees: [],
  logo: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg',
  logoAltText: 'Logo',
  logoEnabled: true,
  logoHeight: '43',
  logoProfile: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter-full.svg',
  logoProfileAltText: 'Logo',
  logoProfileCollapsed: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg',
  logoProfileCollapsedAltText: 'Logo',
  logoProfileHeight: '24',
  name: '',
  pageTitle: '#23282e',
  primaryColor: '#324054',
  primaryOffColor: '#242E3C',
  profileBackgroundColor: '#ffffff',
  profileMenuHighlightColor: '#f3f5f8',
  profileMenuTextHighlightColor: '#455469',
  profileMenuHoverColor: '#f3f5f8',
  profileMenuHoverTextColor: '#455469',
  secondaryColor: '#69788b',
  successColor: '#2ed47a',
  switchBackgroundColor: '#c0c9d5',
  textColor: '#ffffff',
  topBarBackgroundColor: '#ffffff',
  topBarBorderColor: '#e7eef4',
  topBarHeaderColor: '#23282e',
  topBarTextColor: '#69788b',
  warningColor: '#ffb946',
};

export default {
  DEFAULT_THEME_PARAMS,
};
