// Updated AdminDashboard.js
import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [newTask, setNewTask] = useState({ FirNumber: '', file: null, AssigneeUserId: '' });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiService.getAllTasks(currentPage - 1, pageSize);
        const processedTasks = (response.content || []).map((task) => {
          const documentUrl = task.AttachmentFileBytes
            ? (() => {
                const byteArray = Uint8Array.from(atob(task.AttachmentFileBytes), (c) => c.charCodeAt(0));
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                return URL.createObjectURL(blob);
              })()
            : null;

          return { ...task, documentUrl };
        });

        setTasks(processedTasks);
        setTotalPages(response.totalPages || 1);
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
  }, [currentPage]);

  const handleViewDocument = (documentUrl) => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    } else {
      alert('No document available to view.');
    }
  };

  const handleDeleteTask = async (firNumber) => {
    try {
      await apiService.deleteTask(firNumber);
      alert('FIR deleted successfully');
      setTasks(tasks.filter((task) => task.FirNumber !== firNumber));
    } catch (error) {
      alert('Error deleting FIR. Please try again.');
    }
  };

  const handleCreateTask = async () => {
    try {
      const fileReader = new FileReader();
      fileReader.onload = async () => {
        const base64File = fileReader.result.split(',')[1];
        const taskData = {
          FirNumber: newTask.FirNumber,
          FileName: newTask.file.name,
          AttachmentFileBytes: base64File,
          AssigneeUserId: newTask.AssigneeUserId,
        };
        await apiService.createTask(taskData);
        alert('FIR created successfully');
        setShowPopup(false);
        setNewTask({ FirNumber: '', file: null, AssigneeUserId: '' });
        setCurrentPage(1); // Reset to first page to see the new task
      };
      fileReader.readAsDataURL(newTask.file);
    } catch (error) {
      alert('Error creating FIR. Please try again.');
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleFileUpload = (e) => {
    setNewTask({ ...newTask, file: e.target.files[0] });
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="create-button" onClick={() => setShowPopup(true)}>
          Create New FIR
        </button>
      </header>
      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <details key={task.FirNumber} className="task-item">
              <summary className="task-summary">
                <div className="task-row">
                  <span><strong>No:</strong> {task.FirNumber}</span>
                  <span><strong></strong> {task.AssigneeUserId || 'Unassigned'}</span>
                  <span>
                    <button onClick={() => handleViewDocument(task.documentUrl)}>View</button>
                    <button onClick={() => handleDeleteTask(task.FirNumber)}>Delete</button>
                  </span>
                </div>
              </summary>
              <div className="task-details">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{task.FileName || 'Unnamed Document'}</td>
                      <td>
                        <button onClick={() => handleViewDocument(task.documentUrl)}>View</button>
                        <button onClick={() => apiService.editTask(task.FirNumber)}>Edit</button>
                        <button onClick={() => handleDeleteTask(task.FirNumber)}>Delete</button>
                        <button onClick={() => apiService.printTask(task.FirNumber)}>Print</button>
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
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          className="pagination-button"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Create FIR</h2>
            <label>FIR Number:</label>
            <input
              type="text"
              value={newTask.FirNumber}
              onChange={(e) => setNewTask({ ...newTask, FirNumber: e.target.value })}
            />
            <label>File Upload:</label>
            <input type="file" onChange={handleFileUpload} />
            <label>Assignee:</label>
            <select
              value={newTask.AssigneeUserId}
              onChange={(e) => setNewTask({ ...newTask, AssigneeUserId: e.target.value })}
            >
              <option value="">Select Assignee</option>
              {assignees.map((assignee) => (
                <option key={assignee.UserId} value={assignee.UserId}>
                  {assignee.UserName}
                </option>
              ))}
            </select>
            <div className="popup-buttons">
              <button onClick={handleCreateTask}>Save</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
