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
      isStart: false,
      isClose: false,
      isStop: false,
    }
  }

  componentDidMount() {
    // BluetoothManager.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValue);
    this.start()
  }

  previousStart = () => {
    setInterval(() => {
      this.setState({
        isStart: !this.state.isStart
      })
    }, 500)
  }

  previousStop = () => {
    setInterval(() => {
      this.setState({
        isStop: !this.state.isStop
      })
    }, 500)
  }

  previousClose = () => {
    setInterval(() => {
      this.setState({
        isClose: !this.state.isClose
      })
    }, 500)
  }

  stopPrevious = () => {
    this.setState({
      isStop: false,
      isStart: false,
      isClose: false
    })
  }

  render() {
    const { isStart, isClose, isStop } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.top_wrapper}>
          <View style={styles.top_sub_box}>
            <Image source={require('./assets/name.png')} style={styles.top_big_img} />
          </View>
          <View style={styles.top_sub_box}>
            <Image source={require('./assets/left.jpg')} style={styles.top_little_img} />
            <Image source={require('./assets/center.jpg')} style={styles.top_little_img} />
            <Image source={require('./assets/right.jpg')} style={styles.top_little_img} />
          </View>
        </View>
        <View style={styles.center_box}>
          <View style={styles.center_sub_box}>
            <View style={styles.white_box}>
              {isStart ? <View style={styles.green_box}></View> : null}
            </View>
            <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('322300')}>
              <Image source={require('./assets/start.jpg')} style={styles.bottom_btn_img} />
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.center_sub_box}>
            <View style={styles.white_box}>
              {isStop ? <View style={styles.red_box}></View> : <View style={styles.green_box}></View>}
            </View>
            <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('322301')}>
              <Image source={require('./assets/stop.jpg')} style={styles.bottom_btn_img} />
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.center_sub_box}>
            <View style={styles.white_box}>
              {isClose ? <View style={styles.green_box}></View> : null}
            </View>
            <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('322302')}>
              <Image source={require('./assets/close.jpg')} style={styles.bottom_btn_img} />
            </TouchableWithoutFeedback>
          </View>
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
        this.stopPrevious()
        if (value === '322300') {
          this.previousStart()
        }
        if (value === '322301') {
          this.previousStop()
        }
        if (value === '322302') {
          this.previousClose()
        }
      }).catch(() => {
        Portal.remove()
        Toast.info('设置参数出错', 2)
      })
  }

  /** 开启 */
  start = () => {
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

  alert(text){
    Alert.alert('提示',text,[{ text:'确定',onPress:()=>{ } }]);
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    paddingTop: 20,
    backgroundColor: '#0C2F76',
    height: '100%',
  },
  top_wrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  top_sub_box: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  top_big_img: {
    width: '100%',
    resizeMode: 'contain',
    marginLeft: 20,
    height: 55,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  top_little_img: {
    height: 30,
    width: 40,
    marginRight: 10,
  },
  center_box: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 120,
    paddingLeft: 20,
    paddingRight: 20,
  },
  center_sub_box: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  bottom_btn_img: {
    width: 65,
    height: 50,
    marginTop: 25,
  },
  white_box: {
    backgroundColor: '#fff',
    height: 20,
    width: 20,
    borderRadius: 10,
  },
  green_box: {
    backgroundColor: 'green',
    height: 20,
    width: 20,
    borderRadius: 10,
  },
  red_box: {
    backgroundColor: 'red',
    height: 20,
    width: 20,
    borderRadius: 10,
  }
})
