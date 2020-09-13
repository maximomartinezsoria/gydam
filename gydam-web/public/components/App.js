import React from 'react'
import { Metric } from './Metric'
import io from 'socket.io-client'
import { serverUrl } from '../helpers'

const socket = io(serverUrl)

export const App = () => {
  return <>
    <Metric uuid="54c5bae9-6e72-4493-8d80-f2c1422f0561" type="callbackMetric" socket={socket} />
  </>
}
