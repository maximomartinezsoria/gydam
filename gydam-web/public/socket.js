const io = require('socket.io-client')
const socket = io()

socket.on('agent/message', function (payload) {
  console.log('agent/message', payload)
})

socket.on('agent/connected', function (payload) {
  console.log('agent/connected', payload)
})

socket.on('agent/disconnected', function (payload) {
  console.log('agent/disconnected', payload)
})
