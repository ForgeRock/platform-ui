@forgeops
@cloud
@smoke
Feature: Enduser Login
  As an enduser
  I want to verify the login functionality
  So that I can ensure the application handles login and logout correctly

  Background:
    Given enduser account is created via API
    And admin is logged out
    And user navigates to "Login" journey

  # Test Cases: C20237
  Scenario: Correct Login credentials
    When user enters a "valid" username
    And user enters a "valid" password
    And clicks on the Login button 1 time
    Then user should be redirected to User dashboard
    And page url contains "/dashboard"

  # Test cases: C20211, C20210
  Scenario Outline: Login with <usernameType> username and <passwordType> password
    When user enters a <usernameType> username
    And user enters a <passwordType> password
    And clicks on the Login button 1 time
    # Then "Login failure" error message is displayed // This scenario is locked by bug https://bugster.forgerock.org/jira/browse/IAM-1930 waiting for resolution (same as old code)
    Then page url does not contain "/dashboard"
    Examples:
      | usernameType | passwordType |
      | "invalid"    | "valid"      |
      | "valid"      | "invalid"    |

  # Test cases: C20746
  Scenario: Login with empty username and password
    When clicks on the Login button 6 times
    Then "Login failure" error message is displayed
