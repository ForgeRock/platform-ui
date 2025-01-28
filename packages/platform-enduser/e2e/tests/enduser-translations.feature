@cloud
Feature: Enduser UI Translations

  Scenario: Full translation: French translation
    Given Language override for 'fr' is added
    And Browser locale is set to 'fr'
    And 'Enduser' is logged in to 'All sections active' journey
    Then Sidebar translations are in 'french'
    When Dashboard translations are in 'french'
    And User clicks on 'Éditer le profil en français' button
    Then Profile translations are in 'french'
    When User clicks on 'Mes applications en français' tab
    Then Applications page translations are in 'french'

  @forgeops
  Scenario: Locale fallback: Locales without an override added and non existing locale codes should fallback to english
    Given Browser locale is set to 'en'
    When 'Enduser' is logged in
    Then Dashboard translations are in 'english'
    When Browser locale is set to 'xw'
    And User reloads the page
    Then Dashboard translations are in 'english'
    When Language override for 'fr' is added
    And Browser locale is set to 'fr,it,mn'
    And User reloads the page
    Then Dashboard translations are in 'french'
    When Browser locale is set to 'mn,it,fr'
    And User reloads the page
    Then Dashboard translations are in 'french'
    When Language override for 'fr' is deleted
    And User reloads the page
    Then Dashboard translations are in 'english'

  @forgeops
  Scenario: Default locale override: Override English locale
    When 'Enduser' is logged in
    Then Dashboard translations are in 'english'
    When Language override for 'en' is added
    And User reloads the page
    Then Dashboard translations are in 'overriden english'
    When Language override for 'en' is deleted
    And User reloads the page
    Then Dashboard translations are in 'english'

  @forgeops
  Scenario: Special characters: Japanese translation
    Given Language override for 'ja' is added
    And Browser locale is set to 'ja'
    When 'Enduser' is logged in
    Then Sidebar translations are in 'japanese'
    When Dashboard translations are in 'japanese'
    And User clicks on 'プロフィール編集' button
    Then Profile translations are in 'japanese'
    When User clicks on '私のフランス語アプリケーション' tab
    Then Applications page translations are in 'japanese'
