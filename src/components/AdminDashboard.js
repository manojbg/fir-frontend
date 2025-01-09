// Updated AdminDashboard.js
import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import '../styles/AdminDashboard.css';
import logo from '../styles/assets/images/ksplogo1.jpg';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [newTask, setNewTask] = useState({ FirNumber: '', file: null, AssigneeUserId: '' });
  const [assignPopup, setAssignPopup] = useState({ visible: false, FirNumber: '', FirDate:'', AssigneeUserId: '' });
  const [createFormPopup, setCreateFormPopup] = useState({ visible: false, FirNumber: '', FileName: '' });
  const searchBox = React.createRef(null);
  const searchDate = React.createRef(null);
  const searchToggle = React.createRef(null);
  const firNumber = React.createRef(null);
  const firFile = React.createRef(null);
  const firDate = React.createRef(null);
  const firDatePopup = React.createRef(null);
  const navigate = useNavigate();
  const [modalShow, setModalShow] = useState(false);
  const [userClick, setUserClick] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchAssignees();
    //handleNotification(true);
    document.querySelector("#root").classList.add('admin-dashboard-root');
    //const intervalId = setInterval(handleNotification, 60000);

        // Cleanup by removing the class when the component unmounts
        return () => {
          document.querySelector("#root").classList.remove('admin-dashboard-root');
          //clearInterval(intervalId);
        };
  }, [currentPage]);

  const fetchTasks = async () => {
      try {
        const response = await apiService.getAllTasks(currentPage - 1, pageSize);
        setTasks(response.content);
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

  const handleSearchByIdTask = async () => {
    const input = searchBox.current;
    const firNumber = input.value;
    try{
     const response = await apiService.searchByIdTask(firNumber);
     setTasks(response.content);
    }
    catch (error) {
     console.error('Error fetching tasks:', error);
     setTasks([]);
    }
  };

  const handleSearchByDateTask = async () => {
    const input = searchDate.current;
    const date = input.value;

    try{
      const response = await apiService.getAllTasksByDate(date, currentPage - 1, pageSize);
      setTasks(response.content);
    }
    catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const handleSearchByAssignedOrUnAssignedTask = async () => {
    const input = searchToggle.current;
    const assigned = input.checked;
    alert(assigned);
    try{
      const response =await apiService.getAllTasksByAssignedOrUnAssigned(assigned,currentPage - 1, pageSize);
      setTasks(response.content);
    }catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
     }
  };

  const handleCreateTask = async () => {
    const firNumberInput = firNumber.current.value;
    const firDateInput = firDate.current.value;
    const firFileInput = firFile.current.value;

    if(firNumberInput == '' || firDateInput == '' || firFileInput == '')
    {
      alert("Mandatory Fields Are Not Populated");
    }
    else{
      try {
        const fileReader = new FileReader();
        fileReader.onload = async () => {
          const base64File = fileReader.result.split(',')[1];
          const taskData = {
            FirNumber: newTask.FirNumber,
            FileName: newTask.file.name,
            AttachmentFileBytes: base64File,
            AssigneeUserId: newTask.AssigneeUserId,
            FirDate : firDateInput
          };
          await apiService.createTask(taskData);
          alert('FIR created successfully');
          setNewTask({ FirNumber: '', file: null, AssigneeUserId: '' });
          setCurrentPage(1); // Reset to first page to see the new task
          handleReset();
          fetchTasks();
        };
        fileReader.readAsDataURL(newTask.file);
      } catch (error) {
        alert('Error creating FIR. Please try again.');
      }
    }
  };

  const handleReset = async () => {
    firNumber.current.value = '';
    firDate.current.value = '';
    firFile.current.value = '';
  }

  const handleSaveAssignee = async () => {
    const firDateInput = firDatePopup.current.value;
    try {
      const payload = {
        AssigneeUserId: assignPopup.AssigneeUserId,
        FirNumber: assignPopup.FirNumber,
        AttachmentFileBytes: '',
        CreatedDateTime: '',
        FileName: '',
        FirDate: firDateInput
      };

      await apiService.assignTask(payload);
      alert('Assignee updated successfully');
      setAssignPopup({ visible: false, FirNumber: '', FirDate: '', AssigneeUserId: '' });
      fetchTasks();
    } catch (error) {
      alert('Error assigning FIR. Please try again.');
    }
  };

  const handleCreateForm = async () => {
  //updated method as required
    try {
      const payload = {
        FileName: createFormPopup.FileName,
        FirNumber: createFormPopup.FirNumber,
        FileContent: ''
      };

      await apiService.createTaskItemData(payload);
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

  const handleAssignPopup = (FirNumber, FirDate, AssigneeUserId) => {
    setAssignPopup({ visible: true, FirNumber: FirNumber, FirDate: FirDate, AssigneeUserId: AssigneeUserId });
  };

  const handleFormCreationPopup = (FirNumber, FileName) => {
    setCreateFormPopup({ visible: true, FirNumber: FirNumber, FileName : FileName });
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div bsClass='AdminDashboard' >
        <header className="dashboard-header">
            <div><img className="navbar-brand" src={logo}></img></div>
            <div>
            <h1 className="navbar-brand-text"><u>Crime Report Tracking System</u></h1>
            <p><strong>Karnataka State</strong></p></div>
            <div>
            <button className="logout-button" onClick={() => handleLogout()}></button>
            </div>
        </header>
        <div className="admin-dashboard">
            <div className="create-section">
                <div className="create-header">Upload FIR</div>
                <table class="create-table"><tbody><tr><td >
                    <label className="required-field">FIR Number </label>&nbsp;&nbsp;
                    <input ref={firNumber}
                            type="text"
                            value={newTask.FirNumber}
                            onChange={(e) => setNewTask({ ...newTask, FirNumber: e.target.value })}
                    /></td><td>
                    <label>Assignee &nbsp;&nbsp;&nbsp;&nbsp; </label>&nbsp;&nbsp;
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
                </td></tr><tr><td>
                <label className="required-field">File Upload </label>&nbsp;&nbsp;&nbsp;
                 <input ref={firFile} className="fileInput" type="file" accept="application/pdf" onChange={handleFileUpload} />
                <p>(pdf only: 10MB)</p>
                </td><td>
                    <label className="required-field">FIR Date &nbsp;&nbsp;&nbsp; </label>&nbsp;&nbsp;
                    <input ref={firDate} type = "date"></input>
                </td></tr></tbody></table>
                <div className="popup-buttons create-buttons">
                    <button onClick={handleCreateTask}>Submit</button>
                    <button onClick={() => handleReset()}>Reset</button>
                </div>
            </div>

            <div className="search-section">
                <table className="search-table"><thead><tr><td>
                    <label>Enter FIR Number : </label><input ref={searchBox} type = "text" name="firNumber"></input><button className="search-buttons" onClick={() => handleSearchByIdTask()}></button>
                </td><td>
                    <label>Enter Date : </label><input ref={searchDate} type = "date"></input><button className="search-buttons" onClick={() => handleSearchByDateTask()}></button>
                </td><td>
                    <label>Un-Assigned &nbsp;&nbsp;</label><label class="switch"><input id="toggle-switch" ref={searchToggle} type="checkbox"></input><span class="slider round"></span></label><label>&nbsp;&nbsp;Assigned</label><button className="search-buttons" onClick={() => handleSearchByAssignedOrUnAssignedTask()}></button>
                </td></tr></thead></table>
            </div>
        </div>
        <div className="list-section">
            <h2 className="section-title">LIST OF FIRs</h2>

            <div className="task-list">
                <div className="task-header">
                    <table><thead><tr><td>FIR</td>
                    <td>ASSIGNEE</td>
                    <td>FIR DATE</td>
                    <td>ACTIONS</td></tr></thead></table></div>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <details key={task.FirNumber} className="task-item">
              <summary className="task-summary">
                <div className="task-row">
                <table><tbody><tr>
                  <td><strong>No:</strong> {task.FirDTO.FirNumber}</td>
                  <td><strong></strong> {task.FirDTO.AssigneeUserId || 'Unassigned'}</td>
                  <td><strong></strong> {task.FirDTO.FirDate}</td>
                  <td>
                    <button className="action-buttons-mainlist assign-button" onClick={() => handleAssignPopup(task.FirDTO.FirNumber, task.FirDTO.FirDate, task.FirDTO.AssigneeUserId || '')}></button>
                    <button className="action-buttons-mainlist view-button" onClick={() => handleViewDocument(task.documentUrl)}></button>
                    <button className="action-buttons-mainlist delete-button" onClick={() => handleDeleteTask(task.FirDTO.FirNumber)}></button>
                  </td>
                  </tr></tbody></table>
                </div>
              </summary>
              <div className="task-details">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                    </tr>
                  </thead>
                  <tbody>{task.FirSupportingDocumentList && task.FirSupportingDocumentList.length > 0 ? (
  task.FirSupportingDocumentList.map((document, index) => (
    <tr key={index}>
      <td>{(document.FileName && document.FileName.substring(0, document.FileName.lastIndexOf('.'))) || 'Unnamed Document'}</td>
      <td className="task-table-column">
        <button
          className="action-buttons-sublist view-button"
          onClick={() => handleViewDocument(document.documentUrl)}
        ></button>
        <button
          className="action-buttons-sublist delete-button"
          onClick={() => handleDeleteTask(task.FirDTO.FirNumber, document.FileName)}
        ></button>
      </td>
    </tr>
  ))
) : (
  <p>No Document</p>
)}
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
      {assignPopup.visible && (
        <div className="popup">
          <div className="popup-content">
            <h2 className="popup-header"><u>Assign Assignee</u></h2><br/>
            <label><b>FIR Number : </b>{assignPopup.FirNumber}</label><br/><br/>
            <label><b>FIR Date : </b>{assignPopup.FirDate}</label><br/>
            <label><b>Change FIR Date To : </b>&nbsp;</label>
                                <input ref={firDatePopup} id="assigneeDate" type = "date"></input><br/><br/>
            <div>
            <label><b>Assignee : </b></label>
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
            </div><br/>
            <div className="popup-buttons">
              <button onClick={handleSaveAssignee}>Save</button>
              <button onClick={() => setAssignPopup({ visible: false, FirNumber: '', FirDate:'', AssigneeUserId: '' })}>Cancel</button>
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