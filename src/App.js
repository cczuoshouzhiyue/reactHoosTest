import React, {lazy, Suspense, useState, useCallback, useRef, useEffect} from 'react';
import './App.css';
import {createSet, createAdd, createRemove, createToggle} from "./action";
import {MemoComponent} from './component/memo/index';

let idSep = Date.now();
const LS_KEY = '_LS_KEY';
const LazyComponent = lazy(() => import('./component/lazy/index.js'));

// function App() {
//
//   return (
//     <div className="App">
//       <Suspense fallback={<div>loading</div>}>
//         <LazyComponent/>
//       </Suspense>
//       <MemoComponent/>
//     </div>
//   );
// }
function bindActionCreators(actionCreatiors, dispatch) {
    const ret = {};
    for(let key in actionCreatiors) {
        ret[key] = function (...args) {
            const actionCreator = actionCreatiors[key];
            const action = actionCreator(...args);
            dispatch(action)
        }
    }
    return ret;
}


function Control(props) {
    const {addTodo} = props;
    const inputRef = useRef();
    const onSubmit = e => {
        e.preventDefault();
        console.log(inputRef.current.value);
        const newText = inputRef.current.value.trim();
        if (!newText) {
            return
        }
        addTodo({ id: idSep++,
            text: newText,
            complete: false});
        inputRef.current.value = ''
    };
    return <div className='control'>
        <h1>
            totdos
        </h1>
        <form onSubmit={onSubmit}>
            <input type="text" className='new-todo' ref ={inputRef} placeholder='请输入'/>
        </form>
    </div>
}

function TodoItem(props) {
    const {todo: {id, text,complete},removeTodo, toggleTodo}= props;
    const change = () => {
        toggleTodo(id);
    };
    const remove = () => {
        removeTodo(id);
    };
    return (<li className='todo-item'>
        <input type='checkbox' checked={complete} onChange={change}/>
        <label className={complete? 'complete': ''}>{text}</label>
        <button onClick={remove}>x</button>
    </li>)
}

function Todos(props) {
    const {todos,removeTodo, toggleTodo }= props;
    return <ul className='todos'>
            {todos.map(item=> <TodoItem
                key={item.id}
                todo={item}
                removeTodo = {removeTodo}
                toggleTodo = {toggleTodo}
                />
            )}
        </ul>

}

function App() {
    const [todos, setTodos] = useState([]);
    const dispatch = useCallback((action) => {
        const {type, payload} = action;
        switch (type) {
            case 'set':
                setTodos(payload);
                break;
            case 'add':
                setTodos(todos => [...todos, payload]);
                break;
            case 'remove' :
                setTodos(todos => todos.filter(item => item.id !== payload));
                break;
            case 'toggle':
                setTodos(todos => todos.map(todo=> {
                    return todo.id === payload ? {...todo, complete: !todo.complete}: todo
                }));
                break;
            default:
        }
    }, []);
    const { setTodo } =   bindActionCreators({setTodo: createSet}, dispatch);
    useEffect(() => {
        setTodo(JSON.parse(localStorage.getItem(LS_KEY) ) || []);
    }, []);
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(todos));
    }, [todos]);
    return <div className="todo-list">
        <Control {...bindActionCreators({
            addTodo: createAdd
        }, dispatch)}/>
        <Todos {...bindActionCreators({
            removeTodo: createRemove,
            toggleTodo: createToggle
        }, dispatch)} todos={todos}/>
    </div>
}

export default App;
