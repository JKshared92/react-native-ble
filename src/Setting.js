/**
 * 设置界面
 */

import React from 'react'
import { View, Text } from 'react-native'
import { Button, Toast, List, InputItem } from '@ant-design/react-native';
import Storage from './Storage'

class HeaderRightNavi extends  React.Component {
  render() {
    return (
      <Button style={{ marginRight: 10 }} type='ghost' size='small' onPress={this.handleClickSaving}>保存</Button>
    )
  }

  handleClickSaving = () => {
    this.props.navigation.state.params.clickSave()
  }
}

export default class Setting extends React.Component {
  static navigationOptions = (props) => {
    return {
      title: '参数设置',
      headerRight: () => <HeaderRightNavi {...props} />
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      operationHours: '', // 运行时间
      StallCurrent: '',   // 堵转电流
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({clickSave: () => this.handleClick()})
  }

  clickSaveForm = async () => {
    Toast.info('保存成功', 2)
    await Storage.saveItem('time', this.state.operationHours)
    await Storage.saveItem('stall', this.state.StallCurrent);
    this.props.navigation.pop();
    // console.log('setTime:', Storage.getItem('time'))
  }

  render() {
    // 运行时间 、 堵转电流
    return (
      <List>
        <InputItem clear value={this.state.operationHours}
          onChange={value => {
            this.setState({
              operationHours: value,
            });
          }}
          placeholder="填写运行时间"
        >运行时间</InputItem>
        <InputItem clear value={this.state.StallCurrent}
          onChange={value => {
            this.setState({
              StallCurrent: value,
            });
          }}
          placeholder="填写堵转电流"
        >堵转电流</InputItem>
      </List>
    )
  }

  handleClick = () => {
    const { operationHours, StallCurrent } = this.state;
    BluetoothManager.write('写入的数据',index)
      .then(()=>{
          this.bluetoothReceiveData = [];
          this.setState({
              writeData:this.state.text,
              text:'',
          })
      })
      .catch(err=>{
          Toast.info('发送失败', 2)
      })
  }
}
