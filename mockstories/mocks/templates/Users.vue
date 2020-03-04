<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <BContainer class="mock my-5">
        <template>
            <div class="mb-4">
                <h1 class="mb-2">Users</h1>
                <p>Manage user identities including password resets, creating and provisioning, blocking and deleting users.</p>
            </div>
            <div class="card">
                <div class="btn-toolbar justify-content-between">
                    <div>
                        <div role="group" aria-label="Third group" class="btn-group mb-2 mb-sm-0 mr-1">
                            <button data-backdrop="static" data-keyboard="false" id="btnNewUser" type="button" class="btn btn-primary">
                                <i class="material-icons material-icons-outlined mr-2">add</i>New User
                            </button>
                        </div>
                    </div>
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
                <table class="table table-hover table-responsive mb-0">
                  <thead>
                      <tr>
                          <th scope="col" class="py-2">User</th>
                          <th scope="col" class="py-2">Email</th>
                          <th scope="col" class="py-2">Status</th>
                          <th scope="col" class="py-2"></th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td class="align-middle">
                            <div class="media">
                                <img :src="require('@/assets/images/avatar.png')" alt="Carl Smith" class="mr-4 align-self-center rounded-circle" width=44 height=44 />
                                <div class="media-body">
                                    <h5 class="mb-0">Carl Smith</h5>
                                    <span class="text-muted">carl.smith</span>
                                </div>
                            </div>
                          </td>
                          <td class="align-middle">carl.smith@example.com</td>
                          <td class="align-middle">Active</td>
                          <td class="align-middle">
                            <div class="dropdown float-right">
                              <button class="btn btn-link text-muted" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="material-icons material-icons-outlined">more_horiz</i>
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" href="#">Action</a>
                                <a class="dropdown-item" href="#">Another action</a>
                                <a class="dropdown-item" href="#">Something else here</a>
                              </div>
                            </div>
                          </td>
                      </tr>
                      <tr>
                          <td class="align-middle">
                            <div class="media">
                                <img :src="require('@/assets/images/avatar.png')" alt="Eloise Ballard" class="mr-4 align-self-center rounded-circle" width=44 height=44 />
                                <div class="media-body">
                                    <h5 class="mb-0">Eloise Ballard</h5>
                                    <span class="text-muted">eloise.ballard</span>
                                </div>
                            </div>
                          </td>
                          <td class="align-middle">eloise.ballard@example.com</td>
                          <td class="align-middle">Active</td>
                          <td class="align-middle">
                            <div class="dropdown float-right">
                              <button class="btn btn-link text-muted" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="material-icons material-icons-outlined">more_horiz</i>
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" href="#">Action</a>
                                <a class="dropdown-item" href="#">Another action</a>
                                <a class="dropdown-item" href="#">Something else here</a>
                              </div>
                            </div>
                          </td>
                      </tr>
                      <tr>
                          <td class="align-middle">
                            <div class="media">
                                <img :src="require('@/assets/images/avatar.png')" alt="Matthew Pearson" class="mr-4 align-self-center rounded-circle" width=44 height=44 />
                                <div class="media-body">
                                    <h5 class="mb-0">Matthew Pearson</h5>
                                    <span class="text-muted">matthew.pearson</span>
                                </div>
                            </div>
                          </td>
                          <td class="align-middle">matthew.pearson@example.com</td>
                          <td class="align-middle">Active</td>
                          <td class="align-middle">
                            <div class="dropdown float-right">
                              <button class="btn btn-link text-muted" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="material-icons material-icons-outlined">more_horiz</i>
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" href="#">Action</a>
                                <a class="dropdown-item" href="#">Another action</a>
                                <a class="dropdown-item" href="#">Something else here</a>
                              </div>
                            </div>
                          </td>
                      </tr>
                      <tr>
                          <td class="align-middle">
                            <div class="media">
                                <img :src="require('@/assets/images/avatar.png')" alt="Ferne Romero" class="mr-4 align-self-center rounded-circle" width=44 height=44 />
                                <div class="media-body">
                                    <h5 class="mb-0">Ferne Romero</h5>
                                    <span class="text-muted">ferne.romero</span>
                                </div>
                            </div>
                          </td>
                          <td class="align-middle">ferne.romero@example.com</td>
                          <td class="align-middle">Active</td>
                          <td class="align-middle">
                            <div class="dropdown float-right">
                              <button class="btn btn-link text-muted" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="material-icons material-icons-outlined">more_horiz</i>
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" href="#">Action</a>
                                <a class="dropdown-item" href="#">Another action</a>
                                <a class="dropdown-item" href="#">Something else here</a>
                              </div>
                            </div>
                          </td>
                      </tr>
                      <tr>
                          <td class="align-middle">
                            <div class="media">
                                <img :src="require('@/assets/images/avatar.png')" alt="Tori Witt" class="mr-4 align-self-center rounded-circle" width=44 height=44 />
                                <div class="media-body">
                                    <h5 class="mb-0">Tori Witt</h5>
                                    <span class="text-muted">tori.witt</span>
                                </div>
                            </div>
                          </td>
                          <td class="align-middle">tori.witt@example.com</td>
                          <td class="align-middle">Active</td>
                          <td class="align-middle">
                            <div class="dropdown float-right">
                              <button class="btn btn-link text-muted" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="material-icons material-icons-outlined">more_horiz</i>
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" href="#">Action</a>
                                <a class="dropdown-item" href="#">Another action</a>
                                <a class="dropdown-item" href="#">Something else here</a>
                              </div>
                            </div>
                          </td>
                      </tr>
                      <tr>
                          <td class="align-middle">
                            <div class="media">
                                <img :src="require('@/assets/images/avatar.png')" alt="Konnor Valentine" class="mr-4 align-self-center rounded-circle" width=44 height=44 />
                                <div class="media-body">
                                    <h5 class="mb-0">Konnor Valentine</h5>
                                    <span class="text-muted">konnor.valentine</span>
                                </div>
                            </div>
                          </td>
                          <td class="align-middle">konnor.valentine@example.com</td>
                          <td class="align-middle">Active</td>
                          <td class="align-middle">
                            <div class="dropdown float-right">
                              <button class="btn btn-link text-muted" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="material-icons material-icons-outlined">more_horiz</i>
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" href="#">Action</a>
                                <a class="dropdown-item" href="#">Another action</a>
                                <a class="dropdown-item" href="#">Something else here</a>
                              </div>
                            </div>
                          </td>
                      </tr>
                      <tr>
                          <td class="align-middle">
                            <div class="media">
                                <img :src="require('@/assets/images/avatar.png')" alt="Jared Lucas" class="mr-4 align-self-center rounded-circle" width=44 height=44 />
                                <div class="media-body">
                                    <h5 class="mb-0">Jared Lucas</h5>
                                    <span class="text-muted">jared.lucas</span>
                                </div>
                            </div>
                          </td>
                          <td class="align-middle">jared.lucas@example.com</td>
                          <td class="align-middle">Active</td>
                          <td class="align-middle">
                            <div class="dropdown float-right">
                              <button class="btn btn-link text-muted" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="material-icons material-icons-outlined">more_horiz</i>
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" href="#">Action</a>
                                <a class="dropdown-item" href="#">Another action</a>
                                <a class="dropdown-item" href="#">Something else here</a>
                              </div>
                            </div>
                          </td>
                      </tr>
                      <tr>
                          <td class="align-middle">
                            <div class="media">
                                <img :src="require('@/assets/images/avatar.png')" alt="Randell Whatley" class="mr-4 align-self-center rounded-circle" width=44 height=44 />
                                <div class="media-body">
                                    <h5 class="mb-0">Randell Whatley</h5>
                                    <span class="text-muted">randell.whatley</span>
                                </div>
                            </div>
                          </td>
                          <td class="align-middle">randell.whatley@example.com</td>
                          <td class="align-middle">Active</td>
                          <td class="align-middle">
                            <div class="dropdown float-right">
                              <button class="btn btn-link text-muted" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="material-icons material-icons-outlined">more_horiz</i>
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" href="#">Action</a>
                                <a class="dropdown-item" href="#">Another action</a>
                                <a class="dropdown-item" href="#">Something else here</a>
                              </div>
                            </div>
                          </td>
                      </tr>
                      <tr>
                          <td class="align-middle">
                            <div class="media">
                                <img :src="require('@/assets/images/avatar.png')" alt="Virginia Cornett" class="mr-4 align-self-center rounded-circle" width=44 height=44 />
                                <div class="media-body">
                                    <h5 class="mb-0">Virginia Cornett</h5>
                                    <span class="text-muted">virginia.cornett</span>
                                </div>
                            </div>
                          </td>
                          <td class="align-middle">virginia.cornett@example.com</td>
                          <td class="align-middle">Active</td>
                          <td class="align-middle">
                            <div class="dropdown float-right">
                              <button class="btn btn-link text-muted" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="material-icons material-icons-outlined">more_horiz</i>
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" href="#">Action</a>
                                <a class="dropdown-item" href="#">Another action</a>
                                <a class="dropdown-item" href="#">Something else here</a>
                              </div>
                            </div>
                          </td>
                      </tr>
                      <tr>
                          <td class="align-middle">
                            <div class="media">
                                <img :src="require('@/assets/images/avatar.png')" alt="Daniel Howle" class="mr-4 align-self-center rounded-circle" width=44 height=44 />
                                <div class="media-body">
                                    <h5 class="mb-0">Daniel Howle</h5>
                                    <span class="text-muted">daniel.howle</span>
                                </div>
                            </div>
                          </td>
                          <td class="align-middle">daniel.howle@example.com</td>
                          <td class="align-middle">Active</td>
                          <td class="align-middle">
                            <div class="dropdown float-right">
                              <button class="btn btn-link text-muted" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="material-icons material-icons-outlined">more_horiz</i>
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" href="#">Action</a>
                                <a class="dropdown-item" href="#">Another action</a>
                                <a class="dropdown-item" href="#">Something else here</a>
                              </div>
                            </div>
                          </td>
                      </tr>
                  </tbody>
                </table>
                <nav class="border-top pt-3" aria-label="Data Table pagination example">
                    <ul class="pagination justify-content-center">
                        <li class="page-item"><a class="page-link text-muted" href="#"><i class="material-icons material-icons-outlined md-24">first_page</i></a></li>
                        <li class="page-item"><a class="page-link text-muted" href="#"><i class="material-icons material-icons-outlined md-24">chevron_left</i></a></li>
                        <li class="page-item"><a class="page-link text-muted" href="#"><i class="material-icons material-icons-outlined md-24">chevron_right</i></a></li>
                    </ul>
                </nav>
            </div>
        </template>
    </BContainer>
</template>

<script>
import { BContainer } from 'bootstrap-vue';

export default {
    name: 'Users',
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
