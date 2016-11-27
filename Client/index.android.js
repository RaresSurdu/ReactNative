/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React, {Component} from 'react';
import {AppRegistry} from 'react-native';
import {createStore, applyMiddleware, combineReducers} from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import {studentReducer} from './src/student';
import {authReducer} from './src/auth';
import {Router} from './src/Router'

const rootReducer = combineReducers({student: studentReducer, auth: authReducer});
const store = createStore(rootReducer, applyMiddleware(thunk, createLogger()));
// const store = createStore(rootReducer, applyMiddleware(thunk));

export default class RNStudents extends Component {
  render() {
    return (
      <Router store={store}/>
    );
  }
}

AppRegistry.registerComponent('RNtudents', () => RNStudentss);
