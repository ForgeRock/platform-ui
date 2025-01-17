@forgeops
@cloud
@smoke

Feature: Google Captcha Login

  # Test Cases: C25105
  Scenario: Can't login with correct credentials but Captcha unresolved
    Given the user has created a new End User with correct credentials
    And the user navigates to the captcha End User login page
    When the user fills in the login form with correct credentials
    And the user does not solve the captcha
    Then the "Next" button should be disabled

  # Test Cases: C25106
  Scenario: Can't login with wrong username and Captcha resolved
    Given the user has created a new End User with correct credentials
    And the user navigates to the captcha End User login page
    When the user fills in the login form with an incorrect username
    And the user solves the captcha
    Then the "Next" button should be enabled
    When Clicks on the Login button 1 time
    Then User should see "Login failure" error message

  # Test Cases: C25107
  Scenario: Can't login with wrong password and Captcha resolved
    Given the user has created a new End User with correct credentials
    And the user navigates to the captcha End User login page
    When the user fills in the login form with an incorrect password
    And the user solves the captcha
    Then the "Next" button should be enabled
    When Clicks on the Login button 1 time
    Then User should see "Login failure" error message

  # Test Cases: C25108
  Scenario: Login with correct credentials and captcha resolved
    Given the user has created a new End User with correct credentials
    And the user navigates to the captcha End User login page
    When the user fills in the login form with correct credentials
    And the user solves the captcha
    Then the "Next" button should be enabled
    When Clicks on the Login button 1 time
    Then the user should be logged in and see the dashboard

  # Test Cases: C25109
  Scenario: Login with correct credentials and captcha resolved in Theatre Mode
    Given the user has created a new End User in Theatre Mode
    And the user navigates to the login page in Theatre Mode
    When the user fills in the login form with correct credentials
    And the user solves the captcha
    Then the "Next" button should be enabled
    When Clicks on the Login button 1 time
    Then the user should be logged in and see the dashboard