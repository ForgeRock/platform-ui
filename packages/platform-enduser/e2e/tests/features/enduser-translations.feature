@cloud
Feature: Enduser UI Translations

  Scenario: Full translation: French translation
    Given language override for 'fr' is added
    And browser locale is set to 'fr'
    And 'Enduser' is logged in to 'All sections active' journey
    Then sidebar translations are in 'french'
    When dashboard translations are in 'french'
    And user clicks on 'Éditer le profil en français' button
    Then profile translations are in 'french'
    When user clicks on 'Mes applications en français' tab
    Then Applications page translations are in 'french'

  @forgeops
  Scenario: Locale fallback: Locales without an override added and non existing locale codes should fallback to english
    Given browser locale is set to 'en'
    When 'Enduser' is logged in
    Then dashboard translations are in 'english'
    When browser locale is set to 'xw'
    And user reloads the page
    Then dashboard translations are in 'english'
    When language override for 'fr' is added
    And browser locale is set to 'fr,it,mn'
    And user reloads the page
    Then dashboard translations are in 'french'
    When browser locale is set to 'mn,it,fr'
    And user reloads the page
    Then dashboard translations are in 'french'
    When language override for 'fr' is deleted
    And user reloads the page
    Then dashboard translations are in 'english'

  @forgeops
  Scenario: Default locale override: Override English locale
    When 'Enduser' is logged in
    Then dashboard translations are in 'english'
    When language override for 'en' is added
    And user reloads the page
    Then dashboard translations are in 'overriden english'
    When language override for 'en' is deleted
    And user reloads the page
    Then dashboard translations are in 'english'

  @forgeops
  Scenario: Special characters: Japanese translation
    Given language override for 'ja' is added
    And browser locale is set to 'ja'
    When 'Enduser' is logged in
    Then sidebar translations are in 'japanese'
    When dashboard translations are in 'japanese'
    And user clicks on 'プロフィール編集' button
    Then profile translations are in 'japanese'
    When user clicks on '私のフランス語アプリケーション' tab
    Then Applications page translations are in 'japanese'
