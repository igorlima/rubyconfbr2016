/***************************************************
 * Please note that I’m sharing the credential here.
 * Feel free to use it while you’re learning.
 * After that, use your own credential.
 * Doing so, others can have the same advantage and
 * learn as quick as you learned too.
 * Thanks in advance!!!
***************************************************/

const FIREBASE_PROPERTY = 'monthly_cost'

// Initialize Firebase
const config = {
  apiKey: "AIzaSyAp-CLeimcXe59hvyNqpL66R0TQUyyoNjo",
  authDomain: "talk2016-9079a.firebaseapp.com",
  databaseURL: "https://talk2016-9079a.firebaseio.com",
  storageBucket: "talk2016-9079a.appspot.com",
}
const firebaseRef = firebase.initializeApp(config)
const database = firebase.database()

// http://www.highcharts.com/demo/combo-dual-axes
// http://api.highcharts.com/highcharts#series
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
$('#container').highcharts({
  chart: {
    zoomType: 'xy'
  },
  title: {
    text: 'Despesa mensal'
  },
  subtitle: {
    text: 'em reais (R$)'
  },
  xAxis: {
    categories: months
  },
  yAxis: [{
    title: {
      text: 'Despesa - R$'
    }
  }, {
    title: {
      text: 'Despesa - R$'
    },
    visible: false
  }],
  credits: {
    enabled: false
  },
  exporting: {
    enabled: false
  },
  plotOptions: {
    line: {
      animation: true,
      allowPointSelect: false,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        formatter: function() {
          console.log(this.point)
          return this.point.y;
        }
      }
    }
  },
  tooltip: {
    enabled: false
  },
  series: [{
    name: 'Distância',
    type: 'column',
    data: [],
    showInLegend: false
  }, {
    name: 'Distância',
    type: 'line',
    data: [],
    showInLegend: false
  }]
})

const setData = (data) => {
  const chart = $('#container').highcharts()
  chart.series.forEach((_series) => {
    _series.update({data: data})
  })
}

const extractData = (data) => {
  return months.map((month) => data[month])
}

// fetch the report data we alreaday have saved
database.ref(FIREBASE_PROPERTY).on('value', (snapshot) => {
  const value = snapshot.val()
  if (value) {
    const data = extractData(value)
    setData(data)
  }
})

/**
database.ref(FIREBASE_PROPERTY).set({
  Jan: 7.0,
  Feb: 6.9,
  Mar: 9.5,
  Apr: 14.5,
  May: 18.2,
  Jun: 21.5,
  Jul: 25.2,
  Aug: 26.5,
  Sep: 23.3,
  Oct: 18.3,
  Nov: 13.9,
  Dec: 9.7
})

database.ref(FIREBASE_PROPERTY).update({Jan: 11})

setData([7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 8.7])
*/
