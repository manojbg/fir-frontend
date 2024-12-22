// Updated AdminDashboard.js
import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import '../styles/AdminDashboard.css';
import logo from '../styles/assets/images/ksplogo1.jpg';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [newTask, setNewTask] = useState({ FirNumber: '', file: null, AssigneeUserId: '' });
  const [assignPopup, setAssignPopup] = useState({ visible: false, FirNumber: '', AssigneeUserId: '' });

  useEffect(() => {
    fetchTasks();
    fetchAssignees();
    document.querySelector("#root").classList.add('admin-dashboard-root');

        // Cleanup by removing the class when the component unmounts
        return () => {
          document.querySelector("#root").classList.remove('admin-dashboard-root');
        };
  }, [currentPage]);

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

  const handleViewDocument = (documentUrl) => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    } else {
      alert('No document available to view.');
    }
  };

  const handleDeleteTask = async (firNumber) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete FIR Number: ${firNumber}?`);
    if (!confirmDelete) return;

    await apiService.deleteTask(firNumber);
    fetchTasks(); // Refresh the task list
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
        fetchTasks();
      };
      fileReader.readAsDataURL(newTask.file);
    } catch (error) {
      alert('Error creating FIR. Please try again.');
    }
  };

  const handleSaveAssignee = async () => {
    try {
      const payload = {
        AssigneeUserId: assignPopup.AssigneeUserId,
        FirNumber: assignPopup.FirNumber,
        AttachmentFileBytes: '',
        CreatedDateTime: '',
        FileName: '',
      };

      await apiService.assignTask(payload);
      alert('Assignee updated successfully');
      setAssignPopup({ visible: false, FirNumber: '', AssigneeUserId: '' });
      fetchTasks();
    } catch (error) {
      alert('Error assigning FIR. Please try again.');
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

  const handleAssignPopup = (FirNumber, AssigneeUserId) => {
    setAssignPopup({ visible: true, FirNumber: FirNumber, AssigneeUserId: AssigneeUserId });
  };

  return (
    <div>
      <header className="dashboard-header">
      <img className="navbar-brand" src={logo}></img>
      				<a class="navbar-brand-text">KSP</a>
        <h1 className="page-title">Dashboard</h1>
        <button className="logout-button" onClick={() => setShowPopup(true)}>
        </button>
      </header>
      <button className="create-button" onClick={() => setShowPopup(true)}>
      <i className = "create-button-image"></i>Create New FIR</button>
      <hr className="rounded"></hr>
      <h2 className="section-title">List of FIRs</h2>
      <div className="admin-dashboard">
      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <details key={task.FirNumber} className="task-item">
              <summary className="task-summary">
                <div className="task-row">
                  <span><strong>No:</strong> {task.FirNumber}</span>
                  <span><strong></strong> {task.AssigneeUserId || 'Unassigned'}</span>
                  <span className="actions-span">
                    <button className="action-buttons-mainlist assign-button" onClick={() => handleAssignPopup(task.FirNumber, task.AssigneeUserId || '')}></button>
                    <button className="action-buttons-mainlist view-button" onClick={() => handleViewDocument(task.documentUrl)}></button>
                    <button className="action-buttons-mainlist delete-button" onClick={() => handleDeleteTask(task.FirNumber)}></button>
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
                      <td className="task-table-column">
                        <button className="action-buttons-sublist view-button" onClick={() => handleViewDocument(task.documentUrl)}></button>
                        <button className="action-buttons-sublist edit-button" onClick={() => apiService.editTask(task.FirNumber)}></button>
                        <button className="action-buttons-sublist delete-button" onClick={() => handleDeleteTask(task.FirNumber)}></button>
                        <button className="action-buttons-sublist print-button" onClick={() => apiService.printTask(task.FirNumber)}></button>
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
      {assignPopup.visible && (
        <div className="popup">
          <div className="popup-content">
            <h2>Assign Assignee</h2>
            <p>FIR Number: {assignPopup.FirNumber}</p>
            <label>Assignee:</label>
            <select
              value={assignPopup.AssigneeUserId}
              onChange={(e) => setAssignPopup({ ...assignPopup, AssigneeUserId: e.target.value })}
            >
              <option value="">Select Assignee</option>
              {assignees.map((assignee) => (
                <option key={assignee.UserId} value={assignee.UserId}>
                  {assignee.UserName}
                </option>
              ))}
            </select>
            <div className="popup-buttons">
              <button onClick={handleSaveAssignee}>Save</button>
              <button onClick={() => setAssignPopup({ visible: false, FirNumber: '', AssigneeUserId: '' })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;
