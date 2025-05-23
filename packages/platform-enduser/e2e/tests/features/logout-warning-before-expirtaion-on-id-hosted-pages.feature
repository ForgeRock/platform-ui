@cloud @forgeops
Feature: Logout warning before expiration on ID hosted pages

  Background:
    Given admin logs into the tenant
    And enduser account is created via API

  @C14021
  Scenario: maxIdleExpirationTime is set correctly
    When session service in AM console is added via API with following params
      | Param             | Value     |
      | Maximum Idle Time | 999999999 |
    And enduser logs into "Login" journey
    Then enduser dashboard is loaded with enduser data
    And maxIdleExpirationTime value is set correctly to 999999999 minutes

  @C27574
  Scenario: Enduser session is ended after Maximum Idle Time is over
    When session service in AM console is added via API with following params
      | Param             | Value |
      | Maximum Idle Time | 1     |
    And enduser logs into "Login" journey
    Then "You will be signed out soon" modal is displayed after user is iddle for 20 seconds
    And page title is "Sign In" after user is idle for 62 seconds

  @C29485
  Scenario: Enduser session is ended when clicking Sign Out button in session timeout modal
    When session service in AM console is added via API with following params
      | Param             | Value |
      | Maximum Idle Time | 1     |
    And enduser logs into "Login" journey
    Then "You will be signed out soon" modal is displayed after user is iddle for 20 seconds
    When user clicks on "Sign Out" button
    Then page title is "Sign In"

  @C27575
  Scenario: Enduser session is not ended when clicking Stay Signed In button in session timeout modal
    When session service in AM console is added via API with following params
      | Param             | Value |
      | Maximum Idle Time | 1     |
    And enduser logs into "Login" journey
    Then "You will be signed out soon" modal is displayed after user is iddle for 20 seconds
    When user clicks on "Stay Signed In" button
    Then "You will be signed out soon" modal no longer exists
    And enduser dashboard is loaded with enduser data
