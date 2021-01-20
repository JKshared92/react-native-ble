/**
 * 已连接界面
 */

import React from 'react'
import { View, Text, StyleSheet, Alert, ScrollView, TouchableWithoutFeedback, Image, Dimensions, ImageBackground } from 'react-native'
import { SwitchActions } from 'react-navigation'
import { Toast, Modal, Button, Portal } from '@ant-design/react-native';
import CusButton from './CustomButton'
import Storage from './Storage';
import {
  ParsingMessage, sendMessageToBluetooth,
  CONNECT_TYPE, POMP_STATE, FAULT_TYPE
} from './Config';
const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;
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
    }
  }

  componentDidMount() {
    this.start()
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.fisrt_box}>
          <Image style={styles.first_image_one} source={require('./assets/stop.png')}></Image>
          <View style={styles.first_box_second}>
            <Image style={styles.first_image_two} source={require('./assets/background.jpg')} />
          </View>
          <Image style={styles.fisrt_image_three} source={require('./assets/qrcode.jpg')}></Image>
        </View>
        <View style={styles.second_box}>
          <Text style={styles.second_box_title}>智能篷布系统控制器</Text>
          <Text style={styles.second_box_margin}>TY-1000-10</Text>
        </View>
        <View style={styles.center_box}>
          <View style={styles.center_box_item}>
            <View style={styles.center_box_red_cycle}></View>
            <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('222333')}>
              <Image style={styles.center_box_btn} source={require('./assets/stop.png')} />
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.center_box_item}>
            <View style={styles.center_box_blue_cycle}></View>
            <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('222555')}>
              <Image style={styles.center_box_btn} source={require('./assets/pos.png')} />
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.center_box_item}>
            <View style={styles.center_box_blue_cycle}></View>
            <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('222444')}>
              <Image style={styles.center_box_btn} source={require('./assets/rever.png')} />
            </TouchableWithoutFeedback>
          </View>
        </View>
        <View style={styles.bottom_box}>
          <Text style={styles.second_box_title}>长葛市腾源气配有限公司</Text>
        </View>
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

  start = () => {
    Toast.loading('开启中...')
    BluetoothManager.startNotification()
      .then(()=>{
        Portal.remove()
        setTimeout(()=>{
          Toast.info('开启成功')
        }, 100);
        this.setState({
          isOpen: true
        })
      })
      .catch(err=>{
        Portal.remove()
        Toast.info('开启失败')
      })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  fisrt_box: {
    display: 'flex',
    flexDirection: 'row',
  },
  first_image_one: {
    height: 50,
    width: 50,
    resizeMode: 'center',
    backgroundColor: '#ccc',
  },
  first_box_second: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#666',
  },
  first_image_two: {
    height: 100,
    width: '100%',
    resizeMode: 'contain',
    backgroundColor: '#333',
  },
  fisrt_image_three: {
    width: 60,
    height: 80,
    backgroundColor: '#ccc',
  },
  second_box: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  second_box_title: {
    fontSize: 24,
    fontWeight: '500'
  },
  second_box_margin: {
    fontSize: 24,
    fontWeight: '500',
    marginTop: 10,
  },
  center_box: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 25,
    width: '100%',
  },
  center_box_item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  center_box_red_cycle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#DF0717'
  },
  center_box_blue_cycle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#069DE7'
  },
  center_box_btn: {
    marginTop: 30,
    height: 60,
    width: 60,
    backgroundColor: '#ccc'
  },
  bottom_box: {
    borderBottomColor: '#069DE7',
    borderBottomWidth: 1,
  }
})
