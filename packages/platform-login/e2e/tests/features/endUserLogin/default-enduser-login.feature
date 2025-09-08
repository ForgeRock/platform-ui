@smoke
Feature: Default enduser login

  Background:
    Given enduser account is created via API
    And admin is logged out
    And user navigates to "Login" journey

  @C20749
  @forgeops @cloud
  Scenario: Valid enduser login flow
    When user types the stored value of "endUserName" in "User Name" field
    And user types the stored value of "endUserPassword" in "Password" field
    And user clicks on "Next" button
    Then enduser dashboard is loaded with enduser data
    And page url contains "/dashboard"
    And text "Sign In" does not exist

  @C20746
  @forgeops @cloud
  Scenario: Login with empty credentials
    When user clicks on "Next" button
    Then page url does not contain "/dashboard"
    And page url contains "Login"
    And text "Welcome" does not exist
    And the message "Sign In" should be present

  @C20747
  @forgeops @cloud
  Scenario: Login with existing user and wrong password
    When user types the stored value of "endUserName" in "User Name" field
    And user types "WrongPassword1." in the field "Password"
    And user clicks on "Next" button
    Then page url does not contain "/dashboard"
    And page url contains "Login"
    And text "Welcome" does not exist
    And the message "Sign In" should be present

  @C20748
  @forgeops @cloud
  Scenario: Login with wrong username and correct password
    When user types "incorrectUsername" in the field "User Name"
    And user types the stored value of "endUserPassword" in "Password" field
    And user clicks on "Next" button
    Then page url does not contain "/dashboard"
    And page url contains "Login"
    And text "Welcome" does not exist
    And the message "Sign In" should be present

  @C29495
  @forgeops
  Scenario: Forgeops - Login error message
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

  @C29488
  @forgeops @cloud
  Scenario Outline: attempt to login 6 times in a row with empty or wrong credentials - Login Failure
    When user tries to login 6 times with "<userName>" username and "<password>" password
    Then "Login failure" error message is displayed
    And page url does not contain "/dashboard"
    And page url contains "Login"
    And text "Welcome" does not exist
    And the message "Sign In" should be present
    Examples:
    | userName     | password         |
    | empty        | empty            |
    | wronguser    | WrongPassword1.  |
    | empty        | WrongPassword1.  |

  @C20750
  @cloud
  Scenario: Make 6 failed logins in a row - user is locked
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
    And user searches "endUserName" on search box
    And user clicks on "endUserName" cell on table
    Then the value of the "Status" field is "Inactive"

  @C29494
  @forgeops @cloud
  Scenario: Create an account link navigation 
    When user clicks on "Create an account" link
    Then the message "Sign Up" should be present
    And page url contains "Login#/service/Registration"
    When user navigates back to previous Journey page
    Then the message "Sign In" should be present
    And text "Sign Up" does not exist
    And page url does not contain "/service/Registration"

  @C29497
  @forgeops @cloud
  Scenario: Forgot username link navigation 
    When user clicks on "Forgot username?" link
    Then the message "Forgotten Username" should be present
    And page url contains "Login#/service/ForgottenUsername"
    When user navigates back to previous Journey page
    Then the message "Sign In" should be present
    And text "Forgotten Username" does not exist
    And page url does not contain "/service/ForgottenUsername"

  @C29498
  @forgeops @cloud
  Scenario: Forgot password link navigation 
    When user clicks on "Forgot password?" link
    Then the message "Reset Password" should be present
    And page url contains "Login#/service/ResetPassword"
    When user navigates back to previous Journey page
    Then the message "Sign In" should be present
    And text "Reset Password" does not exist
    And page url does not contain "/service/ResetPassword"
