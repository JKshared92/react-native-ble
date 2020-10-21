/**
 * 已连接界面
 */

import React from 'react'
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native'
import { SwitchActions } from 'react-navigation'
import { Toast, Button, Modal, Portal } from '@ant-design/react-native';
import Storage from './Storage';
import {
  ParsingMessage, sendMessageToBluetooth,
  CONNECT_TYPE, POMP_STATE, FAULT_TYPE
} from './Config';

const prompt = Modal.prompt;

class HeaderRightNavi extends React.Component {
  render() {
    return (
      <Button style={{ marginRight: 10 }} type='ghost' size='small' onPress={this.handleClickSetting}>断开</Button>
    )
  }

  handleClickSetting = () => {
    // this.props.navigation.push('Setting')
    Toast.info('已断开蓝牙', 2)
    BluetoothManager.stopNotification();
    BluetoothManager.disconnect();
    Storage.removeItem('connect-uuid');
    setTimeout(() => {
      this.props.navigation.dispatch(SwitchActions.jumpTo({ routeName: 'AppNavigator' }));
    }, 2000)
  }
}

export default class Connected extends React.Component {
  static navigationOptions = (props) => {
    return {
      title: '当前设备',
      headerRight: () => <HeaderRightNavi {...props} />
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      currentType: 'normal',
    }
  }

  componentDidMount() {
    // BluetoothManager.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValue);
    this.start()
  }

  render() {
    const {
      voltage,
      pompState,
      motorCurrent,
      faultType,
      operationHours,
      StallCurrent,
      protect } = this.state
    return (

      <View style={{ flex: 1 }}>
        <ScrollView>
          <View style={styles.container}>
            <Button type="ghost" onPress={this.start}>开启</Button>
            <Button type='warning' onPress={()=>this.updateSettingModel('000000')}>对码</Button>
            <Button type="ghost" onPress={this.close}>关闭</Button>
          </View>
          <View style={styles.container}>
            <Button type="ghost" onPress={()=>this.updateSettingModel('111111')}>全升</Button>
            <Button type='warning' onPress={()=>this.updateSettingModel('999999')}>电源</Button>
            <Button type="ghost" onPress={()=>this.updateSettingModel('222222')}>全降</Button>
          </View>
          <View style={styles.container}>
            <Button type="ghost" onPress={()=>this.updateSettingModel('111112')}>前升</Button>
            <Button type="ghost" onPress={()=>this.updateSettingModel('111113')}>前降</Button>
            <Button type='ghost' onPress={()=>this.updateSettingModel('222223')}>后升</Button>
            <Button type="ghost" onPress={()=>this.updateSettingModel('222224')}>后降</Button>
          </View>
          <View style={styles.container}>
            <Button type="ghost" onPress={()=>this.updateSettingModel('333331')}>电流+</Button>
            <Button type="ghost" onPress={()=>this.updateSettingModel('333330')}>电流-</Button>
            <Button type='ghost' onPress={()=>this.updateSettingModel('444441')}>时间+</Button>
            <Button type="ghost" onPress={()=>this.updateSettingModel('444440')}>时间-</Button>
          </View>
        </ScrollView>
      </View>
    )
  }

  updateSettingModel = (value) => {
    Toast.loading('传输中...')
    const result = sendMessageToBluetooth(value)
    if (result.status !== '200') {
      Toast.info(result.message, 2)
      return
    }
    const resultValue = result.value
    console.log('写入的数据:', resultValue)
    BluetoothManager.write(resultValue)
      .then(() => {
        // this.updateDate(saveName, value)
        Portal.remove()
        Toast.info('成功', 2)
      }).catch(() => {
        Portal.remove()
        Toast.info('设置参数出错', 2)
      })
  }

  /** 开启 */
  start = () => {
    if (this.state.currentType === 'start') {
      Toast.info('已开启')
      return
    }
    Toast.loading('开启中...')
    BluetoothManager.startNotification()
      .then(()=>{
        Portal.remove()
        Toast.info('开启成功')
        this.setState({
          currentType: 'start'
        })
      })
      .catch(err=>{
        Portal.remove()
        Toast.info('开启失败')
      })
  }

  /** 关闭 */
  close = () => {
    if (this.state.currentType === 'end') {
      Toast.info('已关闭')
      return
    }
    Toast.loading('关闭中...')
    BluetoothManager.stopNotification()
      .then(()=>{
        Portal.remove()
        Toast.info('关闭成功')
        this.setState({
          currentType: 'end'
        })
      })
      .catch(err=>{
        Portal.remove()
        Toast.info('关闭失败')
      })
  }

  /** 停止 */
  stop = () => {
    BluetoothManager.stopNotification()
      .then(()=>{
        this.alert('已停止接收');
        this.setState({
          currentType: '已停止'
        })
        sendMessageToBluetooth(CONNECT_TYPE.STOP, 0)
      })
      .catch(err=>{
        this.alert('关闭失败');
      })
  }

  alert(text){
    Alert.alert('提示',text,[{ text:'确定',onPress:()=>{ } }]);
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
  },
  contentView: {
    display: 'flex',
    marginTop: 20,
    width: '100%',
    padding: 20,
    flexDirection: 'column'
  },
  contentText: {
    marginBottom: 10,
    fontSize: 17,
  },
  settingContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  settingText: {
    fontSize: 17,
    marginRight: 20
  }
})
