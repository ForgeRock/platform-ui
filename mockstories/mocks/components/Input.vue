<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <div>
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Input</h1>
                <p class="mb-4 lead">Text inputs are used for freeform data entry.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2>Basic Input</h2>
                    <p class="mb-5">Inputs use floating labels for a more streamlined layout.</p>
                    <div class="card">
                        <div class="card-body">
                          <div class="form-group">
                            <div class="form-label-group mb-0">
                              <input
                                type="text"
                                id="basicInput"
                                class="form-control"
                                autofocus="autofocus"
                                placeholder="label"
                              />
                              <label for="basicInput">Label</label>
                            </div>
                            <small id="basicInputHelp" class="form-text text-muted">Help text for this field.</small>
                          </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                  <h2 class="mb-5">Disabled</h2>
                  <div class="card">
                    <div class="card-body">
                      <div class="form-group">
                        <div class="form-label-group mb-0">
                            <input
                              type="text"
                              id="basicInputDisabled"
                              class="form-control"
                              autofocus="autofocus"
                              placeholder="label"
                              value="Disabled field"
                              disabled
                            />
                            <label for="basicInputDisabled">Label</label>
                          </div>
                          <small id="basicInputDisabledHelp" class="form-text text-muted">Help text for this field.</small>
                      </div>
                    </div>
                  </div>
                </section>
                <section class="sg_pattern">
                  <h2 class="mb-5">Readonly</h2>
                  <div class="card">
                    <div class="card-body">
                      <div class="form-group">
                        <div class="form-label-group mb-0">
                          <input
                            type="text"
                            id="basicInputDisabled"
                            class="form-control"
                            autofocus="autofocus"
                            placeholder="label"
                            value="Readonly field"
                            readonly
                          />
                          <label for="basicInputDisabled">Label</label>
                        </div>
                        <small id="basicInputDisabledHelp" class="form-text text-muted">Help text for this field.</small>
                      </div>
                    </div>
                  </div>
                </section>
                <section class="sg_pattern">
                    <h2>Invalid</h2>
                    <p class="mb-5">Invalid state should highlight input and place error message directly below the input but above any help text.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="form-group">
                                <div class="form-label-group mb-0">
                                    <input
                                      type="text"
                                      id="basicInput"
                                      class="form-control is-invalid"
                                      autofocus="autofocus"
                                      placeholder="label"
                                      required
                                    />
                                    <label for="basicInput">Label</label>
                                </div>
                                <div class="invalid-feedback d-block">Please provide a value.</div>
                                <small id="basicInputHelp" class="form-text text-muted">Help text for this field.</small>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Textarea</h2>
                    <p class="mb-5">Use textareas for freeform data entry that require accomodation for longer responses.</p>
                    <div class="card">
                        <div class="card-body">
                          <div class="form-group">
                              <div class="form-label-group mb-0">
                                  <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" placeholder="Label"></textarea>
                                  <label for="exampleFormControlTextarea1">Label</label>
                              </div>
                              <small id="textareaHelp" class="form-text text-muted">Help text for this field.</small>
                          </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Password Input</h2>
                    <p class="mb-5">Password Inputs are specialized Input Groups that have a reveal button addon absolutely positioned to allow selection on entire component, and borderless for a more seamless look.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="form-group">
                                <div class="form-label-group form-label-group-password">
                                    <div class="form-label-group-input">
                                        <input type="password" id="passwordInput" class="form-control" placeholder="Password" />
                                        <label for="passwordInput">Password</label>
                                    </div>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="button"><i class="material-icons material-icons-outlined">visibility_off</i></button>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="form-label-group form-label-group-password">
                                    <div class="form-label-group-input">
                                        <input type="password" id="passwordInput1" class="form-control" placeholder="Password" value="Passw0rd" />
                                        <label for="passwordInput">Password</label>
                                    </div>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="button"><i class="material-icons material-icons-outlined">visibility_off</i></button>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="form-label-group form-label-group-password">
                                    <div class="form-label-group-input">
                                        <input type="text" id="passwordInput1" class="form-control" placeholder="Password" value="Passw0rd" />
                                        <label for="passwordInput3">Password</label>
                                    </div>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="button"><i class="material-icons material-icons-outlined">visibility</i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Set Password Input</h2>
                    <p class="mb-5">Use for setting passwords with policy enforcement. On success the policy requirements list is hidden and success alert fades in.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="form-group mb-5">
                                <div class="form-label-group form-label-group-password">
                                    <div class="form-label-group-input">
                                        <input type="password" id="passwordInput" class="form-control" placeholder="Password" />
                                        <label for="passwordInput">Password</label>
                                    </div>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="button"><i class="material-icons material-icons-outlined">visibility_off</i></button>
                                    </div>
                                </div>
                                <small id="setPasswordInputHelp" class="form-text text-muted py-2">
                                    <div class="row">
                                        <div class="col-sm-6">
                                            <ul class="pl-4">
                                              <li>One lowercase character</li>
                                              <li>One uppercase character</li>
                                              <li>One number</li>
                                            </ul>
                                        </div>
                                        <div class="col-sm-6">
                                            <ul class="pl-4">
                                              <li>One special character (eg. !@#$%^&*)</li>
                                              <li>8 characters minimum</li>
                                            </ul>
                                        </div>
                                    </div>
                                </small>
                            </div>
                            <div class="form-group mb-5">
                                <div class="form-label-group form-label-group-password">
                                    <div class="form-label-group-input">
                                        <input type="password" id="passwordInput" class="form-control" placeholder="Password" value="P@s" />
                                        <label for="passwordInput">Password</label>
                                    </div>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="button"><i class="material-icons material-icons-outlined">visibility_off</i></button>
                                    </div>
                                </div>
                                <small id="setPasswordInputHelp" class="form-text text-muted py-2">
                                    <div class="row">
                                        <div class="col-sm-6">
                                            <ul class="pl-4">
                                              <li class="opacity-30">One lowercase character</li>
                                              <li class="opacity-30">One uppercase character</li>
                                              <li>One number</li>
                                            </ul>
                                        </div>
                                        <div class="col-sm-6">
                                            <ul class="pl-4">
                                              <li class="opacity-30">One special character (eg. !@#$%^&*)</li>
                                              <li>8 characters minimum</li>
                                            </ul>
                                        </div>
                                    </div>
                                </small>
                            </div>
                            <div class="form-group mb-5">
                                <div class="form-label-group form-label-group-password">
                                    <div class="form-label-group-input">
                                        <input type="password" id="passwordInput" class="form-control" placeholder="Password" value="P@ssw0rd" />
                                        <label for="passwordInput">Password</label>
                                    </div>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="button"><i class="material-icons material-icons-outlined">visibility_off</i></button>
                                    </div>
                                </div>
                                <div class="alert alert-success my-4" role="alert">
                                    <i class="material-icons material-icons-outlined mr-3">check_circle</i>Your password is secure and you're all set!
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Search Input</h2>
                    <p class="mb-5">Search Input Groups don‘t use floating labels, and like password inputs have their addon absolutely positioned to allow selection on entire component, and borderless for a more seamless look.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="form-group">
                                <div class="input-group input-group-search">
                                    <div class="input-group-prepend">
                                      <span class="input-group-text" id="search-addon1"><i class="material-icons material-icons-outlined">search</i></span>
                                    </div>
                                    <input type="text" class="form-control" id="searchInput1" placeholder="Search" aria-label="Label" aria-describedby="basic-addon1">
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary d-none" type="button"><i class="material-icons material-icons-outlined">close</i></button>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="input-group input-group-search">
                                    <div class="input-group-prepend">
                                      <span class="input-group-text" id="search-addon3"><i class="material-icons material-icons-outlined">search</i></span>
                                    </div>
                                    <input type="text" class="form-control" id="searchInput1" placeholder="Search" aria-label="Label" aria-describedby="basic-addon3" value="bjensen">
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="button"><i class="material-icons material-icons-outlined">close</i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Input Group</h2>
                    <p class="mb-5">Use standard Input Group for prepending or appending text to an input.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="form-group">
                                <div class="form-label-group">
                                    <div class="input-group-prepend">
                                      <span class="input-group-text" id="basic-addon1">@</span>
                                    </div>
                                    <div class="form-label-group-input">
                                      <input
                                        type="text"
                                        class="form-control"
                                        id="basicInput1"
                                        placeholder="Label"
                                        aria-label="Label"
                                        aria-describedby="basic-addon1"
                                      />
                                      <label for="basicInput1">Label</label>
                                    </div>
                                </div>
                                <small id="basicInputHelp1" class="form-text text-muted">Help text for this field.</small>
                              </div>
                              <div class="form-group">
                                <div class="form-label-group">
                                  <div class="form-label-group-input">
                                    <input
                                      type="text"
                                      class="form-control"
                                      id="basicInput2"
                                      placeholder="Label"
                                      aria-label="Label"
                                      aria-describedby="basic-addon2"
                                    />
                                    <label for="basicInput2">Label</label>
                                  </div>
                                  <div class="input-group-append">
                                    <span class="input-group-text" id="basic-addon2">@example.com</span>
                                  </div>
                                </div>
                                <small id="basicInputHelp2" class="form-text text-muted">Help text for this field.</small>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Button Input Group</h2>
                    <p class="mb-5">Use Button Input Groups to create separation between the input and the addon. Examples include when a button label is longer than a single character, or when the input has multiple addons.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="form-group">
                                <div class="form-label-group mb-0">
                                    <div class="form-label-group-input">
                                        <input type="text" id="buttonInputGroup1" class="form-control" placeholder="Label" />
                                        <label for="buttonInputGroup1">Label</label>
                                    </div>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="button">Button</button>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="form-label-group mb-0">
                                    <div class="form-label-group-input">
                                        <input type="password" id="buttonInputGroup2" class="form-control" placeholder="Label" value="eairbha;eoirh" />
                                        <label for="buttonInputGroup2">Client Secret</label>
                                    </div>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="button"><i class="material-icons material-icons-outlined">visibility_off</i></button>
                                        <button class="btn btn-outline-secondary" type="button"><i class="material-icons material-icons-outlined">copy</i></button>
                                        <button class="btn btn-outline-secondary" type="button"><i class="material-icons material-icons-outlined">sync</i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Dropdown Input Group</h2>
                    <p class="mb-5">Prepend or append a dropdown button to apply categorization to an input field.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="form-group">
                                <div class="form-label-group mb-0">
                                    <div class="form-label-group-input">
                                        <input type="text" id="buttonInputGroup1" class="form-control pr-0" placeholder="Label" />
                                        <label for="buttonInputGroup1" class="pr-0">Label</label>
                                    </div>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Dropdown</button>
                                        <div class="dropdown-menu">
                                            <a class="dropdown-item" href="#">Action</a>
                                            <a class="dropdown-item" href="#">Another action</a>
                                            <a class="dropdown-item" href="#">Something else here</a>
                                            <div role="separator" class="dropdown-divider"></div>
                                            <a class="dropdown-item" href="#">Separated link</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="form-label-group mb-0">
                                    <div class="input-group-prepend">
                                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Dropdown</button>
                                        <div class="dropdown-menu">
                                            <a class="dropdown-item" href="#">Action</a>
                                            <a class="dropdown-item" href="#">Another action</a>
                                            <a class="dropdown-item" href="#">Something else here</a>
                                            <div role="separator" class="dropdown-divider"></div>
                                            <a class="dropdown-item" href="#">Separated link</a>
                                        </div>
                                    </div>
                                    <div class="form-label-group-input">
                                        <input type="text" id="buttonInputGroup2" class="form-control" placeholder="Label" />
                                        <label for="buttonInputGroup2">Label</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Country Dropdown Phone Input Group</h2>
                    <p class="mb-5">Use to allow user to select country which prepends the country code to the phone number. The value gets formatted according to country specifications on keyup.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="form-group">
                                <div class="form-label-group mb-0">
                                    <div class="input-group-prepend">
                                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" aria-haspopup="true" aria-expanded="false"><span class="flag-icon flag-icon-us"></span></button>
                                        <div class="dropdown-menu">
                                            <a class="dropdown-item" href="#"><span class="flag-icon flag-icon-gb"></span></a>
                                            <a class="dropdown-item" href="#"><span class="flag-icon flag-icon-eu"></span></a>
                                        </div>
                                    </div>
                                    <div class="form-label-group-input">
                                        <input type="text" id="buttonInputGroup2" class="form-control" placeholder="Phone" value="+1 " />
                                        <label for="buttonInputGroup2">Phone</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </template>
        </BContainer>
    </div>
</template>

<script>
import { BContainer } from 'bootstrap-vue';

export default {
    name: 'Input',
    data: function () {
        return {};
    },
    components: {
        BContainer
    },
    mounted () {},
    methods: {}
};
</script>
