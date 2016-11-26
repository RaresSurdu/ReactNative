'use strict';

import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Navigator,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  BackAndroid,
  Alert
} from 'react-native';

class Login extends Component {
    constructor(props) {
        super(props);
        console.log('SistemInformatic - constructor');
        this.state = {
            username: '',
            password: '',
            logged: false
        }
        this.NavigationBarRouteMapper = {
            LeftButton(route, navigator, index, navState) {
                return null;
            },
            RightButton(route, navigator, index, navState) {
                return null;
            },
            Title(route, navigator, index, navState) {
                return (
                    <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}
                                      onPress={() =>{
                                      console.log(navigator.getCurrentRoutes().id);
                                      if (navigator.getCurrentRoutes().length === 1  ) {
                                        navigator.pop();
                                       }
                                      }
                                      }>
                        <Text style={{color: 'white', margin: 1, fontSize: 16}}>
                            SistemInformatic
                        </Text>
                    </TouchableOpacity>
                );
            }
        }
    }

  render() {
      console.log('Login - render');

    return (
      <Navigator
          renderScene={this.renderScene.bind(this)}

          navigationBar={
            <Navigator.NavigationBar style={{backgroundColor: '#246dd5', alignItems: 'center'}}
                routeMapper={this.NavigationBarRouteMapper} />
          } />
    );
  }
  renderScene(route, navigator) {
    return (
      <View style={{flex: 1, alignItems: 'center', marginTop: 90}}>
          <Text style={{textAlign: 'center', fontSize: 20}}>Welcome to EmployeeManager! </Text>

          <Image source={require('./img/students.png')} style={{width: 193, height: 130, marginTop: 10}}/>

          <TextInput placeholder='Enter username...'
                     style={{width:200, textAlign: 'center'}}
                     onChangeText={(text) => this.setState({...this.state, username: text})}/>

          <TextInput placeholder='Enter password...'
                     style={{width:200, textAlign: 'center'}}
                     secureTextEntry={true}
                     onChangeText={(text) => this.setState({...this.state, password: text})}/>

        <TouchableHighlight
            onPress={this.state.logged? this.exit.bind(this) : this.gotoNext.bind(this)}>
            <Image source= {this.state.logged? require('./exitButton.png') : require('./loginButton.png')} style={{marginTop: 10}}/>
        </TouchableHighlight>
      </View>
    );
  }
  exit(){
      Alert.alert(
          'Exit?',
          'Are you sure?',
          [
              {text: 'Yes', onPress: () => {
                                            console.log('Exit Pressed');
                                            this.state.username = '';
                                            this.state.password = '';
                                            this.state.logged = false;
                                            BackAndroid.exitApp();
                                          }
              },
              {text: 'No', onPress: this.gotoNext.bind(this)}
          ]
      )
  }
  gotoNext() {
      this.setState({...this.state, logged: true});
      if (this.state.username == '' || this.state.password == '') {
          Alert.alert(
              'Empty field(s)!',
              'Please fill username and password!',
              [
                  {text: 'OK', onPress: () => console.log('OK Pressed')},
              ]
          )
      }
      else { // How to pass username and password to next scene ?
      this.props.navigator.push({
          id: 'MainPage',
          name: 'Main Page',
          passProps: {username: this.state.username, password: this.state.password}
      });
  }
  }
}

module.exports = Login;
