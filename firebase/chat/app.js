/***************************************************
 * Please note that I’m sharing the credential here.
 * Feel free to use it while you’re learning.
 * After that, use your own credential.
 * Doing so, others can have the same advantage and
 * learn as quick as you learned too.
 * Thanks in advance!!!
***************************************************/

const FIREBASE_PROPERTY = 'chat'

// Initialize Firebase
const config = {
  apiKey: "AIzaSyAp-CLeimcXe59hvyNqpL66R0TQUyyoNjo",
  authDomain: "talk2016-9079a.firebaseapp.com",
  databaseURL: "https://talk2016-9079a.firebaseio.com",
  storageBucket: "talk2016-9079a.appspot.com",
}
const firebaseRef = firebase.initializeApp(config)
const database = firebase.database()

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
  const id = uuid()
  database.ref(`${FIREBASE_PROPERTY}/${id}`).set({
    dt: getDate(),
    name: getName(),
    color: getColor(),
    msg: getMsg()
  })

  $('#message').val('')
}

// clearChat()
$('#send-msg').click(sendMessage)

// fetch data
// https://www.firebase.com/docs/web/api/query/startat.html
// https://firebase.google.com/docs/database/web/retrieve-data
database
.ref(FIREBASE_PROPERTY)
.orderByChild('dt')
.startAt(moment().subtract(10, 'minutes').toDate().getTime())
.on('child_added', (snapshot) => {
  const value = snapshot.val()
  if (value) {
    appendMessage(value)
  }
})

// database
// .ref(FIREBASE_PROPERTY)
// .on('child_removed', (snapshot) => {
//   const value = snapshot.val()
//   if (value) {
//     debugger
//   }
// })
// database.ref(FIREBASE_PROPERTY).on('value', (snapshot) => {
//   const value = snapshot.val()
//   if (value) {
//     const list = Object.keys(value).map((key) => value[key])
//     list.forEach((data) => {
//       appendMessage(data)
//     })
//   }
// })

const cleanUpMessages = () => {
  database.ref(FIREBASE_PROPERTY).remove()
}
$('#dangerBtn').click(cleanUpMessages)
