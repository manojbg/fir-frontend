import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const userTasks = await apiService.getUserTasks();
      setTasks(userTasks);
    };
    fetchTasks();
  }, []);

  return (
    <div>
      <h1>User Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.name}</td>
              <td>
                <button onClick={() => apiService.viewTask(task.id)}>View</button>
                <button onClick={() => apiService.editTask(task.id)}>Edit</button>
                <button onClick={() => apiService.printTask(task.id)}>Print</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserDashboard;
