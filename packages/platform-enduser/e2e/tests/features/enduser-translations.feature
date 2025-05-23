@cloud
Feature: Enduser UI Translations

  @C26987
  Scenario: Full translation: French translation
    Given "fr" language is set via API
    And browser locale is set to 'fr'
    And enduser logs into "All sections active" journey
    Then sidebar translations are in 'french'
    When dashboard translations are in 'french'
    And user clicks on 'Éditer le profil en français' button
    Then profile translations are in 'french'
    When user clicks on 'Mes applications en français' tab
    Then Applications page translations are in 'french'

  @C26990
  @forgeops
  Scenario: Locale fallback: Locales without an override added and non existing locale codes should fallback to english
    Given browser locale is set to 'en'
    When enduser logs into "Login" journey
    Then dashboard translations are in 'english'
    When browser locale is set to 'xw'
    And user reloads the page
    Then dashboard translations are in 'english'
    When "fr" language is set via API
    And browser locale is set to 'fr,it,mn'
    And user reloads the page
    Then dashboard translations are in 'french'
    When browser locale is set to 'mn,it,fr'
    And user reloads the page
    Then dashboard translations are in 'french'
    When "fr" language set is deleted via API
    And user reloads the page
    Then dashboard translations are in 'english'

  @C26991
  @forgeops
  Scenario: Default locale override: Override English locale
    When enduser logs into "Login" journey
    Then dashboard translations are in 'english'
    When "en" language is set via API
    And user reloads the page
    Then dashboard translations are in 'overriden english'
    When "en" language set is deleted via API
    And user reloads the page
    Then dashboard translations are in 'english'

  @C26988
  @forgeops
  Scenario: Special characters: Japanese translation
    Given "ja" language is set via API
    And browser locale is set to 'ja'
    When enduser logs into "Login" journey
    Then sidebar translations are in 'japanese'
    When dashboard translations are in 'japanese'
    And user clicks on 'プロフィール編集' button
    Then profile translations are in 'japanese'
    When user clicks on '私のフランス語アプリケーション' tab
    Then Applications page translations are in 'japanese'
