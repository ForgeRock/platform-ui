@smoke
Feature: Admin Login

  Background:
    Given admin navigates to login page

  @C29558
  @cloud @forgeops
  Scenario: Cannot login with empty admin username
    When user types the stored value of "AM_PASSWORD" in "Password" field
    And user clicks on "Next" button
    Then page title is "Sign In"
    And the value of the "User Name" field is ""
    And the value of the "Password" field is ""
    
  @C29559
  @cloud @forgeops
  Scenario: Cannot login with empty admin password
    When user types the stored value of "AM_USERNAME" in "User Name" field
    And user clicks on "Next" button
    Then page title is "Sign In"
    And the value of the "User Name" field is the stored value of "AM_USERNAME"
    And the value of the "Password" field is ""

  @C29560
  @cloud @forgeops
  Scenario: Cannot login with valid admin username and wrong password
    When user types the stored value of "AM_USERNAME" in "User Name" field
    And user types "wrongP4ssword" in the field "Password"
    And user clicks on "Next" button
    Then "Login failure" error message is displayed

  @C29561
  @cloud @forgeops
  Scenario: Cannot login with wrong admin username and wrong password and login error message no longer exist after refresh page
    When user types "wrongUserN4m3" in the field "User Name"
    And user types "wrongP4ssword" in the field "Password"
    And user clicks on "Next" button
    Then "Login failure" error message is displayed
    When user reloads journey page
    Then "Login failure" error message does not exists

  @C29562
  @cloud
  Scenario: Cannot login with end user credentials - Cloud only
    When enduser account is created via API
    And admin is logged out
    And admin navigates to login page
    And user types the stored value of "endUserName" in "User Name" field
    And user types the stored value of "endUserPassword" in "Password" field
    And user clicks on "Next" button
    Then "Login failure" error message is displayed
 
  @C29563
  @forgeops
  Scenario: End user redirected to their end user dashboard after logging in from the admin login page - Forgeops only
    When enduser account is created via API
    And admin is logged out
    And admin navigates to login page
    And user types the stored value of "endUserName" in "User Name" field
    And user types the stored value of "endUserPassword" in "Password" field
    And user clicks on "Next" button
    Then enduser dashboard is loaded with enduser data
    And page url contains "enduser"

  @C29565
  @cloud @forgeops
  Scenario: Show and hide admin password field value
    When user types the stored value of "AM_PASSWORD" in "Password" field
    And user clicks on "Show Password" button
    Then password field value is visible
    When user clicks on "Hide Password" button
    Then password field value is not visible

  @C29566
  @forgeops
  Scenario: Admin logs in successfully - Forgeops only
    When user types the stored value of "AM_USERNAME" in "User Name" field
    And user types the stored value of "AM_PASSWORD" in "Password" field
    And user clicks on "Next" button
    Then admin dashboard is loaded

  @C29567
  @cloud
  Scenario: Admin logs in successfully - Cloud only
    When user types the stored value of "AM_USERNAME" in "User Name" field
    And user types the stored value of "AM_PASSWORD" in "Password" field
    And user clicks on "Next" button
    And user clicks on "Skip for now" button after waiting for 0.1 seconds
    Then admin dashboard is loaded

  @C29568
  @cloud @forgeops
  Scenario: Admin logs out successfully
    When admin logs into the tenant
    And user clicks on "Sign out" menu item from top right user menu
    Then page title is "Sign In"
