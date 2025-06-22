function TodoItem({ todo }) {
    return (
        <li>
            <strong>{todo.text}</strong>
            <br />
            <small>
                Tanggal: {todo.date} | Jam: {todo.time}
            </small>
        </li>
    );
}

export default TodoItem;
