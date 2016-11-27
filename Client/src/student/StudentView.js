import React, {Component} from 'react';
import {Text, View, StyleSheet, TouchableHighlight} from 'react-native';

export class StudentView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableHighlight onPress={() => this.props.onPress(this.props.student)} onLongPress={() => this.props.onLongPress(this.props.student)}>
        <View>
          <Text style={styles.listItem}>{this.props.student.text}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  listItem: {
    margin: 10,
  }
});