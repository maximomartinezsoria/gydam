export const formatTime = (time) => {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }).format(new Date(time))
}

export const constructDataObject = (labels = [], label = '', data = []) => {
  console.log(labels, data)
  return {
    labels,
    datasets: [
      {
        label,
        tension: 0,
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        easing: 'linear',
        data
      }
    ]
  }
}

export const serverUrl = 'http://localhost:3001'
