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
var appbaseRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  appname: 'talks_2016',
  username: 'aWSlJvIUk',
  password: '58e3edd6-8933-4f61-a648-231c0404d4d7'
});

const ES_TYPE = 'getting_started'
const ID_TEST = 'id123'

// fetch data we alreaday have saved
appbaseRef.get({
  type: ES_TYPE,
  id: ID_TEST
}).on('data', function(response) {
  console.log(response);
}).on('error', function(error) {
  console.log(error);
});

// keep watching the id ID_TEST
appbaseRef.getStream({
  type: ES_TYPE,
  id: ID_TEST
}).on('data', function(response) {
  console.log(response);
}).on('error', function(error) {
  console.log("getStream() failed with: ", error);
});

// save any object under the id ID_TEST
appbaseRef.index({
  type: ES_TYPE,
  id: ID_TEST,
  body: {
    date: Date.now(),
    reason: 'tested'
  }
}).on('data', function(response) {
  console.log(response);
}).on('error', function(error) {
  console.log(error);
});

// fetch all data under the type ES_TYPE
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
  const list = hits.map(({_source = {}} = {}) => _source);
  console.log("searchStream(), new match: ", list);
}).on('error', (error) => {
  console.log("caught a searchStream() error: ", error);
});

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
  console.log("searchStream(), new match: ", stream);
}).on('error', (error) => {
  console.log("caught a searchStream() error: ", error);
});
