@forgeops
@cloud
@smoke

Feature: Google Captcha Login

  @C25105
  Scenario: Can't login with correct credentials but captcha unresolved
    Given the user navigates to the captcha End User login page
    When the user fills in the login form with correct credentials
    And the user does not solve the captcha
    Then the "Next" button should be disabled

  @C25106
  Scenario: Can't login with wrong username and captcha resolved
    Given the user navigates to the captcha End User login page
    When the user fills in the login form with an incorrect username
    And the user solves the captcha
    Then the "Next" button should be enabled
    When clicks on the Login button 1 time
    Then "Login failure" error message is displayed

  @C25107
  Scenario: Can't login with wrong password and captcha resolved
    Given the user navigates to the captcha End User login page
    When the user fills in the login form with an incorrect password
    And the user solves the captcha
    Then the "Next" button should be enabled
    When clicks on the Login button 1 time
    Then "Login failure" error message is displayed

  @C25108
  Scenario: Login with correct credentials and captcha resolved
    Given the user navigates to the captcha End User login page
    When the user fills in the login form with correct credentials
    And the user solves the captcha
    Then the "Next" button should be enabled
    When clicks on the Login button 1 time
    Then the user should be logged in and see the dashboard

  @C25109
  Scenario: Login with correct credentials and captcha resolved in theatre mode
    Given the user navigates to the login page in Theatre Mode
    When the user fills in the login form with correct credentials
    And the user solves the captcha
    Then the "Next" button should be enabled
    When clicks on the Login button 1 time
    Then the user should be logged in and see the dashboard
