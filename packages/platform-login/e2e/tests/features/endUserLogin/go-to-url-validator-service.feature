Feature: Go To URL validator service

  Background:
    Given journey "gotoOnFail URL validation" is imported via API
    And user sets Validation Service with valid goto URL "https://www.google.com" on AM console via API
    And enduser account is created via API
    And admin is logged out

  #Test Case: C25518
  @cloud
  Scenario: Go To URL validator - redirect to website which is not added in validator (Cloud only)
    When user navigates to journey "gotoOnFail URL validation" url with param "gotoOnFail" and value "https://www.bbc.com"
    And user types the stored value of "endUserName" in "User Name" field
    And user clicks on "Next" button
    Then page title is "Sign In"

  #Test Case: C27518
  @forgeops
  Scenario: Go To URL validator - redirect to website which is not added in validator (Forgeops only)
    When user navigates to journey "gotoOnFail URL validation" url with param "gotoOnFail" and value "https://www.bbc.com"
    And user types the stored value of "endUserName" in "User Name" field
    And user clicks on "Next" button
    Then "Login failure" error message is displayed

  #Test Case: C25519
  @cloud @forgeops
  Scenario: Go To URL validator - redirect correctly works
    When user navigates to journey "gotoOnFail URL validation" url with param "gotoOnFail" and value "https://www.google.com"
    And user types the stored value of "endUserName" in "User Name" field
    And user clicks on "Next" button
    Then page url contains "https://www.google.com"
