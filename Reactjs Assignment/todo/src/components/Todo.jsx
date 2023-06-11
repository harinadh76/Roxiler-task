import React from "react";
import { useEffect, useState } from "react";
import './Todo.css'

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [sortedTodos, setSortedTodos] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);


  const fetchTodos = async () => {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/todos");
      const data = await response.json();
      setTodos(data);
      setSortedTodos(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users/${userId}`
      );
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSort = (column) => {
    const sorted = [...sortedTodos].sort((a, b) => {
      if (column === "id") {
        return a.id - b.id;
      } else if (column === "title") {
        return a.title.localeCompare(b.title);
      } else if (column === "status") {
        return a.completed - b.completed;
      }
    });
    setSortedTodos(sorted);
  };


  const handleSearch = (event) => {
    const keyword = event.target.value.toLowerCase();
    setSearchKeyword(keyword);

    if (keyword === "") {
      setSortedTodos(todos);
    } else {
      const filtered = todos.filter(
        (todo) =>
          todo.id.toString().includes(keyword) ||
          todo.title.toLowerCase().includes(keyword) ||
          todo.completed.toString().includes(keyword)
      );
      setSortedTodos(filtered);
    }
  };

  const handleViewUser = async (Id) => {
    //setSelectedTodo(Id);
    fetchUserDetails(Id);


     setSelectedTodo(null); 


    // const response = await fetch(
    //   `https://jsonplaceholder.typicode.com/users/${userId}`
    // );
    // const userDetails = await response.json();
    
    // setSelectedTodo({
    //   id: userId,
    //   userDetails: userDetails,
    // });

    const filtered = todos.filter((todo) => todo.userId === Id);
    setSelectedTodo(filtered[0]);

  
  };

 return(
    <div>
         <div className="container">
      <div className="left-side">
        <input
          type="text"
          placeholder="Search..."
          value={searchKeyword}
          onChange={handleSearch}
        />
        <table class="table table-striped">
          <thead>
            <tr>
              <th onClick={() => handleSort("id")}>ID</th>
              <th onClick={() => handleSort("title")}>Title</th>
              <th onClick={() => handleSort("status")}>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedTodos.map((todo) => (
              <tr key={todo.id}>
                <td>{todo.id}</td>
                <td>{todo.title}</td>
                <td>{todo.completed ? "Completed" : "InComplete"}</td>
                <td>
                  <button onClick={() => handleViewUser(todo.id)}>
                    View User
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="userSide">
        {selectedTodo && (
          <table>
            <thead>
              <tr>
                <th>Todo ID</th>
                <th>Todo Title</th>
                <th>User ID</th>
                <th>User Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* <td>{selectedTodo.id}</td>
                <td>{selectedTodo.title}</td>
                <td>{selectedTodo.userId}</td>
                <td>{userDetails?.name}</td>
                <td>{userDetails?.email}</td> */}
                 <td>{userDetails?.id}</td>
                <td>{selectedTodo?.title}</td>
                <td>{selectedTodo?.userId}</td>
                <td>{userDetails?.name}</td>
                <td>{userDetails?.email}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
    </div>
 )
};

export default Todo;
