import { createAction, createReducer } from 'redux-act'
import { push } from 'react-router-redux'
import { pendingTask, begin, end } from 'react-redux-spinner'
import { message } from 'antd'

import axios from '../axiosInst'

const REDUCER = 'app'
const NS = `@@${REDUCER}/`

const _setFrom = createAction(`${NS}SET_FROM`)
const _setLoading = createAction(`${NS}SET_LOADING`)
const _setHideLogin = createAction(`${NS}SET_HIDE_LOGIN`)

export const setUserState = createAction(`${NS}SET_USER_STATE`)
export const setUpdatingContent = createAction(`${NS}SET_UPDATING_CONTENT`)
export const setActiveDialog = createAction(`${NS}SET_ACTIVE_DIALOG`)
export const deleteDialogForm = createAction(`${NS}DELETE_DIALOG_FORM`)
export const addSubmitForm = createAction(`${NS}ADD_SUBMIT_FORM`)
export const deleteSubmitForm = createAction(`${NS}DELETE_SUBMIT_FORM`)
export const setLayoutState = createAction(`${NS}SET_LAYOUT_STATE`)

export const setLoading = isLoading => {
  const action = _setLoading(isLoading)
  action[pendingTask] = isLoading ? begin : end
  return action
}

export const resetHideLogin = () => (dispatch, getState) => {
  const state = getState()
  if (state.pendingTasks === 0 && state.app.isHideLogin) {
    dispatch(_setHideLogin(false))
  }
  return Promise.resolve()
}

export const initAuth = () => (dispatch, getState) => {
  // Use Axios there to get User Data by Auth Token with Bearer Method Authentication

  let user = window.sessionStorage.getItem('app.User')
  const state = getState()
  if (user) {
    dispatch(
      setUserState({
        userState: {
          ...JSON.parse(user),
        },
      }),
    )
    return Promise.resolve(true)
  }
  const location = state.routing.location
  const from = location.pathname + location.search
  dispatch(_setFrom(from))
  dispatch(push('/login'))
  return Promise.reject()
}

export async function login(username, password, dispatch) {
  try {
    const res = await axios.post('/user/login', { username: username, password: password })
    if (res.data) {
      window.sessionStorage.setItem('app.User', JSON.stringify(res.data))
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.token
      dispatch(_setHideLogin(true))
      dispatch(push('/'))
      return true
    } else {
      dispatch(push('/login'))
      dispatch(_setFrom(''))
      return false
    }
  } catch (err) {
    console.log(err)
  }
}

export const logout = () => (dispatch, getState) => {
  dispatch(
    setUserState({
      userState: {
        _id: null,
        username: '',
        fullname: '',
        dept: '',
        roles: [],
        group: [],
        create_date: null,
        update_date: null,
        last_login: null,
        record_status: '',
        token: '',
        menu: [],
        link: [],
      },
    }),
  )
  window.sessionStorage.setItem('app.User', '')
  window.localStorage.removeItem('app.layoutState')
  dispatch(push('/login'))
}

const initialState = {
  // APP STATE
  from: '',
  isUpdatingContent: false,
  isLoading: false,
  activeDialog: '',
  dialogForms: {},
  submitForms: {},
  isHideLogin: false,

  // LAYOUT STATE
  layoutState: {
    isMenuTop: true,
    menuMobileOpened: false,
    menuCollapsed: false,
    menuShadow: true,
    themeLight: true,
    squaredBorders: false,
    borderLess: true,
    fixedWidth: false,
    settingsOpened: false,
  },

  // USER STATE
  userState: {
    _id: null,
    username: '',
    fullname: '',
    dept: '',
    roles: [],
    group: [],
    create_date: null,
    update_date: null,
    last_login: null,
    record_status: '',
    token: '',
    menu: window.sessionStorage.getItem('app.User')
      ? JSON.parse(window.sessionStorage.getItem('app.User')).menu
      : [],
    link: [],
  },
}

export default createReducer(
  {
    [_setFrom]: (state, from) => ({ ...state, from }),
    [_setLoading]: (state, isLoading) => ({ ...state, isLoading }),
    [_setHideLogin]: (state, isHideLogin) => ({ ...state, isHideLogin }),
    [setUpdatingContent]: (state, isUpdatingContent) => ({ ...state, isUpdatingContent }),
    [setUserState]: (state, { userState }) => ({ ...state, userState }),
    [setLayoutState]: (state, param) => {
      const layoutState = { ...state.layoutState, ...param }
      const newState = { ...state, layoutState }
      window.localStorage.setItem('app.layoutState', JSON.stringify(newState.layoutState))
      return newState
    },
    [setActiveDialog]: (state, activeDialog) => {
      const result = { ...state, activeDialog }
      if (activeDialog !== '') {
        const id = activeDialog
        result.dialogForms = { ...state.dialogForms, [id]: true }
      }
      return result
    },
    [deleteDialogForm]: (state, id) => {
      const dialogForms = { ...state.dialogForms }
      delete dialogForms[id]
      return { ...state, dialogForms }
    },
    [addSubmitForm]: (state, id) => {
      const submitForms = { ...state.submitForms, [id]: true }
      return { ...state, submitForms }
    },
    [deleteSubmitForm]: (state, id) => {
      const submitForms = { ...state.submitForms }
      delete submitForms[id]
      return { ...state, submitForms }
    },
  },
  initialState,
)
