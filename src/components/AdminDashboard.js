// Updated AdminDashboard.js
import React, { useEffect, useState, useRef } from 'react';
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
  const [createFormPopup, setCreateFormPopup] = useState({ visible: false, FirNumber: '', FileName: '' });
const searchBox = React.createRef(null);

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

  const HandleSearchByIdTask = () => {
    //alert(`function`)
  //const searchBox = useRef(null)
  const div = searchBox.current
  alert(`${div.value}`)
    //await apiService.searchByIdTask(firNumber);
   // fetchTasks(); // Refresh the task list
  };

  const handleSearchByDateTask = async (date) => {
    await apiService.getAllTasksByDate(date, currentPage - 1, pageSize);
    fetchTasks(); // Refresh the task list
  };

  const handleSearchByAssignedOrUnAssignedTask = async (assigned) => {
    await apiService.getAllTasksByAssignedOrUnAssigned(assigned,currentPage - 1, pageSize);
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

  const handleCreateForm = async () => {
    try {
      const payload = {
        FileName: createFormPopup.FileName,
        FirNumber: createFormPopup.FirNumber,
        FileContent: ''
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

  const handleFormCreationPopup = (FirNumber, FileName) => {
      setCreateFormPopup({ visible: true, FirNumber: FirNumber, FileName : FileName });
    };

  return (
    <div>
      <header className="dashboard-header">
      <img className="navbar-brand" src={logo}></img>
      				<a className="navbar-brand-text">KSP</a>
        <h1 className="page-title">Dashboard</h1>
        <button className="logout-button" onClick={() => setShowPopup(true)}>
        </button>
      </header>
      <div className="admin-dashboard">
      <div className="search-section">
      <h2 className="section-title">SEARCH</h2>
      <label>Enter FIR Number : </label><input ref={searchBox} type = "text" name="firNumber"></input><button className="search-buttons" onClick={() => HandleSearchByIdTask()}></button>
      <label>Enter Date : </label><input type = "date"></input><button className="search-buttons" onClick={() => handleSearchByDateTask}></button>

      </div>
      <button className="create-button pulse-button" onClick={() => setShowPopup(true)}>
      <img className = "create-button-image"></img><span className="create-button-span">Upload New FIR</span></button>

      <hr className="rounded"></hr>
      <h2 className="section-title">LIST OF FIRs</h2>

      <div className="task-list">
      <div className="task-header">
      <span>FIR</span>
      <span>ASSIGNEE</span>
      <span>ACTIONS</span></div>

        {tasks.length > 0 ? (
          tasks.map((task) => (
            <details key={task.FirNumber} className="task-item">
              <summary className="task-summary">
                <div className="task-row">
                  <div><img className="arrow"></img><span className="task-table-span"><strong>No:</strong> {task.FirNumber}</span></div>
                  <div><strong></strong> {task.AssigneeUserId || 'Unassigned'}</div>
                  <div className="actions-span">
                    <button className="action-buttons-mainlist assign-button" onClick={() => handleAssignPopup(task.FirNumber, task.AssigneeUserId || '')}></button>
                    <button className="action-buttons-mainlist add-button" onClick={() => handleFormCreationPopup(task.FirNumber, '')}></button>
                    <button className="action-buttons-mainlist view-button" onClick={() => handleViewDocument(task.documentUrl)}></button>
                    <button className="action-buttons-mainlist delete-button" onClick={() => handleDeleteTask(task.FirNumber)}></button>
                  </div>
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
            <h2 className="popup-header"><u>Create FIR</u></h2>
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
            <h2 className="popup-header"><u>Assign Assignee</u></h2>
            <p>FIR Number : {assignPopup.FirNumber}</p>
            <div>
            <label>Assignee : </label>
            <select className="assignee-select"
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
            </div>
            <div className="popup-buttons">
              <button onClick={handleSaveAssignee}>Save</button>
              <button onClick={() => setAssignPopup({ visible: false, FirNumber: '', AssigneeUserId: '' })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {createFormPopup.visible && (
        <div className="popup">
          <div className="popup-content">
            <h2 className="popup-header"><u>Select Form</u></h2>
            <p>FIR Number : {createFormPopup.FirNumber}</p>
            <div>
            <label>Form : </label>
            <select className="form-select"
              value={createFormPopup.FileName}
              onChange={(e) => setCreateFormPopup({ ...createFormPopup, FileName: e.target.value })}
            >
              <option value="Form1">Form 1</option>
              <option value="Form2">Form 2</option>
              <option value="Form3">Form 3</option>
              <option value="Form4">Form 4</option>
              <option value="Form5">Form 5</option>
            </select>
            </div>
            <div className="popup-buttons">
              <button onClick={handleCreateForm}>Create</button>
              <button onClick={() => setCreateFormPopup({ visible: false, FirNumber: '', FileName: '' })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;
