<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <div class="mock">
    <div class="sg_masthead">
      <BContainer>
        <h1 class="display-4">Data Table</h1>
        <p class="mb-4 lead">Data Tables are an enhanced version of a basic table and are used to display tabular data.</p>
      </BContainer>
    </div>
    <BContainer>
      <template>
        <section class="sg_pattern">
          <h2>Structure</h2>
          <p class="mb-5">Data Tables consist a table preceded by a Toolbar component and optionally followed by a Pagination component.</p>
          <div class="card mx-1 mt-1 mb-5">
            <div class="btn-toolbar justify-content-between">
              <div>
                <div role="group" aria-label="Third group" class="btn-group mb-2 mb-sm-0 mr-1">
                  <button data-backdrop="static" data-keyboard="false" type="button" class="btn btn-primary">
                    <i class="material-icons material-icons-outlined mr-2">add</i>New User
                  </button>
                </div>
              </div>
              <div class="input-group input-group-search">
                <div class="input-group-prepend">
                  <span class="input-group-text"><i class="material-icons material-icons-outlined">search</i></span>
                </div>
                <input type="text" class="form-control" placeholder="Search" aria-label="Label" aria-describedby="basic-addon1">
                <div class="input-group-append">
                  <button class="btn btn-outline-secondary d-none" type="button"><i class="material-icons material-icons-outlined">close</i></button>
                </div>
              </div>
            </div>
            <div class="table-responsive table-hover table-click mb-0">
              <table class="table data-table mb-0">
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
                        <button class="btn btn-link text-muted" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                        <button class="btn btn-link text-muted" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                        <button class="btn btn-link text-muted" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                        <button class="btn btn-link text-muted" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                        <button class="btn btn-link text-muted" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                        <button class="btn btn-link text-muted" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                        <button class="btn btn-link text-muted" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                        <button class="btn btn-link text-muted" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                        <button class="btn btn-link text-muted" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                        <button class="btn btn-link text-muted" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
            </div>
            <nav class="border-top pt-3" aria-label="Data Table pagination example">
              <ul class="pagination justify-content-center">
                <li class="page-item"><a class="page-link text-muted" href="#"><i class="material-icons material-icons-outlined md-24">first_page</i></a></li>
                <li class="page-item"><a class="page-link text-muted" href="#"><i class="material-icons material-icons-outlined md-24">chevron_left</i></a></li>
                <li class="page-item"><a class="page-link text-muted" href="#"><i class="material-icons material-icons-outlined md-24">chevron_right</i></a></li>
              </ul>
            </nav>
          </div>
        </section>
        <section class="sg_pattern">
          <h2>Multi-select</h2>
          <p class="mb-5">Optionally, multiple items can be selected via checkboxes to apply contextual actions like <code>delete</code>, which appear only when applicable.</p>
          <div class="card">
            <div class="btn-toolbar justify-content-between">
              <div>
                <div role="group" aria-label="Third group" class="btn-group mb-2 mb-sm-0 mr-1">
                  <button data-backdrop="static" data-keyboard="false" type="button" class="btn btn-primary">
                    <i class="material-icons material-icons-outlined mr-2">add</i>New Application
                  </button>
                </div>
                <div role="group" class="btn-group mb-2 mb-sm-0" v-if="checked1 || checked2 || checked3">
                  <button data-backdrop="static" data-keyboard="false" type="button" class="btn btn-outline-primary">
                    <i class="material-icons material-icons-outlined mr-2">delete</i>Delete
                  </button>
                </div>
              </div>
              <div class="input-group input-group-search">
                <div class="input-group-prepend">
                  <span class="input-group-text"><i class="material-icons material-icons-outlined">search</i></span>
                </div>
                <input type="text" class="form-control" placeholder="Search" aria-label="Label" aria-describedby="basic-addon1">
                <div class="input-group-append">
                  <button class="btn btn-outline-secondary d-none" type="button"><i class="material-icons material-icons-outlined">close</i></button>
                </div>
              </div>
            </div>
            <div class="table-responsive table-hover table-click mb-0">
              <table class="table data-table m-0">
                <thead>
                  <tr>
                    <th scope="col" width="16">
                      <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="customCheck0" @click="checkAll()">
                        <label class="custom-control-label" for="customCheck0"></label>
                      </div>
                    </th>
                    <th scope="col">Name</th>
                    <th scope="col">Client ID</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">
                      <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="customCheck1" v-model="checked1">
                        <label class="custom-control-label" for="customCheck1"></label>
                      </div>
                    </th>
                    <td>GoGo iOS App</td>
                    <td><small class="text-monospace">0oasdfasdfhalskbu854b</small></td>
                    <td>
                      <a href="#"><i class="material-icons material-icons-outlined text-muted float-right">more_horiz</i></a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="customCheck2" v-model="checked2">
                        <label class="custom-control-label" for="customCheck2"></label>
                      </div>
                    </th>
                    <td>GoGo SPA App</td>
                    <td><small class="text-monospace">0oasdfasdfhalskbu854b</small></td>
                    <td>
                      <a href="#"><i class="material-icons material-icons-outlined text-muted float-right">more_horiz</i></a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="customCheck3" v-model="checked3">
                        <label class="custom-control-label" for="customCheck3"></label>
                      </div>
                    </th>
                    <td>Gogo Web App</td>
                    <td><small class="text-monospace">0oasdfasdfhalskbu854b</small></td>
                    <td>
                      <a href="#"><i class="material-icons material-icons-outlined text-muted float-right">more_horiz</i></a>
                    </td>
                  </tr>
                </tbody>
              </table>
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
  name: 'DataTable',
  data: function () {
    return {
      checked1: true,
      checked2: false,
      checked3: false
    };
  },
  components: {
    BContainer
  },
  mounted () {},
  methods: {
    checkAll() {
      if (!this.checked1 || !this.checked2 || !this.checked3) {
        this.checked1 = true;
        this.checked2 = true;
        this.checked3 = true;
      } else {
        this.checked1 = false;
        this.checked2 = false;
        this.checked3 = false;
      }
    }
  }
};
</script>
