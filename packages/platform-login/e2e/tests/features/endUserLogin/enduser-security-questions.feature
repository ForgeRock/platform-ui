@cloud
Feature: Enduser Security Questions

  Feature description: This feature file is created to cover all scenarios for Security Questions from an Enduser perspective, This is not supposed to cover testcases for Admin UI/settings or combinations, everything related to Admin configuration should be done via API

  Background:
    Given journey "Registration without email" is imported via API
    And journey "Password reset by KBA" is imported via API

  @forgeops
  Scenario: Default color question
    Given user navigates to "Registration" journey
    When user clicks on the 1 "Select a security question" dropdown
    Then the option "What's your favorite color?" is visible
    And the option "Provide your own:" is visible

  @forgeops
  Scenario: SQ created by Admin are visible
    Given admin creates the following questions via API
    | Question            | Locales |
    | Pet name?           | en      |
    | Favorite character? | en      |
    When user navigates to "Registration" journey
    And user clicks on the 1 "Select a security question" dropdown
    Then the option "Pet name?" is visible
    And the option "Favorite character?" is visible

  Scenario: User should create his own questions
    Given the admin deletes all the security questions via API
    When user navigates to "Registration" journey
    And user clicks on the 1 "Select a security question" dropdown
    Then the option "Provide your own:" is visible
    And the option "What's your favorite color?" does not exist
    When user selects "Provide your own:" option on dropdown
    Then fields are visible
    | fieldName |
    | Question  |
    | Answer    |
    When admin creates the following questions via API
    | Question            | Locales |
    | Pet name?           | en      |
    And user reloads the page
    And user clicks on the 1 "Select a security question" dropdown
    Then the option "Pet name?" is visible
    And the option "Provide your own:" is visible

  @forgeops
  Scenario: Security questions are not repeated in dropdowns
    Given security questions "must define" settings is set to 2 via API
    And admin creates the following questions via API
    | Question            | Locales |
    | Pet name?           | en      |
    | Favorite character? | en      |
    When user navigates to "Registration" journey
    Then security question dropdown and answer fields are visible 2 times
    When user selects "Pet name?" option for the Security Question no. 1
    And user clicks on the 2 "Select a security question" dropdown
    Then the option "Pet name?" does not exist
    And the option "Favorite character?" is visible
    And the option "What's your favorite color?" is visible
    When user selects "What's your favorite color?" option for the Security Question no. 1
    And user clicks on the 2 "Select a security question" dropdown
    Then the option "Pet name?" is visible
    And the option "Favorite character?" is visible
    And the option "What's your favorite color?" does not exist

  @forgeops
  Scenario: Special characters on Security Question
    Given security questions "must define" settings is set to 2 via API
    And security questions "must answer" settings is set to 2 via API
    And admin creates the following questions via API
    | Question            | Locales |
    | 日本語の質問          | en      |
    When user navigates to "Registration without email" journey
    And user fills registration form with following data
    | Field         | Value                             |
    | Username      | testUsernameRandomNumberReplace   |
    | First Name    | testFirstName                     |
    | Last Name     | testLastName                      |
    | Email Address | valid@email.Enduser               |
    | Password      | Rg_GRg9k&e                        |
    And user selects "日本語の質問" option for the Security Question no. 1
    And user types "randomString" in the field "Answer for: 日本語の質問"
    And user selects "Provide your own:" option for the Security Question no. 2
    And user types "ؤال باللغة العربية" in the field "Question"
    And user types "randomString" in the field "Answer for: ؤال باللغة العربية"
    And user clicks on "Next" button
    Then enduser dashboard is loaded
    And user navigates to "Password reset by KBA" journey
    And user types the stored value of "endUserName" in "User Name" field
    And user clicks on "Next" button
    Then fields are visible
    | fieldName             |
    | 日本語の質問            |
    | ؤال باللغة العربية    |

  @forgeops
  Scenario: Error messages
    When user navigates to "Registration" journey
    And user selects "Provide your own:" option for the Security Question no. 1
    Then "Question" field has "Please provide a value" validation error
    And "Answer" field has "Please provide a value" validation error
    When user types "randomString" in the field "Question"
    Then "Question" field doesn't have any validation error
    And "Answer for: randomString" field has "Please provide a value" validation error
    When security questions "must define" settings is set to 2 via API
    And user reloads the page
    And user selects "Provide your own:" option for the Security Question no. 1
    And user selects "Provide your own:" option for the Security Question no. 2
    And user types "repeatedQuestion" on all "Question" fields
    Then all "Question" fields have "Must be unique" validation error
    When user selects "What's your favorite color?" option for the Security Question no. 1
    Then "Must be unique" validation error doesn't exist

  @forgeops
  Scenario: Must define and Must Answer combinations
    Given security questions "must define" settings is set to 100 via API
    When user navigates to "Registration without email" journey
    Then security question dropdown and answer fields are visible 100 times
    When security questions "must define" settings is set to 4 via API
    And user reloads the page
    Then security question dropdown and answer fields are visible 4 times
    When user fills registration form with following data
    | Field         | Value                             |
    | Username      | testUsernameRandomNumberReplace   |
    | First Name    | testFirstName                     |
    | Last Name     | testLastName                      |
    | Email Address | valid@email.Enduser               |
    | Password      | Rg_GRg9k&e                        |
    And user fills all 4 custom security questions with answers
    And user clicks on "Next" button
    Then enduser dashboard is loaded
    When user navigates to "Password reset by KBA" journey
    And user types the stored value of "endUserName" in "User Name" field
    And user clicks on "Next" button
    Then fields for answering to the created security questions are visible 1 time
    When security questions "must answer" settings is set to 4 via API
    And user reloads the page
    And user types the stored value of "endUserName" in "User Name" field
    And user clicks on "Next" button
    Then fields for answering to the created security questions are visible 4 times

  @forgeops
  Scenario: Long security question 
    Given admin creates the following questions via API
    | Question                                                                                                        | Locales |
    | Loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong | en      |
    When user navigates to "Registration" journey
    And user clicks on the 1 "Select a security question" dropdown
    Then the option "Loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong" is visible
    When user selects "Loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong" option for the Security Question no. 1
    Then the security question no. 1 has "Loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong" option selected

  Scenario: Security questions locale
    Given admin creates a question with different text on different locales via API
    | locale | text                   |
    | en     | Pet name?              |
    | es     | ¿Nombre de tu mascota? |
    When user navigates to "Registration without email" journey
    And user clicks on the 1 "Select a security question" dropdown
    Then the option "Pet name?" is visible
    And the option "¿Nombre de tu mascota?" does not exist
    When user navigates to "Registration with ES locale" journey
    And user clicks on the 1 "Select a security question" dropdown
    Then the option "¿Nombre de tu mascota?" is visible
    And the option "Pet name?" does not exist
  
  Scenario: Enduser can reset password by entering correct Security Questions answers
    When user navigates to "Registration without email" journey
    And user fills registration form with following data
    | Field         | Value                             |
    | Username      | testUsernameRandomNumberReplace   |
    | First Name    | testFirstName                     |
    | Last Name     | testLastName                      |
    | Email Address | valid@email.Enduser               |
    | Password      | Rg_GRg9k&e                        |
    And user selects "What's your favorite color?" option for the Security Question no. 1
    And user types "answer" in the field "Answer for: What's your favorite color?"
    And user clicks on "Next" button
    Then enduser dashboard is loaded
    When user navigates to "Password reset by KBA" journey
    And user types the stored value of "endUserName" in "User Name" field
    And user clicks on "Next" button
    And user waits for themerealm request
    And user types "answer" in the field "What's your favorite color?"
    And user clicks on "Next" button
    And user waits for themerealm request
    Then the message "Please type your new password" should be present
    When user types "Passw0rd!" in the field "Password"
    And user types "Passw0rd!" in the field "Confirm Password"
    Then "Next" button is enabled
    When user clicks on "Next" button
    Then enduser dashboard is loaded

  Scenario: Enduser can reset security questions from profile view
    When user navigates to "Registration without email" journey
    And user fills registration form with following data
    | Field         | Value                             |
    | Username      | testUsernameRandomNumberReplace   |
    | First Name    | testFirstName                     |
    | Last Name     | testLastName                      |
    | Email Address | valid@email.Enduser               |
    | Password      | Rg_GRg9k&e                        |
    And user selects "What's your favorite color?" option for the Security Question no. 1
    And user types "answer" in the field "Answer for: What's your favorite color?"
    And user clicks on "Next" button
    Then enduser dashboard is loaded
    When user clicks on "Edit Your Profile" button
    And user clicks on "Reset Security Questions" link
    Then security question dropdown and answer fields are visible 1 time
    When user selects "Provide your own:" option for the Security Question no. 1
    And user types "newQuestion" in the field "Custom"
    And user types "newAnswer" in the field "Answer"
    And user clicks on "Save" button
    Then notification is displayed with text "Updated your profile."
    And fields are not visible
    | fieldName                   |
    | Select a security question  |
    | Question                    |
    | Answer                      |

  Scenario: Enduser created without defined Security Questions
    Given enduser account is created via API
    When user navigates to "Password reset by KBA" journey
    And user types the stored value of "endUserName" in "User Name" field
    And user clicks on "Next" button
    Then security question dropdown and answer fields are visible 1 time
    When user selects "Provide your own:" option for the Security Question no. 1
    And user types "newQuestion" in the field "Question"
    And user types "newAnswer" in the field "Answer for: newQuestion"
    And user clicks on "Next" button
    And user waits for themerealm request
    Then fields are visible
    | fieldName             |
    | newQuestion           |
    When user types "newAnswer" in the field "newQuestion"
    And user clicks on "Next" button
    Then the message "Please type your new password" should be present
