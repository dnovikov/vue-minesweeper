import Vue from 'vue'
import Vuex from 'vuex'
import field from './modules/field'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    field
  },
  strict: debug
})
