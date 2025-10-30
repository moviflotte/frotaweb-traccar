const url = 'https://jimi-iothub-instruct-api.fleetmap.io/api/device/sendInstruct'

export const startStreaming = (imei) => sendCommand(imei, '37121', {
    dataType: 0,
    codeStreamType: 1,
    channel: 1,
    videoIP: 'jimi-iothub.fleetmap.io',
    videoTCPPort: '10002',
    videoUDPPort: 0
})

export const stopStreaming = (imei) => sendCommand(imei, '37122', {
    channel: 1,
    cmd: 0,
    dataType: 0,
    codeStreamType: 0
})

const sendCommand = (imei, proNo, cmdContent) => {
    const params = new URLSearchParams()
    params.append('deviceImei', imei)
    params.append('proNo', proNo)
    params.append('serverFlagId', '0')
    params.append('cmdType', 'normallns')
    params.append('requestId', '6')
    params.append('platform', 'web')
    params.append('token', 'a12341234123')
    params.append('cmdContent', JSON.stringify(cmdContent))
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    })
}
