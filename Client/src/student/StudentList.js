import React, {Component} from 'react';
import {ListView, Text, View, StatusBar, ActivityIndicator} from 'react-native';
import {StudentEdit} from './StudentEdit';
import {StudentView} from './StudentView';
import {StudentDelete} from './StudentDelete'
import {loadStudents, cancelLoadStudents} from './service';
import {registerRightAction, getLogger, issueText} from '../core/utils';
import styles from '../core/styles';

const log = getLogger('StudentList');
const STUDENT_LIST_ROUTE = 'student/list';

export class StudentList extends Component {
  static get routeName() {
    return STUDENT_LIST_ROUTE;
  }

  static get route() {
    return {name: STUDENT_LIST_ROUTE, title: 'Student List', rightText: 'New'};
  }

  constructor(props) {
    super(props);
    log('constructor');
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id});
    const studentState = this.props.store.getState().student;
    this.state = {isLoading: studentState.isLoading, dataSource: this.ds.cloneWithRows(studentState.items)};
    registerRightAction(this.props.navigator, this.onNewStudent.bind(this));
  }

  render() {
    log('render');
    let message = issueText(this.state.issue);
    return (
      <View style={styles.content}>
        { this.state.isLoading &&
        <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
        }
        {message && <Text>{message}</Text>}
        <ListView
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={student => (<StudentView student={student} onLongPress={(student) => this.onStudentLongPress(student)} onPress={(student) => this.onStudentLongPressPress(student)}/>)}/>
      </View>
    );
  }

  onNewStudent() {
    log('onNewStudent');
    this.props.navigator.push({...StudentEdit.route});
  }
  onStudentLongPress(student) {
    log('onStudentLongPress');
    this.props.navigator.push({...StudentDelete.route, data: student});
  }
  onvPress(student) {
    log('onStudentPress');
    this.props.navigator.push({...StudentEdit.route, data: student});
  }

  componentDidMount() {
    log('componentDidMount');
    this._isMounted = true;
    const store = this.props.store;
    this.unsubscribe = store.subscribe(() => {
      log('setState');
      const state = this.state;
      const studentState = store.getState().student;
      this.setState({dataSource: this.ds.cloneWithRows(studentState.items), isLoading: studentState.isLoading});
    });
    store.dispatch(loadStudents());
  }

  componentWillUnmount() {
    log('componentWillUnmount');
    this._isMounted = false;
    this.unsubscribe();
    this.props.store.dispatch(cancelLoadStudents());
  }
}
