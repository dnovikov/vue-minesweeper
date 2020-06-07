import config from '../../config'

const state = () => ({
  cols: 0,
  rows: 0,
  mines_count: 0,
  field: []
})

const getters = {
  field: state => {
    return state.field
  },

  cellValue: state => (pos_x, pos_y) => {
    return state.field[pos_y][pos_x]
  },

  discoveredCells: state => {
    let discovered_cells = 0
    for (let i = 0; i < state.rows; i++) {
      for (let j = 0; j < state.cols; j++) {
        if (
          (state.field[i][j] & config.CELL_VALUE_DISCOVERED)
          || (
            (state.field[i][j] & config.CELL_VALUE_FLAG)
            && (state.field[i][j] & config.CELL_VALUE_MINE)
            && state.field[i][j] < config.CELL_VALUE_DISCOVERED
          )
        ) {
          discovered_cells++
        }
      }
    }

    return discovered_cells
  }
}

const actions = {
  generateField ({ commit }, payload) {
    commit('setFieldParams', payload)
    commit('generateField')
  },

  setCellValue ({ commit }, payload) {
    commit('setCellValue', payload)
  },

  discoverField ({ commit }, payload) {
    commit('discoverField', payload)
  }
}

const mutations = {
  setFieldParams (state, { cols, rows, mines_count }) {
    state.cols = cols
    state.rows = rows
    state.mines_count = mines_count
  },

  generateField (state) {
    // Initialize the field with empty cells.
    state.field = Array.from(Array(state.rows).fill(config.CELL_VALUE_EMPTY), function() {
      return Array(state.cols).fill(config.CELL_VALUE_EMPTY)
    })

    var linear_size = state.cols * state.rows - 1
    var mines_count = state.mines_count
    if (mines_count >= linear_size) {
      throw 'Mines count cannot be greater than linear field size (cols * rows)'
    }

    while (mines_count) {
      let pos = Math.floor(Math.random() * linear_size) + 1
      let pos_x = pos % state.cols
      let pos_y = Math.floor(pos / state.cols)
      if (state.field[pos_y][pos_x] == config.CELL_VALUE_EMPTY) {
        state.field[pos_y][pos_x] = config.CELL_VALUE_MINE
        mines_count--
      }
    }
    console.log(state.field)
  },

  setCellValue (state, { pos_x, pos_y, value }) {
    if (pos_x < 0 || pos_x >= state.cols) {
      throw 'pos_x must be between 0 and ' + state.cols
    }
    if (pos_y < 0 || pos_y >= state.rows) {
      throw 'pos_x must be between 0 and ' + state.rows
    }
    let field = state.field
    field[pos_y][pos_x] = value
    state.field = Array.from(field)
  },

  discoverField (state, { pos_x, pos_y }) {
    let field = state.field
    field = discoverField({ state: state }, field, pos_x, pos_y)

    // We need to assign a new object to get changes displayed in the component.
    state.field = Array.from(field)
  }
}

// Helper function to discover cells recursively.
function discoverField ({ state }, field, pos_x, pos_y) {
  let mines_count = 0
  for (let i = pos_y - 1; i <= pos_y + 1; i++) {
    for (let j = pos_x - 1; j <= pos_x + 1; j++) {
      // Check if we're inside the array boundaries first.
      if (
        i < 0
        || j < 0
        || i >= state.rows
        || j >= state.cols
      ) {
        continue
      }

      if (field[i][j] & config.CELL_VALUE_DISCOVERED) {
        continue
      }

      // Get clean cell value without flags.
      let cell_value = field[i][j]

      if (cell_value & config.CELL_VALUE_FLAG) {
        cell_value = cell_value ^ config.CELL_VALUE_FLAG
      }

      if (cell_value & config.CELL_VALUE_QUESTION) {
        cell_value = cell_value ^ config.CELL_VALUE_QUESTION
      }

      if (cell_value == config.CELL_VALUE_MINE) {
        mines_count++
      }
      else if (cell_value == config.CELL_VALUE_EMPTY && ((pos_y == i) ^ (pos_x == j))) {
        field[i][j] = config.CELL_VALUE_EMPTY | config.CELL_VALUE_DISCOVERED
        field = discoverField({ state: state }, field, j, i)
      }
    }
  }

  field[pos_y][pos_x] = mines_count | config.CELL_VALUE_DISCOVERED

  return field
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
