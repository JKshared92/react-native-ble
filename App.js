import React, { Component } from "react";
import { StyleSheet } from "react-native";
import AppContainer from "./src/RouterList";
import { Provider } from "@ant-design/react-native";
import Index from './src/index';

export default class App extends React.Component {
  render() {
    return (
      <Provider styles={styles.wrapper}>
        <AppContainer />
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
});
