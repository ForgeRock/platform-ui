@forgeops
Feature: Enduser Registration

  Background:
    Given User navigates to "registration" page

  # Test Cases: C19752
  @cloud
  Scenario: Registration form displays error for incorrect credentials
    When User fills out the default registration form with "invalid" credentials
    Then The next button should be "disabled"
    When User submits the registration form
    Then User should see an error indicating password should be at least 8 characters long

  # Test Cases: C19755
  Scenario: User successfully creates a new account
    When User fills out the default registration form with "valid" credentials
    Then The next button should be "enabled"
    When User submits the registration form
    Then User should be redirected to User dashboard

  # Test Cases: C19752
  Scenario: Next button is disabled until all required fields are filled
    Then The next button should be "disabled"
    When User fills out the default registration form with "invalid" credentials
    Then The next button should be "disabled"
    When User fills out the default registration form with "valid" credentials
    Then The next button should be "enabled"
    When User submits the registration form
    Then User should be redirected to User dashboard
