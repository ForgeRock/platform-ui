@cloud
@smoke
Feature: Password Combinations Validations on Registration Journey

  Background:
    Given user navigates to "Registration" journey
    When user fills registration form with following data
      | Field         | Value                 |
      | Username      | testUsername          |
      | First Name    | testFirstName         |
      | Last Name     | testLastName          |
      | Email Address | testEmail@example.com |
    And user fills security question "What's your favorite color?" with answer "Red"
    And user fills security question "Who was your first employer?" with answer "Ping" if present

  Scenario: [C27544] All password policies are not fulfilled
    Then "Next" button is disabled
    And following password policies are not fulfilled
      | Must be at least 8 characters long                                                  |
      | Cannot match the value of First Name, Email, Last Name, Username                    |
      | One lowercase character, one uppercase character, one number, one special character |

  Scenario: [C27545] Password length policy is fulfilled
    When user types "12345678" in the field "Password"
    Then password policy "Must be at least 8 characters long" is fulfilled

  Scenario: [C27546] Password length policy is not fulfilled
    When user types "1234" in the field "Password"
    Then "Next" button is disabled
    And password policy "Must be at least 8 characters long" is not fulfilled

  Scenario: [C27547] Cannot include policy is fulfilled
    When user types "password" in the field "Password"
    Then password policy "Cannot match the value of First Name, Email, Last Name, Username" is fulfilled

  Scenario Outline: [C27548] Cannot include policy is not fulfilled
    When user types <Forbidden Attributes Values> in the field "Password"
    Then "Next" button is disabled
    And password policy "Cannot match the value of First Name, Email, Last Name, Username" is not fulfilled

    Examples:
      | Forbidden Attributes Values |
      | "testUsername"              |
      | "testFirstName"             |
      | "testLastName"              |
      | "testEmail@example.com"     |

  Scenario: [C27549] Must contain policy is fulfilled
    When user types "Aa1." in the field "Password"
    Then password policy "One lowercase character, one uppercase character, one number, one special character" is fulfilled

  Scenario: [C27550] Must contain policy is not fulfilled
    When user types "password" in the field "Password"
    Then "Next" button is disabled
    And password policy "One lowercase character, one uppercase character, one number, one special character" is not fulfilled

  Scenario: [C27551] All password policies are fulfilled
    When user types "V4l1d*P455" in the field "Password"
    Then "Next" button is enabled
    And following password policies are fulfilled
      | Must be at least 8 characters long                                                  |
      | Cannot match the value of First Name, Email, Last Name, Username                    |
      | One lowercase character, one uppercase character, one number, one special character |

  Scenario: [C27552] Show and hide password field value
    When user types "V4l1d*P455" in the field "Password"
    And user clicks on "Show Password" button
    Then password field value is visible
    When user clicks on "Hide Password" button
    Then password field value is not visible
