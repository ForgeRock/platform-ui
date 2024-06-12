@forgeops
Feature:Admin Login
  As an admin user
  I want to verify the login functionality
  So that I can ensure the application handles login and logout correctly

  Background:
    Given Admin navigates to "admin login" page

  Scenario: Fail login with incorrect credentials
    When Admin logs in with "invalid" credentials
    Then Admin should see a login failure message

  Scenario: Succeed login with valid credentials and logout using /am/XUI/logout URL
    When Admin logs in with "valid" credentials
    Then The URL path "should not" contain "/am/XUI/?realm=/#/"
    When Admin navigates to "/am/XUI/?realm=/#/logout" page
    Then The URL path "should" contain "/am/XUI/?realm=/#/"

  Scenario: Logout using /am/UI/Logout URL with goto query param
    When Admin logs in with "valid" credentials
    And  Admin navigates to "/am/UI/Logout?realm=/&goto=www.google.com" page
    Then The URL path "should" contain "/am/XUI/?realm=/&goto=www.google.com#/"