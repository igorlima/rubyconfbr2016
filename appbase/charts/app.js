/***************************************************
 * Please note that I’m sharing the credential here.
 * Feel free to use it while you’re learning.
 * After that, use your own credential.
 * Doing so, others can have the same advantage and
 * learn as quick as you learned too.
 * Thanks in advance!!!
***************************************************/

const ES_TYPE = 'reports'
const ES_ID = 'monthly_cost'
var appbaseRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  appname: 'talks_2016',
  username: 'aWSlJvIUk',
  password: '58e3edd6-8933-4f61-a648-231c0404d4d7'
})

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

const extractData = ({_source = {}} = {}) => {
  return months.map((month) => _source[month])
}

// fetch the report data we alreaday have saved
appbaseRef.get({
  type: ES_TYPE,
  id: ES_ID
}).on('data', function(response) {
  const data = extractData(response)
  setData(data)
  console.log(response)
}).on('error', function(error) {
  console.log(error)
})

// keep watching what's going on
appbaseRef.getStream({
  type: ES_TYPE,
  id: ES_ID
}).on('data', function(response) {
  const data = extractData(response)
  setData(data)
}).on('error', function(error) {
  console.log("getStream() failed with: ", error)
})

/**
appbaseRef.index({
  type: ES_TYPE,
  id: ES_ID,
  body: {
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
  }
}).on('data', function(response) {
  console.log(response)
}).on('error', function(error) {
  console.log(error)
})

appbaseRef.update({
  type: ES_TYPE,
  id: ES_ID,
  body: {doc: {Jan: 11}}
}).on('data', function(response) {
  console.log(response)
}).on('error', function(error) {
  console.log(error)
})
setData([7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 8.7])
*/
