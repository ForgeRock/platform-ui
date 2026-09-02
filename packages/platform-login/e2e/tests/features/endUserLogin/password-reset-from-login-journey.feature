@forgeops @cloud
Feature: Default enduser password reset from Login journey

  Background:
    Given enduser account is created via API
    And admin is logged out
    And user navigates to "Login" journey

  @TC-13074
  Scenario: Enduser accesses default Reset Password journey via default Login journey and changes their password
    When user clicks on "Forgot Password?" link
    Then page url contains "/service/ResetPassword"
    And page title is "Reset Password"
    When user types the stored value of "endUserEmail" in "Email Address" field
    And user clicks on "Next" button
    Then the message "An email has been sent to the address you entered. Click the link in that email to proceed." should be present
    When user retrieves the password reset email
    And user clicks on the password reset link in the email
    Then page title is "Reset Password"
    And the "Password" field is enabled
    And "Next" button is disabled
    When user types "NewP@ssw0rd!" in the field "Password"
    Then "Next" button is enabled
    When user clicks on "Next" button
    Then enduser dashboard is loaded with enduser data

  @TC-13100
  Scenario: Start Over on used password reset link opens Reset Password journey when sourced from default Login journey
    When user clicks on "Forgot Password?" link
    And user types the stored value of "endUserEmail" in "Email Address" field
    And user clicks on "Next" button
    And user retrieves the password reset email
    And user clicks on the password reset link in the email
    Then page title is "Reset Password"
    When user clicks on the password reset link in the email
    Then page title is "Error"
    And the message "Unable to resume session. It may have expired." should be present
    When user clicks on "Start Over" link
    Then page title is "Reset Password"
    And "Next" button is visible
