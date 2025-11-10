@cloud
@smoke
Feature: Enduser Registration

  Background:
    Given user navigates to "Registration" journey

  @C19748
  Scenario: User can navigate to a Sign In from login journey
    When user clicks on 'Sign In' Journey redirect link
    Then page title is 'Sign In'
    And page url contains '/Login'
    When user navigates back to previous Journey page
    Then page title is 'Sign Up'
    And page url contains 'Registration'

  @C19751
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
    Then 'Email Address' field has 'Invalid email format (example@example.com)' validation error
    When user fills registration form with following data
      | Field         | Value                  |
      | Email Address | valid_email@domain.com |
    Then 'Next' button is enabled
