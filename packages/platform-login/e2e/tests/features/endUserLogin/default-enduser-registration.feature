@forgeops
@smoke
Feature: Enduser Registration

  Background:
    Given user navigates to "registration" page

  # Test Cases: C19752
  @cloud
  Scenario: Registration form displays error for incorrect credentials
    When user fills out the default registration form with "invalid" credentials
    Then 'Next' button is disabled
    When user submits the registration form
    Then user should see an error indicating password should be at least 8 characters long

  # Test Cases: C19755
  Scenario: User successfully creates a new account
    When user fills out the default registration form with "valid" credentials
    Then 'Next' button is enabled
    When user submits the registration form
    Then user should be redirected to User dashboard

  # Test Cases: C19752
  Scenario: Next button is disabled until all required fields are filled
    Then 'Next' button is disabled
    When user fills out the default registration form with "invalid" credentials
    Then 'Next' button is disabled
    When user fills out the default registration form with "valid" credentials
    Then 'Next' button is enabled
    When user submits the registration form
    Then user should be redirected to User dashboard

  # Test Case: C19748
  @cloud
  Scenario: User can navigate to a Sign In from login journey
    When user clicks on 'Sign In' link
    Then page title is 'Sign In'
    And page url contains '/Login'
    When user navigates back
    Then page title is 'Sign Up'
    And page url contains 'Registration'

  # Test Case: C19751
  @cloud
  Scenario: Subsequent login
    When user fills registration form with following data
      | Field         | Value         |
      | Username      | testUsername  |
      | First Name    | testFirstName |
      | Last Name     | testLastName  |
      | Email Address | invalid_email |
      | Password      | Rg_GRg9k&e    |
    And user fills security question "What's your favorite color?" with answer "Red"
    And user fills security question "Who was your first employer?" with answer "Ping" if present
    Then 'Next' button is enabled
    When user clicks on 'Next' button
    Then 'Email Address' field has 'Invalid email format (example@example.com)' validation error
    When user fills registration form with following data
      | Field         | Value                  |
      | Email Address | valid_email@domain.com |
      | Password      | Rg_GRg9k&e             |
    And user fills security question "What's your favorite color?" with answer "Red"
    And user fills security question "Who was your first employer?" with answer "Ping" if present
    Then 'Next' button is enabled
