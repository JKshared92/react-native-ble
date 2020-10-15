// 返回数据类型
export const CONNECT_TYPE = {
  CONNECT: '01',            // 已连接蓝牙
  START: '02',              // 开启
  CLOSE: '03',              // 关闭
  STOP: '04',               // 停止
  BATTERY_VOLTAGE: '05',    // 电瓶电压
  MOTOR_WORK_CURRENT: '06', // 电机工作电流
  STALL_CURRENT: '07',      // 堵转电流
  POMP_STATE: '08',         // 篷布状态
  FAULT_STATE: '09',        // 故障状态
  RUN_TIME: '0A',           // 运行时间
  PROTECT: '0B',            // 欠压保护
  DISCONNECT: '99',         // 断开蓝牙
}

// 篷布状态
export const POMP_STATE = {
  CLOSE: '0',
  OPEN: '1'
}

// 故障类型
export const FAULT_TYPE = {
  FAULT: '1',
  NORMAL: '2',
  UNDER: '3'
}

// 数据类型（读取/写入）
export const DATA_TYPE = {
  READ: '03',
  WRITE: '06'
}

// 尾部标示
const TAIL_MARK = 'FCFD'
// 读取数据头部标示
const READ_HEAD_MARK = '0103'
// 写入数据头部标示
const WRITE_HEAD_MARK = '010600'

// 接收到蓝牙信息处理
export function ParsingMessage(message) {
  if (message.length !== 16) {
    return { status: '400', message: '数据类型出错' }
  }
  const head = message.substr(0, 4)
  const tail = message.substr(12, 4)
  const address = message.substr(6, 2)
  const dataStr = message.substr(8, 4)
  if (head !== READ_HEAD_MARK || tail !== TAIL_MARK) {
    return { status: '400', message: '数据类型出错' }
  }
  const value = getValue(dataStr)
  return { status: '200', data: { address, value } }
}

// 16进制转成10进制
function getValue(hexData) {
  if (hexData.length !== 4) {
    return hexData
  }
  const posNum = hexData.substr(0, 3)
  const negNum = hexData.substr(3, 1)

  const posResult = parseInt(posNum, 16)
  const negResult = parseInt(negNum, 16)

  if (negResult > 0) {
    return posResult + '.' + negNum
  }

  return posResult
}

// 发送信息给蓝牙
export function sendMessageToBluetooth(sendValue) {
  // const inputValue = parseFloat(sendValue)
  // if (inputValue < 0) {
  //   return { status: '400', message: '数据格式有误' }
  // }
  // let centerTarget = ''
  // if (inputValue === 0) {
  //   centerTarget = '0000'
  // } else {
  //   const arr = inputValue.toString().split('.')
  //   const integral = Math.trunc(inputValue)
  //   let decimal = 0
  //   if (arr.length === 2) {
  //     decimal = parseInt(arr[1])
  //   }
  //   let top = integral.toString(16)
  //   let low = decimal.toString(16)
  //   if (top.length > 3) {
  //     return { status: '400', message: '数据超出最大范围' }
  //   }
  //   if (top.length === 1) {
  //     top = '00' + top
  //   }
  //   if (top.length === 2) {
  //     top = '0' + top
  //   }
  //   if (low.length > 1) {
  //     return { status: '400', message: '只能设置一位小数' }
  //   }
  //   centerTarget = top + low
  // }
  const returnValue = WRITE_HEAD_MARK + sendValue + TAIL_MARK
  return { status: '200', value: returnValue }
}
