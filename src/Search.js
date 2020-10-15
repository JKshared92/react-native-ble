/**
 * 蓝牙搜索界面
 */

import React from 'react'
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    Platform,
    TextInput,
    Alert
} from 'react-native'
import BleModule from './BleModule';
import { SwitchActions } from 'react-navigation'
import { Toast, Button, Portal } from '@ant-design/react-native';
import Storage from './Storage';

//确保全局只有一个BleManager实例，BleModule类保存着蓝牙的连接信息
global.BluetoothManager = new BleModule();

/** 导航栏右侧按钮 */
class SearchNaviBtn extends React.Component {
  render() {
    return (
      <Button style={{ marginRight: 10 }} type="ghost" size="small" onPress={this.handleClickSearching}>搜索蓝牙</Button>
    )
  }

  handleClickSearching = () => {
    this.props.navigation.state.params.clickSearch()
    // this.props.navigation.dispatch(SwitchActions.jumpTo({ routeName: 'DetailNavigator' }));
  }
}

export default class Search extends React.Component {
  /** 导航栏配置 */
  static navigationOptions = (navigation) => {
    return {
      title: '连接蓝牙设备',
      headerRight: () => <SearchNaviBtn {...navigation} />
    }
  }

  constructor(props) {
    super(props);
    this.state={
      data: [],
      scaning:false,
      isConnected:false,
      text:'',
      writeData:'',
      receiveData:'',
      readData:'',
      isMonitoring:false,
      loadingKey: ''
    }
    this.bluetoothReceiveData = [];  //蓝牙接收的数据缓存
    this.deviceMap = new Map();
  }

  componentDidMount() {
    // 导航栏按钮事件
    this.props.navigation.setParams({ clickSearch: () => this.scan() });
    // 蓝牙初始化
    BluetoothManager.start();
    // 监听
    this.updateStateListener = BluetoothManager.addListener('BleManagerDidUpdateState',this.handleUpdateState);
    this.stopScanListener = BluetoothManager.addListener('BleManagerStopScan',this.handleStopScan);
    this.discoverPeripheralListener = BluetoothManager.addListener('BleManagerDiscoverPeripheral',this.handleDiscoverPeripheral);
    this.connectPeripheralListener = BluetoothManager.addListener('BleManagerConnectPeripheral',this.handleConnectPeripheral);
    this.disconnectPeripheralListener = BluetoothManager.addListener('BleManagerDisconnectPeripheral',this.handleDisconnectPeripheral);

    // this.updateValueListener = BluetoothManager.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValue);
  }

  /** 连接成功跳转到成功页 */
  switchToDetail = async (id) => {
    await Storage.saveItem('connect-uuid', id);
    const saveID = await Storage.getItem('connect-uuid');
    console.log('====连接成功====:', saveID);
    this.props.navigation.dispatch(SwitchActions.jumpTo({ routeName: 'DetailNavigator' }));
  }

  /** 监听 */

  //蓝牙状态改变
  handleUpdateState=(args)=>{
    BluetoothManager.bluetoothState = args.state;
    if(args.state == 'on' && !this.didScan){  //蓝牙打开时自动搜索
      // 临时参数，防止多次调起
      this.didScan = true;
      this.scan();
    }
  }

   //扫描结束监听
   handleStopScan=()=>{
    console.log('BleManagerStopScan:','Scanning is stopped');
    this.setState({scaning:false});
    Portal.remove(this.state.loadingKey);
    this.setState({ loadingKey: '' })
  }

   //搜索到一个新设备监听
   handleDiscoverPeripheral = async (data) => {
    // console.log('BleManagerDiscoverPeripheral:', data);
    // 过滤掉不可连接的设备（如果需要显示就需要标识出来）
    if (!data.advertising.isConnectable) {
      return
    }
    const uuid = await Storage.getItem('connect-uuid');
    if (uuid === data.id) {
      console.log('历史连接记录:', uuid);
      this.connectBefore(data);
      return
    }
    console.log('新设备', data);
    console.log('本地存储数据', uuid);
    let id;  //蓝牙连接id
    let macAddress;  //蓝牙Mac地址
    if(Platform.OS == 'android'){
        macAddress = data.id;
        id = macAddress;
    }else{
        //ios连接时不需要用到Mac地址，但跨平台识别同一设备时需要Mac地址
        //如果广播携带有Mac地址，ios可通过广播0x18获取蓝牙Mac地址，
        macAddress = BluetoothManager.getMacAddressFromIOS(data);
        id = data.id;
    }
    this.deviceMap.set(data.id,data);  //使用Map类型保存搜索到的蓝牙设备，确保列表不显示重复的设备
    this.setState({data:[...this.deviceMap.values()]});
  }

  //蓝牙设备已连接
  handleConnectPeripheral=(args)=>{
    console.log('BleManagerConnectPeripheral:', args);
    // Storage.saveItem('connect-uuid', args.peripheral);
    Toast.info('连接成功', 2);
  }

  //蓝牙设备已断开连接
  handleDisconnectPeripheral=(args)=>{
    console.log('BleManagerDisconnectPeripheral:', args);
    let newData = [...this.deviceMap.values()]
    BluetoothManager.initUUID();  //断开连接后清空UUID
    this.setState({
        data:newData,
        isConnected:false,
        writeData:'',
        readData:'',
        receiveData:'',
        text:'',
    });
  }

  handleUpdateValue=(data)=>{
    //ios接收到的是小写的16进制，android接收的是大写的16进制，统一转化为大写16进制
    let value = data.value.toUpperCase();
    this.bluetoothReceiveData.push(value);
    console.log('BluetoothUpdateValue', value);
    this.setState({receiveData:this.bluetoothReceiveData.join('')})
  }

  /** actions */

  // 连接上次蓝牙设备
  connectBefore(item) {
    if(this.state.scaning){
      BluetoothManager.stopScan();
      this.setState({scaning:false});
    }
    BluetoothManager.connect(item.id)
      .then(peripheralInfo=>{
        this.switchToDetail(item.id);
      })
      .catch(err=>{
        this.scan();
        Toast.info('连接失败', 3);
      })
  }

  // 连接蓝牙
  connect(item){
    //当前蓝牙正在连接时不能打开另一个连接进程
    if(BluetoothManager.isConnecting){
      Toast.info('当前蓝牙正在连接', 3);
      return;
    }
    if(this.state.scaning){  //当前正在扫描中，连接时关闭扫描
      BluetoothManager.stopScan();
      this.setState({scaning:false});
    }
    let newData = [...this.deviceMap.values()]
    newData[item.index].isConnecting = true;
    this.setState({data:newData});

    BluetoothManager.connect(item.item.id)
      .then(peripheralInfo=>{
        let newData = [...this.state.data];
        newData[item.index].isConnecting = false;
        //连接成功，列表只显示已连接的设备
        // this.setState({
        //   data:[item.item],
        //   isConnected:true
        // });

        this.switchToDetail(item.item.id);
      })
      .catch(err=>{
        let newData = [...this.state.data];
        newData[item.index].isConnecting = false;
        this.setState({data:newData});
        Toast.info('连接失败', 3);
      })
  }

  // 断开连接
  disconnect(){
    this.setState({
      data:[...this.deviceMap.values()],
      isConnected:false
    });
    BluetoothManager.disconnect();
  }

  // 扫描设备
  scan(){
    const loadKey = Toast.loading('搜索蓝牙中...', 0);
    this.disconnect();
    if(this.state.scaning){  //当前正在扫描中
      BluetoothManager.stopScan();
      this.setState({scaning:false});
    }
    if(BluetoothManager.bluetoothState == 'on'){
      BluetoothManager.scan()
        .then(()=>{
          this.setState({
            scaning:true,
            loadingKey: loadKey
          });
        }).catch(err=>{
          Portal.remove(loadKey);
          Toast.info('搜索失败', 3);
        })
    }else{
      Portal.remove(loadKey);
      BluetoothManager.checkState();
      if(Platform.OS == 'ios'){
        Toast.info('请开启手机蓝牙', 3);
      }else{
        console.log('andorid')
        Alert.alert('提示','请开启手机蓝牙',[
          {
            text:'取消',
            onPress:()=>{ }
          },
          {
            text:'打开',
            onPress:()=>{ BluetoothManager.enableBluetooth() }
          }
        ]);
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          renderItem={this.renderItem}
          keyExtractor={item=>item.id}
          data={this.state.data}
          extraData={[this.state.isConnected,this.state.text,this.state.receiveData,this.state.readData,this.state.writeData,this.state.isMonitoring,this.state.scaning]}
        />
      </View>
    )
  }

  renderItem=(item)=>{
    let data = item.item;
    return(
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={this.state.isConnected?true:false}
        onPress={()=>{this.connect(item)}}
        style={styles.item}>

        <View style={{flexDirection:'row',}}>
            <Text style={{color:'black'}}>{data.name?data.name:''}</Text>
            <Text style={{marginLeft:50,color:"red"}}>{data.isConnecting?'连接中...':''}</Text>
        </View>
        <Text>{data.id}</Text>

      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white'
  },
  item:{
    flexDirection:'column',
    borderColor:'rgb(235,235,235)',
    borderStyle:'solid',
    borderBottomWidth:StyleSheet.hairlineWidth,
    paddingLeft:10,
    paddingVertical:8,
  },
})
