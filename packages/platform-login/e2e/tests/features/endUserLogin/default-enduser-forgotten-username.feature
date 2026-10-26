@forgeops @cloud
Feature: Default enduser forgotten username

  Background:
    Given enduser account is created via API
    And admin is logged out
    And user navigates to "Forgotten Username" journey

  Scenario: [C26624] Link from forgotten username works correctly
    When user clicks on "Sign in" link
    Then page url contains "/service/Login"
    And page title is "Sign In"
    And "Next" button is visible

  Scenario: [C26625] Forgotten username email is send succesfully
    When user types the stored value of "endUserEmail" in "Email Address" field
    And user clicks on "Next" button
    Then the message "An email has been sent to the address you entered. Click the link in that email to proceed." should be present
    When user retrieves the forgotten username email
    Then the forgotten username email contains the correct username and login link

  Scenario: [C26626] Link in the forgotten username email redirects you to login
    When user types the stored value of "endUserEmail" in "Email Address" field
    And user clicks on "Next" button
    And user retrieves the forgotten username email
    And user navigates to the login link in the forgotten username email
    Then page title is "Sign In"
    And "Next" button is visible

  Scenario: [C26627] Link from forgotten username email can be used only once
    When user types the stored value of "endUserEmail" in "Email Address" field
    And user clicks on "Next" button
    And user retrieves the forgotten username email
    And user navigates to the login link in the forgotten username email
    Then page title is "Sign In"
    And "Next" button is visible
    When user navigates to the login link in the forgotten username email
    Then page title is "Error"
    And the message "Unable to resume session. It may have expired." should be present
    When user clicks on "Start Over" link
    Then page title is "Forgotten Username"
    And "Next" button is visible

