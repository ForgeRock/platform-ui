@forgeops
@smoke
Feature:Admin Login
  As an admin user
  I want to verify the login functionality
  So that I can ensure the application handles login and logout correctly

  Background:
    Given admin navigates to "admin login" page

  Scenario: Fail login with incorrect credentials
    When admin logs in with "invalid" credentials
    Then admin should see a login failure message

  Scenario: Succeed login with valid credentials and logout using /am/XUI/logout URL
    When admin logs in with "valid" credentials
    Then page url does not contain "/am/XUI/?realm=/#/"
    When admin navigates to "/am/XUI/?realm=/#/logout" page
    Then page url contains "/am/XUI/?realm=/#/"

  Scenario: Logout using /am/UI/Logout URL with goto query param
    When admin logs in with "valid" credentials
    And admin navigates to "/am/UI/Logout?realm=/&goto=www.google.com" page
    Then page url contains "/am/XUI/?realm=/&goto=www.google.com#/"