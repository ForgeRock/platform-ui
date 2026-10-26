@smoke
Feature: Default enduser login

  Background:
    Given enduser account is created via API
    And admin is logged out
    And user navigates to "Login" journey

  @forgeops @cloud
  Scenario: [C20749] Valid enduser login flow
    When user types the stored value of "endUserName" in "User Name" field
    And user types the stored value of "endUserPassword" in "Password" field
    And user clicks on "Next" button
    Then enduser dashboard is loaded with enduser data
    And page url contains "/dashboard"
    And text "Sign In" does not exist

  @forgeops @cloud
  Scenario: [C20746] Login with empty credentials
    When user clicks on "Next" button
    Then page url does not contain "/dashboard"
    And page url contains "Login"
    And text "Welcome" does not exist
    And the message "Sign In" should be present

  @forgeops @cloud
  Scenario: [C20747] Login with existing user and wrong password
    When user types the stored value of "endUserName" in "User Name" field
    And user types "WrongPassword1." in the field "Password"
    And user clicks on "Next" button
    Then page url does not contain "/dashboard"
    And page url contains "Login"
    And text "Welcome" does not exist
    And the message "Sign In" should be present

  @forgeops @cloud
  Scenario: [C20748] Login with wrong username and correct password
    When user types "incorrectUsername" in the field "User Name"
    And user types the stored value of "endUserPassword" in "Password" field
    And user clicks on "Next" button
    Then page url does not contain "/dashboard"
    And page url contains "Login"
    And text "Welcome" does not exist
    And the message "Sign In" should be present

  @forgeops
  Scenario: [C29495] Forgeops - Login error message
    When user types "wronguser" in the field "User Name"
    And user types "WrongPassword1." in the field "Password"
    And user clicks on "Next" button
    Then page url does not contain "/dashboard"
    And the message "Sign In" should be present
    And "Login failure" error message is displayed
    When user reloads the page
    And user types the stored value of "endUserName" in "User Name" field
    And user types "WrongPassword1." in the field "Password"
    And user clicks on "Next" button
    Then page url does not contain "/dashboard"
    And the message "Sign In" should be present
    And "Login failure" error message is displayed
    When user reloads the page
    And user types "wronguser" in the field "User Name"
    And user types the stored value of "endUserPassword" in "Password" field
    And user clicks on "Next" button
    Then page url does not contain "/dashboard"
    And the message "Sign In" should be present
    And "Login failure" error message is displayed

  @forgeops @cloud @vpat
  Scenario Outline: [C29488] Attempt to login 6 times in a row with empty or wrong credentials - Login Failure
    When user tries to login 6 times with "<userName>" username and "<password>" password
    Then "Login failure" error message is displayed
    And page url does not contain "/dashboard"
    And page url contains "Login"
    And text "Welcome" does not exist
    And the message "Sign In" should be present
    And "User Name" field has focus
    Examples:
      | userName  | password        |
      | empty     | empty           |
      | wronguser | WrongPassword1. |
      | empty     | WrongPassword1. |

  @cloud
  Scenario: [C20750] Make 6 failed logins in a row - user is locked
    When user tries to login 6 times with "endUserName" username and "WrongPassword1." password
    And user types the stored value of "endUserName" in "User Name" field
    And user types the stored value of "endUserPassword" in "Password" field
    And user clicks on "Next" button
    Then "User Locked Out." error message is displayed
    And page url does not contain "/dashboard"
    And page url contains "Login"
    And text "Welcome" does not exist
    And the message "Sign In" should be present
    And text "Login failure" does not exist
    When admin logs into the tenant
    And admin navigates to "Identities/Manage" page
    And page title is "Manage Identities"
    And user searches "endUserName" on search box
    And the value of the "Status" column for the "endUserName" item in the current table is "Inactive"
    # TODO: uncomment after IAM-12027 (https://pingidentity.atlassian.net/browse/IAM-12027) is fixed —
    # the Status dropdown renders empty when accountStatus casing doesn't match the enum
    # And user clicks on "endUserName" cell on table
    # And the value of the "Status" field is "Inactive"

  @forgeops @cloud
  Scenario: [C29494] Create an account link navigation
    When user clicks on "Create an account" link
    Then the message "Sign Up" should be present
    And page url contains "Login#/service/Registration"
    When user navigates back to previous Journey page
    Then the message "Sign In" should be present
    And text "Sign Up" does not exist
    And page url does not contain "/service/Registration"

  @forgeops @cloud
  Scenario: [C29497] Forgot username link navigation
    When user clicks on "Forgot username?" link
    Then the message "Forgotten Username" should be present
    And page url contains "Login#/service/ForgottenUsername"
    When user navigates back to previous Journey page
    Then the message "Sign In" should be present
    And text "Forgotten Username" does not exist
    And page url does not contain "/service/ForgottenUsername"

  @forgeops @cloud
  Scenario: [C29498] Forgot password link navigation
    When user clicks on "Forgot password?" link
    Then the message "Reset Password" should be present
    And page url contains "Login#/service/ResetPassword"
    When user navigates back to previous Journey page
    Then the message "Sign In" should be present
    And text "Reset Password" does not exist
    And page url does not contain "/service/ResetPassword"
