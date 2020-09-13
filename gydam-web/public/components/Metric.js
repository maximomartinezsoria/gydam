import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { formatTime, constructDataObject, serverUrl } from '../helpers'

export const Metric = ({ uuid, type, socket }) => {
  const [data, setData] = useState()
  const [connected, setConnected] = useState(false)

  const fetchMetric = async () => {
    const metricResponse = await fetch(`${serverUrl}/metrics/${uuid}/${type}`)
    const metric = await metricResponse.json()

    if (!Array.isArray(metric)) return

    const { labels, chartData } = metric.reduce((acc, m) => {
      return { labels: [...acc.labels, formatTime(m.createdAt)], chartData: [...acc.chartData, m.value] }
    }, { labels: [], chartData: [] })

    setData(constructDataObject(labels.reverse(), type, chartData.reverse()))
  }

  const startRealtime = () => {
    socket.on('agent/message', payload => {
      if (payload.agent.uuid === uuid) {
        setConnected(true)
        const metric = payload.metrics.find(m => m.type === type)

        const labels = [...data.labels, formatTime(metric.createdAt)]
        const chartData = [...data.datasets[0].data, metric.value]

        setData(constructDataObject(labels, type, chartData))
      }
    })
  }

  useEffect(() => {
    fetchMetric()
    startRealtime()
  }, [data])

  if (!data) return <>Loading...</>

  return <div>
    <h2>Metric</h2>
    <button onClick={() => setCounter(counter + 1)}>++++</button>
    <Line data={data} />
  </div>
}
