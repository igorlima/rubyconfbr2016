/***************************************************
 * Please note that I’m sharing the credential here.
 * Feel free to use it while you’re learning.
 * After that, use your own credential.
 * Doing so, others can have the same advantage and
 * learn as quick as you learned too.
 * Thanks in advance!!!
***************************************************/

// Based on: http://todomvc.com/examples/react/#/
const {
  Component
} = React
let app = app || {}

// Based on https://github.com/tastejs/todomvc/blob/gh-pages/examples/react/js/utils.js
class Utils {
  static uuid () {
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

  static pluralize (count, word) {
    return count === 1 ? word : word + 's'
  }
  
  static store (namespace, data) {
    if (data) {
      return localStorage.setItem(namespace, JSON.stringify(data))
    }

    let datastored = localStorage.getItem(namespace)
    return (datastored && JSON.parse(datastored)) || []
  }
}

// Based on: https://github.com/tastejs/todomvc/blob/gh-pages/examples/react/js/todoModel.js

const FIREBASE_PROPERTY = 'todo_reactjs'
class TodoModel {
  constructor (key) {
    this.key = key
    this.todos = []
    this.onChanges = []
    // Initialize Firebase
    const config = {
      apiKey: "AIzaSyAp-CLeimcXe59hvyNqpL66R0TQUyyoNjo",
      authDomain: "talk2016-9079a.firebaseapp.com",
      databaseURL: "https://talk2016-9079a.firebaseio.com",
      storageBucket: "talk2016-9079a.appspot.com",
    }
    const firebaseRef = firebase.initializeApp(config)
    this.database = firebase.database()
    
    this.database.ref(FIREBASE_PROPERTY)
    .on('value', (snapshot) => {
      const value = snapshot.val();
      if (value) {
        this.todos = Object.keys(value).map((key) => value[key])
        this.inform()
      }
    })
  }

  subscribe (onChange) {
    this.onChanges.push(onChange)
  }

  inform () {
    // Utils.store(this.key, this.todos)
    // this.todos = [...this.todos]
    this.onChanges.forEach((cb) => { cb() })
  }

  addTodo (title) {
    const id = Utils.uuid()
    const jsonObject = {
      id,
      title,
      completed: false
    }
    
    // optimistc logic
    this.todos = [jsonObject].concat(this.todos)
    this.inform()

    this.database
      .ref(`${FIREBASE_PROPERTY}/${id}`)
      .set(jsonObject)
  }

  toggleAll (checked) {
    // Note: it's usually better to use immutable data structures since they're
    // easier to reason about and React works very well with them. That's why
    // we use map() and filter() everywhere instead of mutating the array or
    // todo items themselves.
    this.todos = this.todos.map((todo) => ({
      ...todo,
      completed: checked
    }))
    this.inform()

    // broadcast all changes
    this.todos.forEach((todo) => this.database
      .ref(`${FIREBASE_PROPERTY}/${todo.id}`)
      .set(todo)
    )
  }

  toggle (todoToToggle) {
    // optmistic logic
    this.todos = this.todos.map((todo) => {
      return todo !== todoToToggle ? todo : {
        ...todo,
        completed: !todo.completed
      }
    })
    this.inform()

    const id = todoToToggle.id
    this.database
      .ref(`${FIREBASE_PROPERTY}/${id}`)
      .set({
        ...todoToToggle,
        completed: !todoToToggle.completed
      })
  };

  destroy (todo) {
    // optimistci logic
    this.todos = this.todos.filter((candidate) => {
      return candidate !== todo
    })
    this.inform()

    // broadcast all changes
    const {id} = todo
    this.database
      .ref(`${FIREBASE_PROPERTY}/${id}`)
      .remove()
  }

  save (todoToSave, text) {
    // optimistic logic
    this.todos = this.todos.map((todo) => {
      return todo !== todoToSave ? todo : {
        ...todo,
        title: text
      }
    })
    this.inform()
    
    // broadcast all changes
    const {id} = todoToSave
    this.database
      .ref(`${FIREBASE_PROPERTY}/${id}`)
      .set({
        ...todoToSave,
        title: text
      })
  }

  clearCompleted () {
    let completed = this.todos.filter((todo) => todo.completed)

    // optimistic logic        
    this.todos = this.todos.filter((todo) => !todo.completed)
    this.inform()
    
    // broadcast all changes
    completed.forEach((todo) => {
      const {id} = todo
      this.database
        .ref(`${FIREBASE_PROPERTY}/${id}`)
        .remove()
    })
  }
}

// Based on: https://github.com/tastejs/todomvc/blob/gh-pages/examples/react/js/todoItem.jsx
const ESCAPE_KEY = 27
const ENTER_KEY = 13
class TodoItem extends Component {

  constructor (props) {
    super(props)
    this.state = {
      editText: ''
    }
  }

  handleSubmit (event) {
    var val = this.state.editText.trim()
    if (val) {
      this.props.onSave(val)
      this.setState({editText: val})
    } else {
      this.props.onDestroy()
    }
  }

  handleEdit () {
    this.props.onEdit()
    this.setState({editText: this.props.todo.title})
  }

  handleKeyDown (event) {
    if (event.which === ESCAPE_KEY) {
      this.setState({editText: this.props.todo.title})
      this.props.onCancel(event)
    } else if (event.which === ENTER_KEY) {
      this.handleSubmit(event)
    }
  }

  handleChange (event) {
    if (this.props.editing) {
      this.setState({editText: event.target.value})
    }
  }

  getInitialState () {
    return {editText: this.props.todo.title}
  }

  /**
   * This is a completely optional performance enhancement that you can
   * implement on any React component. If you were to delete this method
   * the app would still work correctly (and still be very performant!), we
   * just use it as an example of how little code it takes to get an order
   * of magnitude performance improvement.
   */
  shouldComponentUpdate (nextProps, nextState) {
    return (
      nextProps.todo !== this.props.todo ||
      nextProps.editing !== this.props.editing ||
      nextState.editText !== this.state.editText
    )
  }

  /**
   * Safely manipulate the DOM after updating the state when invoking
   * `this.props.onEdit()` in the `handleEdit` method above.
   * For more info refer to notes at https://facebook.github.io/react/docs/component-api.html#setstate
   * and https://facebook.github.io/react/docs/component-specs.html#updating-componentdidupdate
   */
  componentDidUpdate (prevProps) {
    if (!prevProps.editing && this.props.editing) {
      var node = ReactDOM.findDOMNode(this.refs.editField)
      node.focus()
      node.setSelectionRange(node.value.length, node.value.length)
    }
  }

  render () {
    return (
      <li className={classNames({
        completed: this.props.todo.completed,
        editing: this.props.editing
      })}>
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={this.props.todo.completed}
            onChange={this.props.onToggle}
          />
          <label onDoubleClick={this.handleEdit.bind(this)}>
            {this.props.todo.title}
          </label>
          <button className="destroy" onClick={this.props.onDestroy} />
        </div>
        <input
          ref="editField"
          className="edit"
          value={this.state.editText}
          onBlur={this.handleSubmit.bind(this)}
          onChange={this.handleChange.bind(this)}
          onKeyDown={this.handleKeyDown.bind(this)}
        />
      </li>
    )
  }
}

// Based on: https://github.com/tastejs/todomvc/blob/gh-pages/examples/react/js/footer.jsx
class TodoFooter extends Component {
  render () {
    let activeTodoWord = Utils.pluralize(this.props.count, 'item')
    let clearButton = null

    if (this.props.completedCount > 0) {
      clearButton = (
        <button
          className="clear-completed"
          onClick={this.props.onClearCompleted}>
          Clear completed
        </button>
      )
    }

    let nowShowing = this.props.nowShowing
    return (
      <footer className="footer">
        <span className="todo-count">
          <strong>{this.props.count}</strong> {activeTodoWord} left
        </span>
        <ul className="filters">
          <li>
            <a
              href="#/"
              className={classNames({selected: nowShowing === ALL_TODOS})}>
                All
            </a>
          </li>
          {' '}
          <li>
            <a
              href="#/active"
              className={classNames({selected: nowShowing === ACTIVE_TODOS})}>
                Active
            </a>
          </li>
          {' '}
          <li>
            <a
              href="#/completed"
              className={classNames({selected: nowShowing === COMPLETED_TODOS})}>
                Completed
            </a>
          </li>
        </ul>
        {clearButton}
      </footer>
    )
  }
}

// Based on: https://github.com/tastejs/todomvc/blob/gh-pages/examples/react/js/app.jsx
const ALL_TODOS = 'all'
const ACTIVE_TODOS = 'active'
const COMPLETED_TODOS = 'completed'
class TodoApp extends Component {
  constructor (props) {
    super(props)
    this.state = {
      nowShowing: ALL_TODOS,
      editing: null,
      newTodo: ''
    }
  }

  componentDidMount () {
    let setState = this.setState;
    // let router = Router({
    //   '/': () => {debugger},
    //   '/active': () => {debugger},
    //   '/completed': () => {debugger}
    // })
    let router = Router({
      '/': setState.bind(this, {nowShowing: ALL_TODOS}),
      '/active': setState.bind(this, {nowShowing: ACTIVE_TODOS}),
      '/completed': setState.bind(this, {nowShowing: COMPLETED_TODOS})
    })
    router.init('/')
  }

  handleChange (event) {
    this.setState({newTodo: event.target.value})
  }

  handleNewTodoKeyDown (event) {
    if (event.keyCode !== ENTER_KEY) {
      return
    }
    event.preventDefault()
    const val = this.state.newTodo.trim()
    if (val) {
      this.props.model.addTodo(val)
      this.setState({newTodo: ''})
    }
  }

  toggleAll (event) {
    var checked = event.target.checked
    this.props.model.toggleAll(checked)
  }

  toggle (todoToToggle) {
    this.props.model.toggle(todoToToggle)
  }

  destroy (todo) {
    this.props.model.destroy(todo)
  }

  edit (todo) {
    this.setState({editing: todo.id})
  }

  save (todoToSave, text) {
    this.props.model.save(todoToSave, text)
    this.setState({editing: null})
  }

  cancel () {
    this.setState({editing: null})
  }

  clearCompleted () {
    this.props.model.clearCompleted()
  }

  render () {
    let footer,
        main,
        todos = this.props.model.todos
    let shownTodos = todos.filter((todo) => {
      switch (this.state.nowShowing) {
      case ACTIVE_TODOS:
        return !todo.completed
      case COMPLETED_TODOS:
        return todo.completed
      default:
        return true
      }
    }, this)

    let todoItems = shownTodos.map((todo) => {
      return (
        <TodoItem
          key={todo.id}
          todo={{...todo}}
          onToggle={this.toggle.bind(this, todo)}
          onDestroy={this.destroy.bind(this, todo)}
          onEdit={this.edit.bind(this, todo)}
          editing={this.state.editing === todo.id}
          onSave={this.save.bind(this, todo)}
          onCancel={this.cancel.bind(this)}
        />
      )
    }, this)

    let activeTodoCount = todos.reduce((accum, todo) => {
      return todo.completed ? accum : accum + 1
    }, 0)

    let completedCount = todos.length - activeTodoCount

    if (activeTodoCount || completedCount) {
      footer =
        <TodoFooter
          count={activeTodoCount}
          completedCount={completedCount}
          nowShowing={this.state.nowShowing}
          onClearCompleted={this.clearCompleted.bind(this)}
        />
    }

    if (todos.length) {
      main = (
        <section className="main">
          <input
            className="toggle-all"
            type="checkbox"
            onChange={this.toggleAll.bind(this)}
            checked={activeTodoCount === 0}
          />
          <ul className="todo-list">
            {todoItems}
          </ul>
        </section>
      )
    }

    return (
      <div>
        <header className="header">
          <h1>todos</h1>
          <input
            className="new-todo"
            placeholder="What needs to be done?"
            value={this.state.newTodo}
            onKeyDown={this.handleNewTodoKeyDown.bind(this)}
            onChange={this.handleChange.bind(this)}
            autoFocus={true}
          />
        </header>
        {main}
        {footer}
      </div>
    )
  }
}

let model = new TodoModel('react-todos')
let render = () => {
  ReactDOM.render(
    <TodoApp model={model}/>,
    document.getElementsByClassName('todoapp')[0]
  )
}

model.subscribe(render)
render()
