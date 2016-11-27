import {getLogger} from '../core/utils';
import {apiUrl, authHeaders} from '../core/api';
const log = getLogger('student/service');
const action = (type, payload) => ({type, payload});

const DELETE_STUDENT_STARTED = 'student/deleteStarted';
const DELETE_STUDENT_SUCCEEDED = 'student/deleteSucceeded';
const DELETE_STUDENT_FAILED = 'student/deleteFailed';
const CANCEL_DELETE_STUDENT = 'student/cancelDelete';


const SAVE_STUDENT_STARTED = 'student/saveStarted';
const SAVE_STUDENT_SUCCEEDED = 'student/saveSucceeded';
const SAVE_STUDENT_FAILED = 'student/saveFailed';
const CANCEL_SAVE_STUDENT = 'student/cancelSave';

const LOAD_STUDENTS_STARTED = 'student/loadStarted';
const LOAD_STUDENTS_SUCCEEDED = 'student/loadSucceeded';
const LOAD_STUDENTS_FAILED = 'student/loadFailed';
const CANCEL_LOAD_STUDENTS = 'student/cancelLoad';

export const loadStudents = () => (dispatch, getState) => {
  log(`loadStudents started`);
  dispatch(action(LOAD_STUDENTS_STARTED));
  let ok = false;
  return fetch(`${apiUrl}/student`, {method: 'GET', headers: authHeaders(getState().auth.token)})
    .then(res => {
      ok = res.ok;
      return res.json();
    })
    .then(json => {
      log(`loadStudents ok: ${ok}, json: ${JSON.stringify(json)}`);
      if (!getState().student.isLoadingCancelled) {
        dispatch(action(ok ? LOAD_STUDENTS_SUCCEEDED : LOAD_STUDENTS_FAILED, json));
      }
    })
    .catch(err => {
      log(`loadStudents err = ${err.message}`);
      if (!getState().student.isLoadingCancelled) {
        dispatch(action(LOAD_STUDENTS_FAILED, {issue: [{error: err.message}]}));
      }
    });
};
export const cancelLoadStudents = () => action(CANCEL_LOAD_STUDENTS);

export const saveStudent = (student) => (dispatch, getState) => {
  const body = JSON.stringify(student);
  log(`saveStudent started`);
  dispatch(action(SAVE_STUDENT_STARTED));
  let ok = false;
  const url = student._id ? `${apiUrl}/student/${student._id}` : `${apiUrl}/student`;
  const method = student._id ? `PUT` : `POST`;
  return fetch(url, {method, headers: authHeaders(getState().auth.token), body})
      .then(res => {
        ok = res.ok;
        return res.json();
      })
      .then(json => {
        log(`saveStudent ok: ${ok}, json: ${JSON.stringify(json)}`);
        if (!getState().student.isSavingCancelled) {
          dispatch(action(ok ? SAVE_STUDENT_SUCCEEDED : SAVE_STUDENT_FAILED, json));
        }
      })
      .catch(err => {
        log(`saveStudent err = ${err.message}`);
        if (!getState().isSavingCancelled) {
          dispatch(action(SAVE_STUDENT_FAILED, {issue: [{error: err.message}]}));
        }
      });
};
export const deleteStudent = (student) => (dispatch, getState) => {
  const body = JSON.stringify(student);
  log(`deleteStudent started`);
  dispatch(action(DELETE_STUDENT_STARTED));
  let ok = false;
  const url = student._id ? `${apiUrl}/student/${student._id}` : `${apiUrl}/student`;

  return fetch(url, {method:'DELETE', headers: authHeaders(getState().auth.token), body})
      .then(res => {
        log(`deleteStudent orrrk: ${res}`);
        ok = res.ok;
        return res.json;
      })
      .then(json => {
        log(`deleteStudent ok: ${ok}`);
        if (!getState().student.isDeletingCancelled) {
          dispatch(action(ok ? DELETE_STUDENT_SUCCEEDED : DELETE_STUDENT_FAILED, json));
        }
      })
      .catch(err => {
        log(`saveStudent err = ${err.message}`);
        if (!getState().isDeletingCancelled) {
          dispatch(action(DELETE_STUDENT_FAILED, {issue: [{error: err.message}]}));
        }
      });
};
export const cancelSaveStudent = () => action(CANCEL_SAVE_STUDENT);

export const studentReducer = (state = {items: [], isLoading: false, isSaving: false}, action) => { //newState (new object)
  switch(action.type) {
    case LOAD_STUDENTS_STARTED:
      return {...state, isLoading: true, isLoadingCancelled: false, issue: null};
    case LOAD_STUDENTS_SUCCEEDED:
      return {...state, items: action.payload, isLoading: false};
    case LOAD_STUDENTS_FAILED:
      return {...state, issue: action.payload.issue, isLoading: false};
    case CANCEL_LOAD_STUDENTS:
      return {...state, isLoading: false, isLoadingCancelled: true};
    case SAVE_STUDENT_STARTED:
      return {...state, isSaving: true, isSavingCancelled: false, issue: null};
    case SAVE_STUDENT_SUCCEEDED:
      log('save');
      let items = [...state.items];
      let index = items.findIndex((i) => i._id == action.payload._id);
      if (index != -1) {
        items.splice(index, 1, action.payload);
      } else {
        items.push(action.payload);
      }
      return {...state, items, isSaving: false};
    case SAVE_STUDENT_FAILED:
      return {...state, issue: action.payload.issue, isSaving: false};
    case CANCEL_SAVE_STUDENT:
      return {...state, isSaving: false, isSavingCancelled: true};
    case DELETE_STUDENT_STARTED:
      return {...state, isDeleting: true, isDeletingCancelled: false, issue: null};
    case DELETE_STUDENT_SUCCEEDED:
      log('del');
      let itemsD = [...state.items];
      var newArray = itemsD.slice();
      let indexD = itemsD.findIndex((i) => i._id == action.payload._id);
      if (indexD != -1) {
        log('find the id');
        itemsD.splice(indexD, 1);
      } else {
        log('do not find the id');
        var a=itemsD.length;
        var c=newArray.length;
        log(`${a} ${c}`);
      }
      //items.pop();
      return {...state, newArray, isDeleting: false};
    case DELETE_STUDENT_FAILED:
      return {...state, issue: action.payload.issue, isDeleting: false};
    case CANCEL_DELETE_STUDENT:
      return {...state, isDeleting: false, isDeletingCancelled: true};
    default:
      return state;
  }
};

