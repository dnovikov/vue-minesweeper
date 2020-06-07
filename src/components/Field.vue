<template>
  <div id="wrapper">
    <div id="controls">
      <p>
        <label for="cols">Columns:</label>
        <input v-model.number.lazy="cols" id="cols" type="number">
      </p>
      <p>
        <label for="rows">Rows:</label>
        <input v-model.number.lazy="rows" id="rows" type="number">
      </p>
      <p>
        <label for="mines_count">Mines count:</label>
        <input v-model.number.lazy="mines_count" id="mines_count" type="number">
      </p>
    </div>
    <div id="messages">
      <p class="victory" v-if="win">You won!</p>
    </div>
    <div id="mine-field">
      <div v-for="(row, index_y) in field" v-bind:key="'row-' + index_y" class="row">
        <div
          v-for="(col, index_x) in row"
          v-bind:key="'col-' + index_y + '-' + index_x"
          class="cell"
          :class="{
            'mine': fail && col == config.CELL_VALUE_MINE,
            'empty': isDiscovered(col),
            'flag': !isDiscovered(col) && isFlag(col),
            'question': !isDiscovered(col) && isQuestion(col)
          }"
          :style="cssVars"
          @click.left="cellOnClick(index_y, index_x, $event)"
          @contextmenu.prevent="cellOnClick(index_y, index_x, $event)">
          {{ isDiscovered(col) && col != config.CELL_VALUE_DISCOVERED ? col ^ config.CELL_VALUE_DISCOVERED : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import config from '../config'

export default {
  data() {
    return {
      cols: 10,
      rows: 12,
      mines_count: 40,
      fail: false,
      win: false
    }
  },

  computed: {
    cssVars() {
      return {
        '--cell-size': config.CELL_SIZE + 'px'
      }
    },

    ...mapGetters('field', [
      'cellValue',
      'field',
      'discoveredCells'
    ]),

    // Hack to use configuration constants inside the template.
    config() {
      return config
    }
  },

  watch: {
    // Three almost identical functions to refresh the field on parameters change.
    cols: function(value, old_value) {
      if (!this.checkValues()) {
        this.cols = old_value
      }
      else {
        this.clearFlags()
        this.generateField()
      }
    },

    rows: function(value, old_value) {
      if (!this.checkValues()) {
        this.rows = old_value
      }
      else {
        this.clearFlags()
        this.generateField()
      }
    },

    mines_count: function(value, old_value) {
      if (!this.checkValues()) {
        this.mines_count = old_value
      }
      else {
        this.clearFlags()
        this.generateField()
      }
    }
  },

  created() {
    this.generateField()
  },

  methods: {
    clearFlags() {
      this.win = false
      this.fail = false
    },

    checkValues() {
      if (this.mines_count >= this.cols * this.rows) {
        alert('Mines count cannot be greater than linear field size (cols * rows)')
        return false
      }

      return true
    },

    generateField() {
      this.$store.dispatch('field/generateField', { cols: this.cols, rows: this.rows, mines_count: this.mines_count })
    },

    isDiscovered(value) {
      return (value & config.CELL_VALUE_DISCOVERED)
    },

    isFlag(value) {
      return (value & config.CELL_VALUE_FLAG)
    },

    isQuestion(value) {
      return (value & config.CELL_VALUE_QUESTION)
    },

    cellOnClick(pos_y, pos_x, event) {
      // Do nothing if already failed or won.
      if (this.fail || this.win) {
        return
      }
console.log(this.discoveredCells)
      if (this.discoveredCells + 1 == this.rows * this.cols) {
        this.win = true
      }

      let cell_value = this.cellValue(pos_x, pos_y)

      switch (event.button) {
        // Left button.
        case 0:
          if (cell_value == config.CELL_VALUE_MINE) {
            this.fail = true
          }
          else if (!this.isQuestion(cell_value) && !this.isFlag(cell_value)) {
            this.$store.dispatch('field/discoverField', { pos_x: pos_x, pos_y: pos_y })
          }
          break

        // Right button.
        case 2:
          event.preventDefault()
          // Process event only for hidden cells.
          if (cell_value >= 0) {
            if (this.isQuestion(cell_value)) {
              cell_value = cell_value ^ config.CELL_VALUE_QUESTION ^ config.CELL_VALUE_FLAG
            }
            else if (this.isFlag(cell_value)) {
              cell_value = cell_value | config.CELL_VALUE_QUESTION
            }
            else {
              cell_value = cell_value | config.CELL_VALUE_FLAG
            }
            this.$store.dispatch('field/setCellValue', { pos_x: pos_x, pos_y: pos_y, value: cell_value })
          }
          break
      }
    }
  }
}

</script>
