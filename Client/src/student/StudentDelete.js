import React, {Component} from 'react';
import {Text, View, TextInput, TouchableOpacity, ActivityIndicator, Button} from 'react-native';
import {saveStudent, cancelSaveStudent, deleteStudent} from './service';
import {registerRightAction, issueText, getLogger} from '../core/utils';
import styles from '../core/styles';
import {StudentList} from './StudentList';
const log = getLogger('studentDelete');
const STUDENT_DELETE_ROUTE = 'student/delete';

export class StudentDelete extends Component {
    static get routeName() {
        log('routename-delete');
        return STUDENT_DELETE_ROUTE;
    }

    static get route() {
        log('route-delete');
        return {name: STUDENT_DELETE_ROUTE, title: 'Student Delete', rightText: 'Delete'};
    }

    constructor(props) {
        log('constructor');
        super(props);
        const nav = this.props.navigator;
        const currentRoutes = nav.getCurrentRoutes();
        const currentRoute = currentRoutes[currentRoutes.length - 1];
        if (currentRoute.data) {
            this.state = {student: {...currentRoute.data}, isDeleting: false};
        } else {
            this.state = {student: {text: ''}, isDeleting: false};
        }
        registerRightAction(this.props.navigator, this.onDelete.bind(this));
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
        <Text>Do you want to delete this student?</Text>
        <Text>{this.state.student.text}</Text>
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