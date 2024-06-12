@forgeops
@cloud
Feature: End user login
As an end user
I want to verify the login functionality
So that I can ensure the application handles login and logout correctly

Background:
  Given There is an end user account created
  And User navigates to "end user login" page

# Test Cases: C20237
Scenario: Correct Login credentials
  When User enters a "valid" username
  And User enters a "valid" password
  And Clicks on the Login button 1 time
  Then User should be redirected to User dashboard
  And The URL path "should" contain "/dashboard"

# Test cases: C20211, C20210
Scenario Outline: Login with <usernameType> username and <passwordType> password
  When User enters a <usernameType> username 
  And User enters a <passwordType> password
  And Clicks on the Login button 1 time
  # Then User should see "Login failure" error message // This scenario is locked by bug https://bugster.forgerock.org/jira/browse/IAM-1930 waiting for resolution (same as old code)
  And The URL path <urlStatus> contain "/dashboard"
  Examples:
  | usernameType | passwordType | urlStatus     |
  | "invalid"      | "valid"    | "should not"  |
  | "valid"        | "invalid"  | "should not"  |

# Test cases: C20746
Scenario: Login with empty username and password
  When Clicks on the Login button 6 times
  Then User should see "Login failure" error message