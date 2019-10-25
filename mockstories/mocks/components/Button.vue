<template>
    <div>
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Button</h1>
                <p class="mb-4 lead">Buttons are clickable items used to perform an action.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2>Usage</h2>
                    <p>Buttons should be used in situations where users might need to:</p>
                    <ul class="mb-5">
                        <li>submit a form</li>
                        <li>begin a new task</li>
                        <li>trigger a new UI element to appear on the page</li>
                        <li>specify a new or next step in a process</li>
                    </ul>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-5">Link Button</h2>
                    <div class="card">
                        <div class="card-body">
                          <button type="button" class="btn btn-link">Link Button</button>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-5">Neutral Button</h2>
                    <div class="card">
                        <div class="card-body">
                          <button type="button" class="btn btn-outline-secondary">Neutral Button</button>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-5">Outline Primary Button</h2>
                    <div class="card">
                        <div class="card-body">
                          <button type="button" class="btn btn-outline-primary">Outline Primary Button</button>
                        </div>
                    </div>
                </section>
                <p>Link, Neutral, and Outline Primary buttons can be used multiple times per feature. Use these buttons when the actions are of equal or secondary importance to the content surrounding it.</p>
                <section class="sg_pattern">
                    <h2 class="mb-5">Primary Button</h2>
                    <div class="card">
                        <div class="card-body">
                            <button type="button" class="btn btn-primary">Primary Button</button>
                        </div>
                    </div>
                </section>
                <p>The Primary button generally should only be used once per component screen at any one time. It is used for when there is an action that is clearly more important than the other actions and you need to draw attention to it. An example is when you have a “Save” and “Cancel” button. The “Save” is the primary action.</p>
                <p>Not all features need to have primary actions, sometimes the actions are secondary to the content and are all of equal importance.</p>
                <section class="sg_pattern">
                    <h2>Block Button</h2>
                    <p class="mb-5">Use block buttons on small self-service containers (eg. 'Sign in').</p>
                    <div class="card">
                        <div class="card-body">
                            <button type="button" class="btn btn-primary btn-block">Block Button</button>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Inverse Button</h2>
                    <p class="mb-5">Use the inverse button on dark backgrounds.</p>
                    <div class="card bg-dark">
                        <div class="card-body">
                            <button type="button" class="btn btn-outline-light">Inverse Button</button>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Destructive Button</h2>
                    <p class="mb-5">Use the destructive button to indicate a destructive action to the user, like permanently erasing data.</p>
                    <div class="card">
                        <div class="card-body">
                            <button type="button" class="btn btn-danger">Destructive Button</button>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-5">Disabled Button</h2>
                    <div class="card">
                        <div class="card-body">
                            <button type="button" class="btn btn-link" disabled>Link Button</button>
                            <button type="button" class="btn btn-outline-secondary" disabled>Neutral Button</button>
                            <button type="button" class="btn btn-outline-primary" disabled>Outline Primary Button</button>
                            <button type="button" class="btn btn-primary" disabled>Primary Button</button>
                            <button type="button" class="btn btn-danger" disabled>Destructive Button</button>
                            <button type="button" class="btn btn-outline-danger" disabled>Outline Destructive Button</button>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Icon Button</h2>
                    <p class="mb-5">Use icon buttons to reinforce button action (eg. '+ New').</p>
                    <div class="card">
                        <div class="card-body">
                            <button type="button" class="btn btn-outline-secondary"><i class="material-icons material-icons-outlined mr-2">add</i>Icon Button</button>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Icon-only Button</h2>
                    <p class="mb-5">Use icon-only buttons in toolbars for secondary actions.</p>
                    <div class="card">
                        <div class="card-body">
                            <button type="button" class="btn btn-outline-secondary"><i class="material-icons material-icons-outlined">copy</i></button>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Loading Button State</h2>
                    <p class="mb-5">Use loading button state to disable repeat submissions and indicate an action is currently processing or taking place.</p>
                    <div class="card">
                        <div class="card-body">
                          <button class="btn btn-primary" type="button" disabled>
                              <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                              Loading...
                          </button>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Checkbox Button</h2>
                    <p class="mb-5">Use checkbox buttons to bring emphasis to selection items.</p>
                    <div class="card">
                        <div class="card-body">
                            <div class="btn-group-toggle d-inline-block" data-toggle="buttons">
                              <label class="btn btn-outline-secondary">
                                <input type="checkbox" autocomplete="off">Not Checked
                              </label>
                            </div>
                            <div class="btn-group-toggle d-inline-block" data-toggle="buttons">
                              <label class="btn btn-outline-secondary active">
                                <input type="checkbox" checked autocomplete="off">Checked
                              </label>
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
    name: 'Button',
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
<style lang="scss"></style>
