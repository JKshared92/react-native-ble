import React from 'react'
import {
  View, Text, StyleSheet,
  Alert, ScrollView, TouchableOpacity,
  Image, Dimensions, TouchableWithoutFeedback
} from 'react-native'
const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;
import { SwitchActions } from 'react-navigation'
import { Toast, Modal, Button, Portal } from '@ant-design/react-native';
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

export default class NewConnected extends React.Component {
  static navigationOptions = (props) => {
    return {
      title: '当前设备',
      headerRight: () => <HeaderRightNavi {...props} />
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    }
  }

  componentDidMount() {
    this.start()
  }

  render() {
    const { isOpen } = this.state
    return (
      <View style={styles.container}>
        <View style={styles.top_container}>
          <Image style={styles.image_view1} source={require('./assets/name.png')}/>
          <Image style={styles.image_view2} source={require('./assets/code.png')}/>
        </View>
        <Text style={styles.big_title}>智能蓬布系统控制器</Text>
        <View style={styles.center_container}>
          <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('888881')}>
            <View style={styles.open_box}>
              <Text style={styles.open_title}>开</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('888880')}>
            <View style={styles.close_box}>
              <Text style={styles.open_title}>关</Text>
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.left_box}>
            <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('111112')}>
              <Text style={styles.left_box_title}>前升</Text>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('111113')}>
              <Text style={styles.left_box_title}>前降</Text>
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.right_box}>
              <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('222223')}>
                <Text style={styles.left_box_title}>后升</Text>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('222224')}>
                <Text style={styles.left_box_title}>后降</Text>
              </TouchableWithoutFeedback>
            </View>
          <View style={styles.cycle_container}>
            <View style={styles.left_line}></View>
            <View style={styles.right_line}></View>
            <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('111111')}>
              <Text style={styles.top_bottom_title}>全升</Text>
            </TouchableWithoutFeedback>
            <View style={styles.center_box}>
              <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('555551')}>
                <Text style={styles.left_right_title}>侧开</Text>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('000000')}>
                <View style={styles.center_view}>
                  <Text style={styles.center_view_title}>急停</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('555550')}>
                <Text style={styles.left_right_title}>侧关</Text>
              </TouchableWithoutFeedback>
            </View>
            <TouchableWithoutFeedback onPress={()=>this.updateSettingModel('222222')}>
              <Text style={styles.top_bottom_title}>全降</Text>
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.directive_box}>
            {isOpen ? <View style={styles.directive_green}></View>
            : <View style={styles.directive_red}></View>}
            <Text style={styles.directive_title}>指示灯</Text>
          </View>
        </View>
      </View>
    )
  }

  updateSettingModel = (value) => {
    // Toast.info('点击事件')
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
    if (this.state.isOpen) {
      Toast.info('已开启')
      return
    }
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

  /** 关闭 */
  close = () => {
    if (!this.state.isOpen) {
      Toast.info('已关闭')
      return
    }
    Toast.loading('关闭中...')
    BluetoothManager.stopNotification()
      .then(()=>{
        Portal.remove()
        Toast.info('关闭成功')
        this.setState({
          isOpen: false
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
    flex: 1,
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  top_container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginRight: 10,
    marginTop: 10,
  },
  image_view1: {
    width: 124,
    height: 55,
    marginLeft: 10,
    resizeMode: 'cover',
  },
  image_view2: {
    width: 100,
    height: 100,
  },
  big_title: {
    fontSize: 24,
    fontWeight: '500',
    marginTop: 20,
  },
  center_container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  cycle_container: {
    marginTop: 20,
    position: 'relative',
    height: 180,
    width: 180,
    borderRadius: 90,
    backgroundColor: '#33BEF2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  left_line: {
    backgroundColor: '#fff',
    height: 3,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 88.5,
    transform: [{rotateZ: '45deg'}]
  },
  right_line: {
    backgroundColor: '#fff',
    height: 3,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 88.5,
    transform: [{rotateZ: '135deg'}]
  },
  center_box: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  center_view: {
    height: 70,
    width: 70,
    borderRadius: 35,
    backgroundColor: '#CD252A',
    borderColor: '#fff',
    borderWidth: 3,
  },
  center_view_title: {
    color: '#fff',
    fontSize: 24,
    width: '100%',
    lineHeight: 64,
    textAlign: 'center',
  },
  left_right_title: {
    height: 70,
    width: 45,
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
  },
  top_bottom_title: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 50,
    textAlign: 'center',
  },
  open_box: {
    backgroundColor: '#306B3C',
    height: 50,
    width: 50,
    position: 'absolute',
    borderRadius: 25,
    top: 20,
    left: -35,
  },
  open_title: {
    fontSize: 24,
    color: '#fff',
    width: '100%',
    lineHeight: 50,
    textAlign: 'center',
  },
  close_box: {
    backgroundColor: '#CD252A',
    height: 50,
    width: 50,
    position: 'absolute',
    borderRadius: 25,
    top: 20,
    right: -35,
  },
  left_box: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#33BEF2',
    height: 150,
    width: 50,
    borderRadius: 5,
    position: 'absolute',
    left: -50,
    top: 135,
  },
  right_box: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#33BEF2',
    height: 150,
    width: 50,
    borderRadius: 5,
    position: 'absolute',
    right: -50,
    top: 135,
  },
  left_box_title: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 60,
  },
  directive_box: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  directive_green: {
    backgroundColor: '#306B3C',
    height: 10,
    width: 10,
    borderRadius: 5,
  },
  directive_red: {
    backgroundColor: '#CD252A',
    height: 10,
    width: 10,
    borderRadius: 5,
  },
  directive_title: {
    marginTop: 5,
    color: '#33BEF2',
    fontSize: 18,
  },
});
