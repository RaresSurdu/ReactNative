'use strict';

import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Navigator,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native';

class MainPage extends Component {
  constructor(props) {
    super(props);
    console.log('EmployeeManager - MainPage constructor');
    this.username = props.username;
    this.password = props.password;
    }

  render()
{
    return (
      <Navigator
          renderScene={this.renderScene.bind(this)}
          ref={(navigator) => this.navigator = navigator}
          navigationBar={
            <Navigator.NavigationBar style={{backgroundColor: '#246dd5'}}
                routeMapper={NavigationBarRouteMapper} />
          } />
    );
  }
  renderScene(route, navigator) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent:'center'}}>
          <Text> Hello </Text>
        <TouchableHighlight style={{backgroundColor: 'yellow', padding: 10}}
            onPress={this.gotoPersonPage.bind(this)}>
          <Text style={{ color: 'black'}}>Hello</Text>
        </TouchableHighlight>
      </View>

    );
  }
  gotoPersonPage() {
    this.props.navigator.push({
      id: 'PersonPage',
      name: 'Person Page',
    });
  }
}

var NavigationBarRouteMapper = {
  LeftButton(route, navigator, index, navState) {
    return (
      <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}
          onPress={() => navigator.parentNavigator.pop()}>
        <Text style={{color: 'white', margin: 10, fontSize: 16}}>
          Go back
        </Text>
      </TouchableOpacity>
    );
  },
  RightButton(route, navigator, index, navState) {
    return null;
  },
  Title(route, navigator, index, navState) {
    return (
      <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}>
        <Text style={{color: 'white', margin: 10, fontSize: 16}}>
          Employees
        </Text>
      </TouchableOpacity>
    );
  },
};

module.exports = MainPage;
