import { useState } from "react";
import TodoItem from "../components/TodoItem";

function TodoPage() {
    const [todos, setTodos] = useState([]);
    const [task, setTask] = useState("");
    const [time, setTime] = useState("");

    const addTodo = () => {
        if (!task.trim() || !time.trim()) return;
        const today = new Date().toLocaleString("id-ID", {
            dateStyle: "short",
        });
        // format tanggal otomatis (dd/mm/yyyy)

        const newTodo = {
            id: Date.now(),
            text: task,
            time: time,
            date: today, // ⬅️ tambahkan tanggal
        };
        setTodos([...todos, newTodo]);
        setTask("");
        setTime("");
    };

    return (
        <div>
            <h2>My Todos</h2>
            <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Enter task"
            />
            <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
            />
            <button onClick={addTodo}>Add</button>

            <ul>
                {todos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                ))}
            </ul>
        </div>
    );
}

export default TodoPage;
