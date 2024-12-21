import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newTask, setNewTask] = useState({
    firNumber: '',
    file: null,
    assigneeUserId: '',
  });
  const [assignees, setAssignees] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiService.getAllTasks();
        setTasks(response.content || []); // Ensure we only set the "content" array
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      }
    };

    const fetchAssignees = async () => {
      try {
        const assigneeList = await apiService.getAssignees();
        setAssignees(assigneeList);
      } catch (error) {
        console.error('Error fetching assignees:', error);
      }
    };

    fetchTasks();
    fetchAssignees();
  }, []);

  const handleFileUpload = (e) => {
    setNewTask({ ...newTask, file: e.target.files[0] });
  };

  const handleCreateTask = async () => {
    try {
      await apiService.createTask(newTask);
      alert('Task created successfully');
      setShowPopup(false);
      setNewTask({ firNumber: '', file: null, assigneeUserId: '' });
    } catch (error) {
      alert('Error creating task. Please try again.');
    }
  };

  const handleViewDocument = (documentUrl) => {
    window.open(documentUrl, '_blank'); // Open the document in a new tab
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <button className="create-button" onClick={() => setShowPopup(true)}>
        Create New Task
      </button>
      <div className="task-list">
  {tasks.length > 0 ? (
    tasks.map((task) => (
      <details key={task.firNumber || task.id} className="task-item">
        <summary className="task-summary">
          FIR Number: {task.FirNumber || 'Unknown'}
        </summary>
        <div className="task-details">
          <table className="task-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Assignee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                <tr>
                  <td>{task.FileName || 'Unnamed Document'}</td>
                  <td>{task.AssigneeUserId || 'Unassigned'}</td>
                  <td>
                    {task.documentUrl ? (
                      <button onClick={() => handleViewDocument(task.documentUrl)}>View</button>
                    ) : (
                      <p>No document available</p>
                    )}
                    <button onClick={() => apiService.editTask(task.id)}>Edit</button>
                    <button onClick={() => apiService.deleteTask(task.id)}>Delete</button>
                    <button onClick={() => apiService.printTask(task.id)}>Print</button>
                  </td>
                </tr>
            </tbody>
          </table>
        </div>
      </details>
    ))
  ) : (
    <p>No FIRs available</p>
  )}
</div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Create Task</h2>
            <label>FIR Number:</label>
            <input
              type="text"
              value={newTask.firNumber}
              onChange={(e) => setNewTask({ ...newTask, firNumber: e.target.value })}
            />
            <label>File Upload:</label>
            <input type="file" onChange={handleFileUpload} />
            <label>Assignee:</label>
            <select
              value={newTask.assigneeUserId}
              onChange={(e) => setNewTask({ ...newTask, assigneeUserId: e.target.value })}
            >
              <option value="">Select Assignee</option>
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </option>
              ))}
            </select>
            <div className="popup-buttons">
              <button onClick={handleCreateTask}>Create</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
