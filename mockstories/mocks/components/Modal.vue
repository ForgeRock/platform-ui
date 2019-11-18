<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <div>
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Modal</h1>
                <p class="mb-4 lead">Modals are used to display content in a layer above the app. This paradigm is used in cases such as the creation or editing of a record, as well as various types of messaging and wizards.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2>Form Modal</h2>
                    <p class="mb-5">Modal forms should use large modal size. Form submit action should be disabled until content is valid.</p>
                    <div class="position-relative py-5 overflow-hidden">
                        <div class="modal-backdrop position-absolute w-100 h-100" style="z-index: 0;"></div>
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content" role="document">
                                <header class="modal-header">
                                    <h5 class="modal-title">Modal Title</h5>
                                    <button aria-label="Close" class="close" type="button">×</button>
                                </header>
                                <div class="modal-body">
                                    <div class="form-group">
                                        <div class="form-label-group mb-0">
                                            <input autofocus="autofocus" class="form-control" id="basicInput" placeholder="label" type="text"> <label for="basicInput">Label</label>
                                        </div><small class="form-text text-muted" id="basicInputHelp">Help text for this field.</small>
                                    </div>
                                </div>
                                <footer class="modal-footer">
                                    <button class="btn btn-link" type="button">Cancel</button>
                                    <button class="btn btn-primary disabled" disabled="disabled" type="button">Save</button>
                                </footer>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Delete Confirmation Modal</h2>
                    <p class="mb-5">Use to provide confirmation of a destructive action.</p>
                    <div class="position-relative py-5 overflow-hidden">
                        <div class="modal-backdrop position-absolute w-100 h-100" style="z-index: 0;"></div>
                        <div class="modal-dialog">
                            <div class="modal-content" role="document">
                                <header class="modal-header">
                                    <h5 class="modal-title">Delete Object?</h5>
                                    <button aria-label="Close" class="close" type="button">×</button>
                                </header>
                                <div class="modal-body">
                                    <p class="mb-4">Are you sure you want to delete object? If you do object will not exist anymore.</p>
                                </div>
                                <footer class="modal-footer">
                                    <button class="btn btn-link text-danger" type="button">Cancel</button>
                                    <button class="btn btn-danger" type="button">Delete Object</button>
                                </footer>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Multi-step Modal</h2>
                    <p class="mb-5">Use to  multi-step modals to break down complex tasks into discrete steps.</p>
                    <div class="position-relative py-5 overflow-hidden">
                        <div class="modal-backdrop position-absolute w-100 h-100" style="z-index: 0;"></div>
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content" role="document">
                                <header class="modal-header">
                                    <h5 class="modal-title">Modal Title</h5>
                                    <button aria-label="Close" class="close" type="button">×</button>
                                </header>
                                <div class="modal-body">
                                    <div class="form-group">
                                        <div class="form-label-group mb-0">
                                            <input autofocus="autofocus" class="form-control" id="basicInput" placeholder="label" type="text"> <label for="basicInput">Label</label>
                                        </div><small class="form-text text-muted" id="basicInputHelp">Help text for this field.</small>
                                    </div>
                                </div>
                                <footer class="modal-footer justify-content-between">
                                    <button class="btn btn-link">Previous</button>
                                    <div class="progress-indicator position-relative mx-5">
                                        <ol class="list-unstyled d-flex justify-content-between" style="z-index: 1;">
                                            <li class="list-inline-item complete">
                                                <button class="btn-progress-marker" title="Step 1 - Completed">
                                                    <i class="progress-icon material-icons md-14">check_circle</i>
                                                    <span class="sr-only">Step 1 - Completed</span>
                                                </button>
                                            </li>
                                            <li class="list-inline-item complete">
                                                <button class="btn-progress-marker" title="Step 2 - Completed">
                                                    <i class="progress-icon material-icons md-14">check_circle</i>
                                                    <span class="sr-only">Step 2 - Completed</span>
                                                </button>
                                            </li>
                                            <li class="list-inline-item active">
                                                <button class="btn-progress-marker">
                                                    <span class="sr-only">Step 3 - Active</span>
                                                </button>
                                            </li>
                                            <li class="list-inline-item">
                                                <button class="btn-progress-marker">
                                                    <span class="sr-only">Step 4</span>
                                                </button></li>
                                            <li class="list-inline-item">
                                                <button class="btn-progress-marker">
                                                    <span class="sr-only">Step 5</span>
                                                </button>
                                            </li>
                                        </ol>
                                        <div class="progress w-100" style="height: 4px;">
                                            <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                        </div>
                                    </div>
                                    <div class="d-flex">
                                        <button class="btn btn-link" type="button">Cancel</button>
                                        <button class="btn btn-primary disabled" disabled="disabled" type="button">Next</button>
                                    </div>
                                </footer>
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
    name: 'Card',
    data: function () {
        return {
            radioChecked: 'option1'
        };
    },
    components: {
        BContainer
    },
    mounted () {},
    methods: {}
};
</script>
