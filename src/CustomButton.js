import React from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types';

export default class CustomButton extends React.Component {
  static propTypes = {
    onPress: PropTypes.func,
    title: PropTypes.string,
    warning: PropTypes.bool
  }
  render() {
    let { title, warning } = this.props;
    return (
      <TouchableOpacity style={warning ? styles.warning : styles.ghost} onPress={this.props.onPress}>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  ghost: {
    width: 70,
    height: 35,
    borderRadius: 17,
    borderColor: '#fff',
    borderWidth: 3,
    backgroundColor: '#081E64'
  },
  warning: {
    width: 70,
    height: 35,
    textAlign: 'center',
    borderRadius: 17,
    borderColor: '#fff',
    borderWidth: 3,
    backgroundColor: '#FB0006'
  },
  title: {
    lineHeight: 29,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '500'
  }
})
