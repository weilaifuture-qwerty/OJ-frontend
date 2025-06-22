<template>
  <div class="simple-dropdown" v-click-outside="handleClickOutside">
    <div class="dropdown-trigger" @click="toggleDropdown">
      <slot name="trigger">
        <span>{{ label }}</span>
        <Icon :type="dropdownIcon" />
      </slot>
    </div>
    <transition name="slide-up">
      <div v-show="visible" class="dropdown-menu">
        <ul>
          <li 
            v-for="item in options" 
            :key="item.value"
            @click="handleSelect(item)"
            :class="{ active: modelValue === item.value }"
          >
            {{ item.label }}
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script>
import { Icon } from 'view-ui-plus'

export default {
  name: 'SimpleDropdown',
  components: {
    Icon
  },
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      visible: false
    }
  },
  computed: {
    dropdownIcon() {
      return this.visible ? 'ios-arrow-up' : 'ios-arrow-down'
    }
  },
  methods: {
    toggleDropdown() {
      this.visible = !this.visible
    },
    handleSelect(item) {
      this.$emit('update:modelValue', item.value)
      this.$emit('change', item.value)
      this.visible = false
    },
    handleClickOutside() {
      this.visible = false
    }
  },
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el.__clickOutsideHandler__ = (event) => {
          if (!el.contains(event.target)) {
            binding.value()
          }
        }
        document.addEventListener('click', el.__clickOutsideHandler__)
      },
      unmounted(el) {
        document.removeEventListener('click', el.__clickOutsideHandler__)
        delete el.__clickOutsideHandler__
      }
    }
  }
}
</script>

<style scoped lang="less">
.simple-dropdown {
  position: relative;
  display: inline-block;

  .dropdown-trigger {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    border: 1px solid #dcdee2;
    border-radius: 4px;
    background: #fff;
    transition: all 0.2s;

    &:hover {
      border-color: #57a3f3;
    }

    .ivu-icon {
      transition: transform 0.2s;
    }
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 5px;
    min-width: 120px;
    background: #fff;
    border: 1px solid #dcdee2;
    border-radius: 4px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
    z-index: 900;

    ul {
      list-style: none;
      padding: 4px 0;
      margin: 0;

      li {
        padding: 7px 16px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;

        &:hover {
          background: #f3f3f3;
        }

        &.active {
          color: #2d8cf0;
          background: #f0faff;
        }
      }
    }
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.2s ease;
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>