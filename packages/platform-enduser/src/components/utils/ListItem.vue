<template>
  <div
    v-if="collapsible"
    class="collapsible">
    <BListGroupItem
      href="#"
      :class="[{'list-item-cursor': collapsible===false}]"
      v-b-toggle="toggleId">
      <div class="media">
        <slot name="list-item-header" />
      </div>
    </BListGroupItem>

    <BCollapse
      :id="id"
      :visible="panelShown"
      @hide="$emit('hide')"
      @show="$emit('show')"
      @hidden="$emit('hidden')"
      @shown="$emit('shown')">
      <BCardBody class="pt-3">
        <slot name="list-item-collapse-body" />
      </BCardBody>
    </BCollapse>
  </div>

  <div
    v-else
    @click="$emit('row-click')"
    :class="[{'fr-hover-item': hoverItem}]">
    <BListGroupItem class="noncollapse">
      <div class="media">
        <slot name="list-item-header" />
      </div>
    </BListGroupItem>

    <BCardBody
      v-if="panelShown"
      class="pt-3">
      <slot name="list-item-collapse-body" />
    </BCardBody>
  </div>
</template>

<script>
/**
 * @description Used in conjunction with ListGroup.vue, this is the individual item in each list display.
 *
 * */
export default {
	name: 'ListItem',
	props: {
		collapsible: {
			type: Boolean,
			default: false,
		},
		panelShown: {
			type: Boolean,
			default: false,
		},
		hoverItem: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			id: null,
		};
	},
	beforeMount() {
		// eslint-disable-next-line no-underscore-dangle
		this.id = `listItem${this._uid}`;
	},
	computed: {
		toggleId() {
			if (this.collapsible) {
				return this.id;
			}
			return null;
		},
	},
};
</script>
<style lang="scss" scoped>
    .media {
        height: 38px;

        & > * {
            -ms-flex-item-align: center;
            align-self: center;
        }
    }

    .list-item-cursor {
        cursor: default;
    }

    .fr-hover-item:hover {
        cursor: pointer;

        .list-group-item {
            background-color: $fr-hover-list-color;
        }
    }

    .collapsible:last-of-type > .list-group-item.collapsed {
        border-bottom-right-radius: $border-radius;
        border-bottom-left-radius: $border-radius;
        border-bottom: 1px solid $border-color;
    }

    .list-group-item-action {
        color: inherit;

        .caret {
            .caret-up {
                display: none;
            }
        }
        .meta {
            line-height: 1.2;
        }
        .btn-cancel {
            display: none;
        }
        .btn-edit {
            display: block;
        }

        &:not(.collapsed) {
            button {
                display: block;
            }
            .btn-cancel {
                display: block;
            }
            .btn-edit {
                display: none;
            }
            .caret {
                .caret-up {
                    display: block;
                }
                .caret-down {
                    display: none;
                }
            }
        }
    }

    .list-group-item-action:not(.collapsed),
    .list-group-item-action:not(.collapsed):hover,
    .list-group-item-action:not(.collapsed):focus,
    .noncollapse {
        background-color: $card-bg;
        border-bottom-color: transparent;
        cursor: initial;
    }

</style>
