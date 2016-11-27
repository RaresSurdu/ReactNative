import React, {Component} from 'react';
import {Text, View, TextInput, TouchableOpacity, ActivityIndicator, Button} from 'react-native';
import {saveStudent, cancelSaveStudent, deleteStudent} from './service';
import {registerRightAction, issueText, getLogger} from '../core/utils';
import styles from '../core/styles';

const log = getLogger('StudentEdit');
const STUDENT_EDIT_ROUTE = 'student/edit';

export class StudentEdit extends Component {
  static get routeName() {
    return STUDENT_EDIT_ROUTE;
  }

  static get route() {
    return {name: STUDENT_EDIT_ROUTE, title: 'Student Edit', rightText: 'Save', rText: 'Delete'};
  }

  constructor(props) {
    log('constructor');
    super(props);
    const nav = this.props.navigator;
    const currentRoutes = nav.getCurrentRoutes();
    const currentRoute = currentRoutes[currentRoutes.length - 1];
    if (currentRoute.data) {
      this.state = {student: {...currentRoute.data}, isSaving: false};
    } else {
      this.state = {student: {text: ''}, isSaving: false};
    }
      registerRightAction(this.props.navigator, this.onSave.bind(this));
  }

  render() {
    log('render');
    const state = this.state;
    let message = issueText(state.issue);
    return (
      <View style={styles.content}>
        { state.isSaving &&
        <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
        }
        <Text>Text</Text>
        <TextInput value={state.student.text} onChangeText={(text) => this.updateStudentText(text)}></TextInput>
        {message && <Text>{message}</Text>}


    </View>
    );
  }

  componentDidMount() {
    log('componentDidMount');
    this._isMounted = true;
    const store = this.props.store;
    this.unsubscribe = store.subscribe(() => {
      log('setState');
      const state = this.state;
      const studentState = store.getState().student;
      this.setState({...state, issue: studentState.issue});
    });
  }

  componentWillUnmount() {
    log('componentWillUnmount');
    this._isMounted = false;
    this.unsubscribe();
    this.props.store.dispatch(cancelSaveStudent());
  }

  updateStudentText(text) {
    let newState = {...this.state};
    newState.student.text = text;
    this.setState(newState);
  }

    onSave() {
        log('onSave');
        this.props.store.dispatch(saveStudent(this.state.student)).then(() => {
            log('onStudentSaved');
            if (!this.state.issue) {
                this.props.navigator.pop();
            }
        });
    }

    onDelete() {
        log('onDelete');
        this.props.store.dispatch(deleteStudent(this.state.student)).then(() => {
            log('onStudentDeleted');
            if (!this.state.issue) {
                this.props.navigator.pop();
            }
        });
    }
}