/**
 * 已连接界面
 */

import React from 'react'
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Image, Dimensions, ImageBackground } from 'react-native'
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

      <View style={{ flex: 1, backgroundColor: '#0C2F76' }}>
        <ScrollView>
          <View style={styles.topView}>
            <View style={styles.imageView}>
              <Image style={styles.image1} source={require('./assets/qrcode.png')}/>
            </View>
            <View style={styles.topSubView}>
              <Image style={styles.image} source={require('./assets/header.png')}/>
            </View>
          </View>
          <ImageBackground style={styles.mainContent} source={require('./assets/body.png')}>
            <Image style={styles.image2} source={require('./assets/logo.png')}/>
            <View style={styles.container}>
              <CusButton onPress={this.start} title="开启"></CusButton>
              <CusButton onPress={()=>this.updateSettingModel('000000')} title="对码"></CusButton>
              <CusButton onPress={this.close} title="关闭"></CusButton>
            </View>
            <View style={styles.container}>
              <CusButton onPress={()=>this.updateSettingModel('111111')} title="全升"></CusButton>
              <CusButton warning={true} onPress={()=>this.updateSettingModel('999999')} title="电源"></CusButton>
              <CusButton onPress={()=>this.updateSettingModel('222222')} title="全降"></CusButton>
            </View>
            <View style={styles.container}>
              <CusButton onPress={()=>this.updateSettingModel('111112')} title="前升"></CusButton>
              <CusButton onPress={()=>this.updateSettingModel('111113')} title="前降"></CusButton>
              <CusButton onPress={()=>this.updateSettingModel('222223')} title="后升"></CusButton>
              <CusButton onPress={()=>this.updateSettingModel('222224')} title="后降"></CusButton>
            </View>
            <View style={styles.container}>
              <CusButton onPress={()=>this.updateSettingModel('333331')} title="电流+"></CusButton>
              <CusButton onPress={()=>this.updateSettingModel('333330')} title="电流-"></CusButton>
              <CusButton onPress={()=>this.updateSettingModel('444441')} title="时间+"></CusButton>
              <CusButton onPress={()=>this.updateSettingModel('444440')} title="时间-"></CusButton>
            </View>
          </ImageBackground>
          <Text style={styles.company}>河南大诚自动篷布技术有限公司</Text>
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
  },
  topView: {
    position: 'relative'
  },
  topSubView: {
    position: 'absolute'
  },
  image: {
    width: screenW,
    height: screenW * 310 / 750,
  },
  imageView: {
    marginTop: 5,
    zIndex: 10,
    shadowColor: '#000',
    elevation: 5,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  image1: {
    marginLeft: 10,
    width: screenW - 20,
    height: screenW * 369 / 714,
    resizeMode: 'contain'
  },
  image2: {
    width: 128,
    height: 50
  },
  mainContent: {
    width: screenW,
    height: screenW * 864 / 750,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  company: {
    fontSize: 18,
    fontWeight: '500',
    width: screenW,
    paddingLeft: 18,
    paddingRight: 18,
    marginTop: 10,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 3
  }
})
