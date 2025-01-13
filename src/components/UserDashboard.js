// Updated UserDashboard.js
import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import logo from '../styles/assets/images/ksplogo1.jpg';
import { useNavigate } from 'react-router-dom';
import NotificationModal from '../components/Notifications';
import { Button, Modal } from "react-bootstrap";
import Alert from 'react-bootstrap/Alert';
import "react-resizable/css/styles.css"; // Include the required CSS
import '../styles/UserDashboard.css';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
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
  const [show, setShow] = useState(false);
  const [alertMessage, setAlertMessage] = useState();
  const [variant, setVariant] = useState();

  useEffect(() => {
    fetchTasks();
    handleNotification(false);
    document.querySelector("#root").classList.add('user-dashboard-root');
    const intervalId = setInterval(handleNotification, 60000);

        // Cleanup by removing the class when the component unmounts
    return () => {
      document.querySelector("#root").classList.remove('user-dashboard-root');
      clearInterval(intervalId);
    };
  }, [currentPage]);

  const handleShow = (firNumber, fileName, type) => {
    if(fileName == "select" || fileName == "")
    {
      handleAlertDisplay("Please select a valid form","danger");
      return;
    }
    const encodedFIR = encodeURIComponent(firNumber); // Encode to safely pass in URL
    const encodedForm = encodeURIComponent(fileName);
    let form = "";
    if(type == "edit"){
      form = fileName;
    }else{
      form = document.querySelector('.form-select').value;
    }   

    const iframeSrc = `/Forms/`+form+`?firNumber=${encodedFIR}&formName=${encodedForm}&type=`+type+`&closeModal=true`;
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
        handleAlertDisplay("No FIR/s found.","danger");
      }
  };

  const handleViewDocument = (documentUrl) => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    } else {
      alert('No document available to view.');
    }
  };

  const handleDeleteTask = async (firNumber, fileName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete FIR Number: ${firNumber}?`);
    if (!confirmDelete) return;

    await apiService.deleteTask(firNumber, fileName);
    fetchTasks(); // Refresh the task list
  };

  const handleDeleteDocument = async (firNumber, fileName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete Document: ${fileName} for FIR No: ${firNumber}?`);
    if (!confirmDelete) return;

    await apiService.deleteTaskDocument(firNumber, fileName);
    fetchTasks(); // Refresh the task list
  };

  const handleSearchByIdTask = async () => {
    const input = searchBox.current;
    const firNumber = input.value;
    try{
     const response = await apiService.searchByIdTask(firNumber);
     setTasks(response.content);
     if(response.content.length == 0)
     {
       handleAlertDisplay("No FIR/s found.","danger");
     }
    }
    catch (error) {
     console.error('Error fetching tasks:', error);
     setTasks([]);
     handleAlertDisplay("No FIR/s found.","danger");
    }
  };

  const handleSearchByDateTask = async () => {
    const input = searchDate.current;
    const date = input.value;

    try{
      const response = await apiService.getAllTasksByDate(date, currentPage - 1, pageSize);
      setTasks(response.content);
      if(response.content.length == 0)
      {
        handleAlertDisplay("No FIR/s found.","danger");
      }
    }
    catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      handleAlertDisplay("No FIR/s found.","danger");
    }
  };

  const handleReset = async () => {
    firNumber.current.value = '';
    firDate.current.value = '';
    firFile.current.value = '';
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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

  const handleAlertDisplay = (message,variant) => {
    setVariant(variant);
    setAlertMessage(message);
    setShow(true);
    setTimeout(() => {
      setShow(false)
    }, 5000);
  }

  const handleCloseWithAlert = () => {
    handleClose();
    handleAlertDisplay("Form saved successfully","success");
  }

  const handleErrorWithAlert = () => {
    handleAlertDisplay("Failed to fetch/save data. Please try again.","danger");
  }

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
        <Alert className="alert-box" show={show} key={variant} variant={variant} onClose={() => setShow(false)} dismissible>
                         <b>{alertMessage}</b></Alert>
         {modalShow && (
                <NotificationModal handleNotification={handleNotification} show={modalShow} onHide={handleNotificationHide} userClick={userClick} />
              )}
        <div className="user-dashboard">
            <div className="user-search-section">
                <table className="search-table"><thead><tr><td>
                    <label>Enter FIR Number &nbsp;&nbsp;</label><input ref={searchBox} type = "text" name="firNumber"></input><button className="search-buttons" onClick={() => handleSearchByIdTask()}></button>
                </td><td>
                    <label>Enter Date &nbsp;&nbsp;</label><input ref={searchDate} type = "date"></input><button className="search-buttons" onClick={() => handleSearchByDateTask()}></button>
                </td></tr></thead></table>
            </div>
        </div>
        <div className="list-section">
            <h2 className="section-title">LIST OF FIRs<button className="refresh-button" onClick={() => fetchTasks()}></button></h2>
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
      <td>{(document.FileName && document.FileName.substring(0, document.FileName.lastIndexOf('.'))) || 'Unnamed Document'}</td>
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
          onClick={() => handleDeleteDocument   (task.FirDTO.FirNumber, document.FileName)}
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
      {createFormPopup.visible && (
        <div className="popup">
          <div className="popup-content">
            <h2 className="popup-header"><u>Select Form</u></h2>
            <p><b>FIR Number : </b>{createFormPopup.FirNumber}</p>
            <div>
            <label><b>Form : </b></label>
            <select className="form-select"
              value={createFormPopup.FileName}
              onChange={(e) => setCreateFormPopup({ ...createFormPopup, FileName: e.target.value })}
            >
              <option value="select">Select Form</option>
              <option value="35 (3) Notice.html">35 (3) NOTICE</option>
              <option value="41(A) Notice.html">41(A) NOTICE</option>
              <option value="94 & 179 NOTICE ENGLISH.html">94 & 179 NOTICE ENGLISH</option>
              <option value="FB LETTER.html">FB LETTER</option>
              <option value="FREEZE INTIMATION TO COURT.html">FREEZE INTIMATION TO COURT</option>
              <option value="COURT ORDER.html">COURT ORDER</option>
              <option value="LIEN LETTER.html">LIEN LETTER</option>
              <option value="IPDR.html">IPDR</option>
              <option value="Beneficiary details request.html">BENEFICIARY DETAILS REQUEST</option>
              <option value="Gmail LETTER.html">GMAIL LETTER</option>
              <option value="WHATSAPP.html">WHATSAPP</option>
              <option value="INSTA LETTER.html">INSTA LETTER</option>
            </select>
            </div>
            <div className="popup-buttons">
              <button onClick={() => {
                        handleShow(createFormPopup.FirNumber,createFormPopup.FileName,"create");
                    }}>Create</button>
              <button onClick={() => setCreateFormPopup({ visible: false, FirNumber: '', FileName: '' })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

<Modal id="formModal"
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
  aria-labelledby="formModal"
  centered
>
  <Modal.Header closeButton>
    <Modal.Title id="form-modal-header">Response Form/Notice</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <iframe
      src={iframeSrc}
      title="Forms"
      style={{
        width: "100%",
        height: "80vh",
        border: "none",
      }}
    />
  </Modal.Body>
  <Modal.Footer>
  <Button className="hidden-close-button" onClick={handleErrorWithAlert} id="form-error"></Button>
   <Button className="hidden-close-button" onClick={handleCloseWithAlert} id="form-close"></Button>
    <Button variant="secondary" onClick={handleClose} id="iclose">
      Close
    </Button>
  </Modal.Footer>
</Modal>
      </div>
    </div>
  );
};

export default UserDashboard;