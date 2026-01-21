Feature: Default enduser password reset

  Background:
    Given enduser account is created via API
    And admin is logged out
    And user navigates to "Password Reset" journey

  @C26628
  @cloud @forgeops
  Scenario: Link from forgotten password works correctly
    When user clicks on "Sign in" link
    Then page url contains "/service/Login"
    And page title is "Sign In"
    And "Next" button is visible
    When user clicks on "Forgot Password?" link
    Then page url contains "/service/ResetPassword"
    And page title is "Reset Password"

  @C26629
  @cloud @forgeops
  Scenario: Forgotten password email is sent successfully
    When user types the stored value of "endUserEmail" in "Email Address" field
    And user clicks on "Next" button
    Then the message "An email has been sent to the address you entered. Click the link in that email to proceed." should be present
    When user retrieves the password reset email
    Then the password reset email contains the link

  @C26630
  @cloud @forgeops
  Scenario: Password reset works correctly
    When user types the stored value of "endUserEmail" in "Email Address" field
    And user clicks on "Next" button
    And user retrieves the password reset email
    And user clicks on the password reset link in the email
    Then page title is "Reset Password"
    And the "Password" field is enabled
    And "Next" button is disabled
    When user types "NewP@ssw0rd!" in the field "Password"
    Then "Next" button is enabled
    When user clicks on "Next" button
    Then "Dashboard" link is visible

  @C26631
  @cloud @forgeops
  Scenario: Link from forgotten password email can be used only once
    When user types the stored value of "endUserEmail" in "Email Address" field
    And user clicks on "Next" button
    And user retrieves the password reset email
    And user clicks on the password reset link in the email
    When user types "AnotherP@ssw0rd!" in the field "Password"
    And user clicks on "Next" button
    Then "Dashboard" link is visible
    When user clicks on the password reset link in the email
    Then page title is "Error"
    And the message "Unable to resume session. It may have expired." should be present

  @C26632
  @cloud @forgeops
  Scenario: Enduser cannot login with old password
    When user types the stored value of "endUserEmail" in "Email Address" field
    And user clicks on "Next" button
    And user retrieves the password reset email
    And user clicks on the password reset link in the email
    When user types "AnotherP@ssw0rd!" in the field "Password"
    And user clicks on "Next" button
    Then "Dashboard" link is visible
    When enduser logs out
    And user reloads the page
    And user types the stored value of "endUserName" in "User Name" field
    And user types the stored value of "endUserPassword" in "Password" field
    And user clicks on "Next" button
    Then page title is "Sign In"
    And "Next" button is visible


  @TC-11104
  @cloud
  Scenario: Password requirements update correctly
    When user types the stored value of "endUserEmail" in "Email Address" field
    And user clicks on "Next" button
    And user retrieves the password reset email
    And user clicks on the password reset link in the email
    Then the password requirements are displayed as:
      | Must be at least 8 characters long                                                  | not met |
      | Cannot match the value of First Name, Email, Last Name, Username                    | not met |
      | One lowercase character, one uppercase character, one number, one special character | not met |
    When user types "short" in the field "Password"
    Then the password requirements are displayed as:
      | Must be at least 8 characters long                                                  | not met |
      | Cannot match the value of First Name, Email, Last Name, Username                    | met     |
      | One lowercase character, one uppercase character, one number, one special character | not met |
    When user types "longenoughpassword" in the field "Password"
    Then the password requirements are displayed as:
      | Must be at least 8 characters long                                                  | met     |
      | Cannot match the value of First Name, Email, Last Name, Username                    | met     |
      | One lowercase character, one uppercase character, one number, one special character | not met |
    When user types "Passw0rd!" in the field "Password"
    Then the password requirements are displayed as:
      | Must be at least 8 characters long                                                  | met |
      | Cannot match the value of First Name, Email, Last Name, Username                    | met |
      | One lowercase character, one uppercase character, one number, one special character | met |
