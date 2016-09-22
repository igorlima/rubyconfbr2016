/***************************************************
 * Please note that I’m sharing the credential here.
 * Feel free to use it while you’re learning.
 * After that, use your own credential.
 * Doing so, others can have the same advantage and
 * learn as quick as you learned too.
 * Thanks in advance!!!
***************************************************/

/*
  http://docs.appbase.io/scalr/javascript/javascript-intro.html
  To write data or stream updates from appbase.io,
  we need to first create a reference object.
  We do this by passing the API URL, appname, and a username:password combination into the Appbase constructor:
*/
const ES_TYPE = 'chat'
var appbaseRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  appname: 'talks_2016',
  username: 'aWSlJvIUk',
  password: '58e3edd6-8933-4f61-a648-231c0404d4d7'
});

// Set Brazil locale
moment.locale('pt-br')

// Init color picker
$(function() {
  $('#color').colorpicker()
})

const createLeftMessage = ({color, name, dt, msg}) => {
  return $(`
    <li class="left clearfix">
      <span class="chat-img pull-left">
        <span class="glyphicon glyphicon-user" aria-hidden="true" style="font-size: 55px; color: ${color};"></span>
      </span>
      <div class="chat-body clearfix">
        <div class="header">
          <strong class="primary-font">${name}</strong>
          <small class="pull-right text-muted">
            <span class="glyphicon glyphicon-time"></span>${dt}
          </small>
        </div>
        <p>${msg}</p>
      </div>
    </li>
  `)
}

const createRightMessage = ({color, name, dt, msg}) => {
  return $(`
    <li class="right clearfix">
      <span class="chat-img pull-right">
        <span class="glyphicon glyphicon-user" aria-hidden="true" style="font-size: 55px; color: ${color};"></span>
      </span>
      <div class="chat-body clearfix">
        <div class="header">
          <small class=" text-muted">
            <span class="glyphicon glyphicon-time"></span>${dt}
          </small>
          <strong class="pull-right primary-font">${name}</strong>
        </div>
        <p>${msg}</p>
      </div>
    </li>
  `)
}

const clearChat = () => $('ul.chat').empty()

const getName = () => $('#name').val() || 'Igor Lima'

const getColor = () => $('#color').val() || '#f01053'

const getMsg = () => $('#message').val()

const getDate = () => (new Date()).getTime()
// const getDate = () => (new Date()).toUTCString()
// const getDate = () => moment().toISOString()
// const getDate = () => moment().utc().format("YYYY-MM-DD HH:mm:ss")

const uuid = () => {
  var i, random
  var uuid = ''
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-'
    }
    uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
      .toString(16)
  }
  return uuid
}

const appendMessage = ({color, name, dt, msg}) => {
  const formatedDate = moment(dt).format('LLLL')
  const elemMsg = getName() == name ?
    createRightMessage({color, name, dt: formatedDate, msg}) :
    createLeftMessage({color, name, dt: formatedDate, msg})
  $('ul.chat').append(elemMsg)
}

const sendMessage = () => {
  appbaseRef.index({
    type: ES_TYPE,
    id: uuid(),
    body: {
      dt: getDate(),
      name: getName(),
      color: getColor(),
      msg: getMsg()
    }
  }).on('data', function(response) {
    console.log(response)
  }).on('error', function(error) {
    console.log(error)
  })

  $('#message').val('')
}

// clearChat()
$('#send-msg').click(sendMessage)

// fetch all data under the type ES_TYPE
appbaseRef.search({
  type: ES_TYPE,
  body: {
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html
    // query: {
    //   query_string: {
    //     fields: ["name"],
    //     query: "Igor Lima"
    //   }
    // }

    // http://news.appbase.io/meetupblast/
    // query: {
    //   filtered: {
    //     filter: {
    //       terms: { 
    //         group_city_simple: ["San Francisco", "Ahmedabad"]
    //       }
    //     }
    //   }
    // }

    // http://okfnlabs.org/blog/2013/07/01/elasticsearch-query-tutorial.html
    // http://logz.io/blog/elasticsearch-queries/
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html
    query: {
      filtered: {
        filter: {
          range: {
            dt: {
              gte: moment().subtract(10, 'minutes').toDate().getTime(),
              lte: moment().add(1, 'days').toDate().getTime()
            }
          }
        }
      }
    }
  }
}).on('data', (stream) => {
  const {
    hits: {
      hits = []
    } = {}
  } = stream || {};
  const list = hits.map(({_source = {}} = {}) => _source)
  list.forEach((data) => {
    appendMessage(data)
  })
  console.log("searchStream(), new match: ", list)
}).on('error', (error) => {
  console.log("caught a searchStream() error: ", error)
})

// keep watching the Elastic Search type ES_TYPE
appbaseRef.searchStream({
  type: ES_TYPE,
  body: {
    query: {
      match_all: {}
    }
  }
}).on('data', (stream) => {
  let {_deleted, _source} = stream
  if (!_deleted && _source) {
    appendMessage(_source)
  }
  console.log("searchStream(), new match: ", stream)
}).on('error', (error) => {
  console.log("caught a searchStream() error: ", error)
})

const cleanUpMessages = () => {
  appbaseRef.search({
    type: ES_TYPE,
    body: {
      query: {
        match_all: {}
      }
    }
  }).on('data', (stream) => {
    const {
      hits: {
        hits = []
      } = {}
    } = stream || {};
    const list = hits.map(({_id} = {}) => _id)
    list.forEach((id) => {
      appbaseRef.delete({type: ES_TYPE, id})
    })
    console.log("searchStream(), new match: ", stream)
  }).on('error', (error) => {
    console.log("caught a searchStream() error: ", error)
  })
}
$('#dangerBtn').click(cleanUpMessages)
