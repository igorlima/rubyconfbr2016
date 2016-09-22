/***************************************************
 * Please note that I’m sharing the credential here.
 * Feel free to use it while you’re learning.
 * After that, use your own credential.
 * Doing so, others can have the same advantage and
 * learn as quick as you learned too.
 * Thanks in advance!!!
***************************************************/

const ES_TYPE = 'reports'
const ES_ID = 'dashboard'
var appbaseRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  appname: 'talks_2016',
  username: 'aWSlJvIUk',
  password: '58e3edd6-8933-4f61-a648-231c0404d4d7'
})

// http://www.highcharts.com/demo/combo
// http://api.highcharts.com/highcharts#series
$('#container').highcharts({
  title: {
    text: 'Combination chart'
  },
  xAxis: {
    categories: ['Apples', 'Oranges', 'Pears', 'Bananas', 'Plums']
  },
  labels: {
    items: [{
      html: 'Total fruit consumption',
      style: {
        left: '50px',
        top: '18px',
        color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
      }
    }]
  },
  series: [{
    type: 'column',
    name: 'Jane',
    data: []
  }, {
    type: 'column',
    name: 'John',
    data: []
  }, {
    type: 'column',
    name: 'Joe',
    data: []
  }, {
    type: 'spline',
    name: 'Average',
    data: [],
    marker: {
      lineWidth: 2,
      lineColor: Highcharts.getOptions().colors[3],
      fillColor: 'white'
    }
  }, {
    type: 'pie',
    name: 'Total consumption',
    data: [{
      name: 'Jane',
      y: 0,
      color: Highcharts.getOptions().colors[0] // Jane's color
    }, {
      name: 'John',
      y: 0,
      color: Highcharts.getOptions().colors[1] // John's color
    }, {
      name: 'Joe',
      y: 0,
      color: Highcharts.getOptions().colors[2] // Joe's color
    }],
    center: [100, 80],
    size: 100,
    showInLegend: false,
    dataLabels: {
      enabled: false
    }
  }]
})

// e.g. average(...[2, 3, 4, 5])
const sum = (...values) => {
  return values.reduce(
    (prev, current) => (prev + current), 0
  )
}

// e.g. average(...[2, 3, 4, 5])
const average = (...values) => {
  return sum(...values) / values.length
}

// e.g. _average([3, 2, 1, 3, 4], [2, 3, 5, 7, 6], [4, 3, 3, 9, 0])
const _sum = (...arrays) => {
  return arrays.reduce((prev, curr) => {
    return curr.map((val, i) => +val + (+prev[i] || 0))
  }, [])
}

// e.g. _average([3, 2, 1, 3, 4], [2, 3, 5, 7, 6], [4, 3, 3, 9, 0])
const _average = (...arrays) => {
  return _sum(...arrays).map((val) => val / arrays.length)
}

const setData = ({John, Jane, Joe} = {}) => {
  const chart = $('#container').highcharts()
  const {series} = chart
  const john = series.find((data) => (
    data.type == 'column' &&
    data.name == 'John'
  ))
  const jane = series.find((data) => (
    data.type == 'column' &&
    data.name == 'Jane'
  ))
  const joe = series.find((data) => (
    data.type == 'column' &&
    data.name == 'Joe'
  ))
  const average = series.find((data) => (
    data.type == 'spline' &&
    data.name == 'Average'
  ))
  const pie = series.find((data) => (
    data.type == 'pie' &&
    data.name == 'Total consumption'
  ))

  john.update({data: John})
  jane.update({data: Jane})
  joe.update({data: Joe})
  average.update({data: _average(John, Jane, Joe)})
  pie.update({data: [{
    name: 'Jane',
    y: sum(...Jane),
    color: Highcharts.getOptions().colors[0]
  }, {
    name: 'John',
    y: sum(...John),
    color: Highcharts.getOptions().colors[1]
  }, {
    name: 'Joe',
    y: sum(...Joe),
    color: Highcharts.getOptions().colors[2]
  }]})
}

const extractData = ({_source = {}} = {}) => {
  const {
    Jane = [],
    John = [],
    Joe = []
  } = _source
  return {Jane, John, Joe}
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
    Jane: [3, 2, 1, 3, 4],
    John: [2, 3, 5, 7, 6],
    Joe: [4, 3, 3, 9, 0]
  }
}).on('data', function(response) {
  console.log(response)
}).on('error', function(error) {
  console.log(error)
})

appbaseRef.update({
  type: ES_TYPE,
  id: ES_ID,
  body: {doc: {Jane: [3, 2, 0, 3, 4]}}
}).on('data', function(response) {
  console.log(response)
}).on('error', function(error) {
  console.log(error)
})
*/
