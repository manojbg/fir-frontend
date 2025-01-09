// Updated UserDashboard.js
import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import '../styles/UserDashboard.css';
import logo from '../styles/assets/images/ksplogo1.jpg';
import { useNavigate } from 'react-router-dom';
import NotificationModal from '../components/Notifications';
import { Button, Modal } from "react-bootstrap"; 
import "react-resizable/css/styles.css"; // Include the required CSS

const UserDashboard = () => {
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
  const [showModal, setShowModal] = useState(false);
  //const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const [iframeSrc, setIframeSrc] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchAssignees();
    //handleNotification(true);
    document.querySelector("#root").classList.add('user-dashboard-root');
    //const intervalId = setInterval(handleNotification, 60000);

        // Cleanup by removing the class when the component unmounts
        return () => {
          document.querySelector("#root").classList.remove('user-dashboard-root');
          //clearInterval(intervalId);
        };
  }, [currentPage]);

  const handleShow = (firNumber, fileName, type) => {
    const encodedFIR = encodeURIComponent(firNumber); // Encode to safely pass in URL
    const encodedForm = encodeURIComponent("Form1test.html");
    let form = "";
    if(type == "edit"){
      form = fileName;
    }else{
      form = document.querySelector('.form-select').value;
    }   

    const iframeSrc = `/Forms/`+form+`?firNumber=${encodedFIR}&formName=${encodedForm}&type=`+type;
    setIframeSrc(iframeSrc);// Update the iframe source dynamically
    setShowModal(true); // Show the modal
};

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

  const handleNotification = (triggerSourceIsUser) => {
    setUserClick(triggerSourceIsUser);
    setModalShow(true);
  };

  const handleNotificationHide = () => {
    setUserClick(false);
    setModalShow(false);
  };

  return (
    <div bsClassName='UserDashboard' >
        <header className="user-dashboard-header">
            <div><img className="navbar-brand" src={logo}></img></div>
            <div>
            <h1 className="navbar-brand-text"><u>Crime Report Tracking System</u></h1>
            <p><strong>Karnataka State</strong></p></div>
            <div>
            <button className="notification-button" onClick={() => handleNotification(true)}></button>
            <button className="logout-button" onClick={() => handleLogout()}></button>
            </div>
        </header>
         {modalShow && (
                <NotificationModal handleNotification={handleNotification} show={modalShow} onHide={handleNotificationHide} userClick={userClick} />
              )}
        <div className="user-dashboard">
            <div className="user-search-section">
                <table className="search-table"><thead><tr><td>
                    <label>Enter FIR Number : </label><input ref={searchBox} type = "text" name="firNumber"></input><button className="search-buttons" onClick={() => handleSearchByIdTask()}></button>
                </td><td>
                    <label>Enter Date : </label><input ref={searchDate} type = "date"></input><button className="search-buttons" onClick={() => handleSearchByDateTask()}></button>
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
                    <button className="action-buttons-mainlist add-button" onClick={() => handleFormCreationPopup(task.FirDTO.FirNumber, '')}></button>
                    <button className="action-buttons-mainlist view-button" onClick={() => handleViewDocument(task.documentUrl)}></button>
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
                  <tbody>
                  {task.FirSupportingDocumentList && task.FirSupportingDocumentList.length > 0 ? (
  task.FirSupportingDocumentList.map((document, index) => (
    <tr key={index}>
      <td>{document.FileName || 'Unnamed Document'}</td>
      <td className="task-table-column">
        <button
          className="action-buttons-sublist edit-button"
          onClick={() => handleShow(task.FirDTO.FirNumber, document.FileName ,"edit")}
        ></button>
        <button
          className="action-buttons-sublist view-button"
          onClick={() => handleViewDocument(document.documentUrl)}
        ></button>
        <button
          className="action-buttons-sublist delete-button"
          onClick={() => handleDeleteTask(task.FirDTO.FirNumber)}
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
              <option value="Form1test.html">Form1</option>
              <option value="35 (3) Notice.html">35 (3) Notice</option>
              <option value="41(A) Notice.html">41(A) Notice</option>
              <option value="94 & 179 NOTICE ENGLISH.html">94 & 179 NOTICE ENGLISH</option>
              <option value="FB LETTER.html">FB LETTER</option>
              <option value="FREEZE INTIMATION TO COURT.html">FREEZE INTIMATION TO COURT</option>
            </select>
            </div>
            <div className="popup-buttons">
              <button onClick={() => {
                        handleShow(createFormPopup.FirNumber,"create");
                    }}>Create</button>
              <button onClick={() => setCreateFormPopup({ visible: false, FirNumber: '', FileName: '' })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

<Modal
  show={showModal}
  onHide={handleClose}
  size="lg"
  backdrop="static"
  keyboard={false}
  dialogClassName="custom-modal"
  style={{content : {
    width : "100%",
    float : "center",
  }}}
  aria-labelledby="example-custom-modal-styling-title"
  centered
>
  <Modal.Header closeButton>
    <Modal.Title id="example-custom-modal-styling-title">Responsive Form</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <iframe
      src={iframeSrc}
      title="Form1test"
      style={{
        width: "100%",
        height: "80vh",
        border: "none",
      }}
    />
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleClose}>
      Close
    </Button>
  </Modal.Footer>
</Modal>
      </div>
    </div>
  );
};

export default UserDashboard;
