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
  const [uploadPopup, setUploadPopup] = useState({ visible: false, FirNumber: '', FileName:'', UnApprovedFirSupportingDocuments: '', file: null});
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

  const handleShow = (firNumber, fileName, type, pk) => {
    if(fileName === "select" || fileName === "")
    {
      handleAlertDisplay("Please select a valid form","danger");
      return;
    }
    const encodedFIR = encodeURIComponent(firNumber); // Encode to safely pass in URL
    const encodedForm = encodeURIComponent(fileName);
    let form = "";
    if(type === "edit"){
      form = fileName;
    }else{
      form = document.querySelector('.form-select').value;
    }   

    const iframeSrc = `/Forms/`+form+`?firNumber=${encodedFIR}&formName=${encodedForm}&type=`+type+`&pk=`+pk+`&closeModal=true`;
    setIframeSrc(iframeSrc);// Update the iframe source dynamically
    setShowModal(true); // Show the modal
};

  const fetchTasks = async () => {
      const firNumber = searchBox.current.value;
      const date = searchDate.current.value;
      if(firNumber !== "")
      {
        handleSearchByIdTask();
      }
      else if(date !== "")
      {
        handleSearchByDateTask();
      }
      else
      {
        try {
          const response = await apiService.getAllTasks(currentPage - 1, pageSize);
          setTasks(response.content);
          setTotalPages(response.totalPages || 1);
        } catch (error) {
          console.error('Error fetching tasks:', error);
          handleAlertDisplay("No FIRs found/assigned.","danger");
          setTasks([]);
        }
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

  const handleDeleteDocument = async (firNumber, fileName, pk) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete Document: ${fileName} for FIR No: ${firNumber}?`);
    if (!confirmDelete) return;

    await apiService.deleteTaskDocument(pk);
    fetchTasks(); // Refresh the task list
  };

  const handleSearchByIdTask = async () => {
    const firNumber = searchBox.current.value;
    if(firNumber !== "")
    {
      try{
       const response = await apiService.searchByIdTask(firNumber);
       setTasks(response.content);
       if(response.content.length == 0)
       {
         handleAlertDisplay("No FIR/s found.","danger");
       }
      }
      catch (error) {
       handleAlertDisplay("No FIR/s found.","danger");
       setTasks([]);
      }
    }
  };

  const handleSearchByDateTask = async () => {
    const date = searchDate.current.value;
    if(date !== "")
    {
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
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleApprovedFileUpload = (e) => {
    setUploadPopup({ ...uploadPopup, file: e.target.files[0] });
  };

  const handleFormCreationPopup = (FirNumber, FileName) => {
    setCreateFormPopup({ visible: true, FirNumber: FirNumber, FileName : FileName });
  };

  const handleApprovedDocumentsUploadPopup = (FirNumber, UnApprovedFirSupportingDocuments) => {
    setUploadPopup({ visible: true, FirNumber: FirNumber, FileName:'', UnApprovedFirSupportingDocuments: UnApprovedFirSupportingDocuments, file: null});
  };

  const handleApprovedDocumentsUpload = async () => {
    const firNumberInput = uploadPopup.FirNumber;
    const documentInput = uploadPopup.file;
    const fileName = uploadPopup.FileName;

    if(firNumberInput === '' || documentInput === null || fileName === '')
    {
       handleAlertDisplay("Mandatory Fields Are Not Populated","danger");
    }
    else{
      try {
        const fileReader = new FileReader();
        fileReader.onload = async () => {
          const base64File = fileReader.result.split(',')[1];
          const taskData = {
            FirNumber: firNumberInput,
            FileName: fileName,
            FileBytes: base64File,
            FileContent: '',
            Approved: true
          };

          await apiService.createTaskItemData(taskData);
          handleAlertDisplay("Document uploaded successfully","success");
          fetchTasks();
          handleUploadPopupClose();
        };
        fileReader.readAsDataURL(uploadPopup.file);
      } catch (error) {
         console.error('Error Uploading Document:', error);
         handleAlertDisplay("Error uploading Document FIR. Please try again.","danger");
      }
    }
  };

  const handleUploadPopupClose = () => {
    setUploadPopup({ visible: false, FirNumber: '', FileName:'', UnApprovedFirSupportingDocuments: '', file: null});
  }

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
    fetchTasks();
    handleAlertDisplay("Form saved successfully","success");
  }

  const handleErrorWithAlert = () => {
    handleAlertDisplay("Failed to fetch/save data. Please try again.","danger");
  }

  return (
    <div bsClassName='UserDashboard'>
        <header className="user-dashboard-header">
            <div><img className="navbar-brand" src={logo}></img></div>
            <div>
            <h1 className="navbar-brand-text"><u>Crime Report Tracking System</u></h1>
            <p><strong>Karnataka State</strong></p></div>
            <div>
            <button className="notification-button" title="Notifications" onClick={() => handleNotification(true)}></button>
            <button className="logout-button" title="Log Out" onClick={() => handleLogout()}></button>
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
                    <label>Enter FIR Number &nbsp;&nbsp;</label><input ref={searchBox} type = "text" name="firNumber"></input><button className="search-buttons" title="Search" onClick={() => handleSearchByIdTask()}></button>
                </td><td>
                    <label>Enter Date &nbsp;&nbsp;</label><input ref={searchDate} type = "date"></input><button className="search-buttons" title="Search" onClick={() => handleSearchByDateTask()}></button>
                </td></tr></thead></table>
            </div>
        </div>
        <div className="list-section">
            <h2 className="section-title">LIST OF FIRs<button className="refresh-button" title="Reload Table" onClick={() => fetchTasks()}></button></h2>
            <div className="task-list">
                <div className="task-header">
                    <table><thead><tr><td className="task-header-user-td1">FIR</td>
                    <td>MAJOR HEAD</td>
                    <td>COMPLAINANT</td>
                    <td>PSI</td>
                    <td>FIR DATE</td>
                    <td>STATUS</td>
                    <td>ACTIONS</td></tr></thead></table></div>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <details key={task.FirNumber} className="task-item">
              <summary className="task-summary">
                <div className="task-row">
                <table><tbody><tr>
                  <td><strong>No:</strong> {task.FirDTO.FirNumber}</td>
                  <td>{task.FirDTO.MajorHeader}</td>
                  <td>{task.FirDTO.ComplainantName}</td>
                  <td>{task.FirDTO.PsiName}</td>
                  <td>{task.FirDTO.FirDate}</td>
                  <td>{task.FirDTO.Status}</td>
                  <td>
                    <button className="action-buttons-mainlist-user add-button" title="Add Document" onClick={() => handleFormCreationPopup(task.FirDTO.FirNumber, '')}></button>
                    <button className="action-buttons-mainlist-user view-button" title="View FIR" onClick={() => handleViewDocument(task.documentUrl)}></button>
                  </td>
                  </tr></tbody></table>
                </div>
              </summary>
              <div className="documents-panel">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                     </tr>
                  </thead>
                  <tbody>{task.UnApprovedFirSupportingDocuments && task.UnApprovedFirSupportingDocuments.length > 0 ? (
  task.UnApprovedFirSupportingDocuments.map((document, index) => (
    <tr key={index}>
      <td>{(document.FileName && document.CreatedDateTime && document.FileName.substring(0, document.FileName.lastIndexOf('.'))+' '+(document.CreatedDateTime)) || 'Unnamed Document'}</td>
      <td>
        <button
          className="action-buttons-sublist edit-button" title="Edit Document"
          onClick={() => handleShow(task.FirDTO.FirNumber, document.FileName ,"edit", document.Pk)}
        ></button>
        <button
          className="action-buttons-sublist view-button" title="View Document"
          onClick={() => handleViewDocument(document.documentUrl)}
        ></button>
        <button
          className="action-buttons-sublist delete-button" title="Delete Document"
          onClick={() => handleDeleteDocument(task.FirDTO.FirNumber, document.FileName)}
        ></button>
      </td>
    </tr>
  ))
) : (
  <p>No Document</p>
)}
                  </tbody>
                </table>
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>Approved Document</th>
                      <th><button className="upload-button" title="Upload Document" onClick={() => handleApprovedDocumentsUploadPopup(task.FirDTO.FirNumber, task.UnApprovedFirSupportingDocuments)}></button></th>
                    </tr>
                  </thead>
                  <tbody>{task.ApprovedFirSupportingDocuments && task.ApprovedFirSupportingDocuments.length > 0 ? (
  task.ApprovedFirSupportingDocuments.map((document, index) => (
    <tr key={index}>
      <td>{(document.FileName && document.CreatedDateTime && document.FileName.substring(0, document.FileName.lastIndexOf('.'))+' '+(document.CreatedDateTime)) || 'Unnamed Document'}</td>
      <td>
        <button
          className="action-buttons-sublist view-button" title="View Document"
          onClick={() => handleViewDocument(document.documentUrl)}
        ></button>
        <button
          className="action-buttons-sublist delete-button" title="Delete Document"
          onClick={() => handleDeleteDocument(task.FirDTO.FirNumber, document.FileName, document.Pk)}
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
              <button title="Create Form" onClick={() => {
                        handleShow(createFormPopup.FirNumber,createFormPopup.FileName,"create", "");
                    }}>Create</button>
              <button title="Close" onClick={() => setCreateFormPopup({ visible: false, FirNumber: '', FileName: '' })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {uploadPopup.visible && (
        <div className="popup">
          <div className="popup-content">
            <h2 className="popup-header"><u>Upload Approved Document</u></h2><br/>
            <div>
            <label><b>FIR Number</b> <br/>{uploadPopup.FirNumber}</label><br/><br/>

            <label className="required-field"><b>Select Approved File : </b></label><br/>
            <select className="approved-form-select required-field"
              value={uploadPopup.FileName}
              onChange={(e) => setUploadPopup({ ...uploadPopup, FileName: e.target.value })}
            >
              <option value="">Select Document</option>
              {uploadPopup.UnApprovedFirSupportingDocuments.map((document) => (
                <option key={document.Pk} value={(document.FileName && document.CreatedDateTime && document.FileName.substring(0, document.FileName.lastIndexOf('.'))+' '+(document.CreatedDateTime)) || 'Unnamed Document'}>
                  {(document.FileName && document.CreatedDateTime && document.FileName.substring(0, document.FileName.lastIndexOf('.'))+' '+(document.CreatedDateTime)) || 'Unnamed Document'}
                </option>
              ))}
            </select><br/><br/>
                <label className="required-field"><b>File Upload (pdf only: 10MB)</b></label><br/>
                 <input ref={firFile} type="file" accept="application/pdf" onChange={handleApprovedFileUpload} />
            </div><br/>
            <div className="popup-buttons">
              <button title="Upload Document" onClick={handleApprovedDocumentsUpload}>Upload</button>
              <button title="Close" onClick={handleUploadPopupClose}>Cancel</button>
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
    <Button variant="secondary" title="Close Window" onClick={handleClose} id="iclose">
      Close
    </Button>
  </Modal.Footer>
</Modal>
      </div>
    </div>
  );
};

export default UserDashboard;