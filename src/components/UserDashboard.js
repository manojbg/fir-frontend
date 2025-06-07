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
  const role = localStorage.getItem('role');
  if(role !== "USER")
  {
    handleLogout();
  }
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [createFormPopup, setCreateFormPopup] = useState({ visible: false, FirNumber: '', FileName: '', PSI: ''});
  const [uploadPopup, setUploadPopup] = useState({ visible: false, FirNumber: '', FileName:'', UnApprovedFirSupportingDocuments: '', file: null});
  const [uploadNCRPPopup, setUploadNCRPPopup] = useState({ visible: false, FirNumber: '',CreatedDateTime:'', file: null});
  const searchBox = React.createRef(null);
  const searchDate = React.createRef(null);
  const firFile = React.createRef(null);
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
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    setShowLoader(true);
    fetchTasks();
    setTimeout(() => {
      handleNotification(false);
    }, 1000);
    document.querySelector("#root").classList.add('user-dashboard-root');
    const intervalId = setInterval(handleNotification, 60000);
    setTimeout(() => {
      setShowLoader(false);
    }, 3000);
           // Cleanup by removing the class when the component unmounts
    return () => {
      document.querySelector("#root").classList.remove('user-dashboard-root');
      clearInterval(intervalId);
    };
  }, [currentPage]);

  const handleShow = (firNumber, fileName, type, pk, psi, createdDateTime) => {
    if(fileName.includes(" - "))
    {
      fileName = fileName.split(" - ")[0];
    }

    const userName = localStorage.getItem('userName');
    if(fileName === "select" || fileName === "")
    {
      handleAlertDisplay("Please select a valid form","danger");
      return;
    }
    const encodedFIR = encodeURIComponent(firNumber); // Encode to safely pass in URL
    const encodedForm = encodeURIComponent(fileName);
    const encodedDateTime = encodeURIComponent(createdDateTime);
    let form = "";
    if(type === "edit"){
      if(fileName.includes("LIEN LETTER"))
      {
        fileName = "LIEN LETTER"
      }
      form = fileName;
    }else{
      form = document.querySelector('.form-select').value;
    }   
    form = form+".html";
    const iframeSrc = `/Forms/`+form+`?firNumber=${encodedFIR}&formName=${encodedForm}&type=`+type+`&pk=`+pk+`&psi=`+psi+`&ioa=`+userName+`&cdt=`+createdDateTime+`&closeModal=true`;
    setIframeSrc(iframeSrc);// Update the iframe source dynamically
    setShowModal(true); // Show the modal
};

  const fetchTasks = async () => {
      const firNumber = searchBox.current !== null ? searchBox.current.value : "";
      const date = searchDate.current !== null ? searchDate.current.value : "";
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

  const handleDeleteDocument = async (firNumber, fileName, pk) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete Document: ${fileName} for FIR No: ${firNumber}?`);
    if (!confirmDelete) return;
    setShowLoader(true);
    await apiService.deleteTaskDocument(pk);
    fetchTasks(); // Refresh the task list
    setShowLoader(false);
  };

  const handleSearchByIdTask = async () => {
    const firNumber = searchBox.current.value;
    searchDate.current.value = '';
    if(firNumber !== "")
    {
      setShowLoader(true);
      try{
       const response = await apiService.searchByIdTask(firNumber, currentPage - 1, pageSize);
       setTasks(response.content);
       setTotalPages(response.totalPages || 1);
       if(response.content.length === 0)
       {
         handleAlertDisplay("No FIR/s found.","danger");
       }
      }
      catch (error) {
       handleAlertDisplay("No FIR/s found.","danger");
       setTasks([]);
      }
      setShowLoader(false);
    }
    else{
      handleAlertDisplay("Please Enter a FIR Number","danger");
    }
  };

  const handleSearchByDateTask = async () => {
    const date = searchDate.current.value;
    searchBox.current.value = '';
    if(date !== "")
    {
      setShowLoader(true);
      try{
        const response = await apiService.getAllTasksByDate(date, currentPage - 1, pageSize);
        setTasks(response.content);
        setTotalPages(response.totalPages || 1);
        if(response.content.length === 0)
        {
          handleAlertDisplay("No FIR/s found.","danger");
        }
      }
      catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
        handleAlertDisplay("No FIR/s found.","danger");
      }
      setShowLoader(false);
    }
    else{
      handleAlertDisplay("Please Enter a Date","danger");
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

  const handleNCRPFileUpload = (e) => {
    setUploadNCRPPopup({ ...uploadNCRPPopup, file: e.target.files[0] });
  };

  const handleFormCreationPopup = (firNumber, fileName, psi) => {
    setCreateFormPopup({ visible: true, FirNumber: firNumber, FileName : fileName, PSI: psi});
  };

  const handleApprovedDocumentsUploadPopup = (firNumber, unApprovedFirSupportingDocuments) => {
    setUploadPopup({ visible: true, FirNumber: firNumber, FileName:'', UnApprovedFirSupportingDocuments: unApprovedFirSupportingDocuments, file: null});
  };

  const handleNCRPUploadPopup = (firNumber, createdDateTime) => {
    setUploadNCRPPopup({ visible: true, FirNumber: firNumber, CreatedDateTime: createdDateTime, file: null});
  };

  const handleApprovedDocumentsUpload = async () => {
    setShowLoader(true);
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
    setShowLoader(false);
  };

  const handleNCRPUpload = async () => {
    setShowLoader(true);
    const documentInput = uploadNCRPPopup.file;
    const userId = localStorage.getItem('userId');
    if(documentInput === null)
    {
       handleAlertDisplay("Mandatory Fields Are Not Populated","danger");
    }
    else if((uploadNCRPPopup.file.size / Math.pow(10,6)) > 15)
    {
       handleAlertDisplay("File is over the allowed size","danger");
    }
    else if(uploadNCRPPopup.file.name.substring(uploadNCRPPopup.file.name.lastIndexOf(".")) !== ".pdf")
    {
       handleAlertDisplay("File format is not PDF","danger");
    }
    else{
      try {
        const fileReader = new FileReader();
        fileReader.onload = async () => {
          const base64File = fileReader.result.split(',')[1];
          const taskData = {
            FirNumber: uploadNCRPPopup.FirNumber,
            CreatedDateTime: uploadNCRPPopup.CreatedDateTime,
            NcrpFileBytes: base64File,
            AssigneeUserId: userId
          };

          await apiService.updateNCRPToFIR(taskData);
          handleAlertDisplay("Document uploaded successfully","success");
          fetchTasks();
          handleUploadNCRPPopupClose();
        };
        fileReader.readAsDataURL(uploadNCRPPopup.file);
      } catch (error) {
         console.error('Error Uploading Document:', error);
         handleAlertDisplay("Error uploading Document FIR. Please try again.","danger");
      }
    }
    setShowLoader(false);
  };

  const handleUploadPopupClose = () => {
    setUploadPopup({ visible: false, FirNumber: '', FileName:'', UnApprovedFirSupportingDocuments: '', file: null});
  }

  const handleUploadNCRPPopupClose = () => {
    setUploadNCRPPopup({ visible: false, FirNumber: '', CreatedDateTime: '', file: null});
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

  const tableReload = () => {
    setShowLoader(true);
    fetchTasks();
    setShowLoader(false);
  }

  const handleLienFormAutoCreation = async (firNumber, status) => {
    if(status !== "UI")
    {
      handleAlertDisplay("FIR is in an invalid status. Please refresh/retry after sometime","danger");
    }
    else
    {
      const encodedFIR = encodeURIComponent(firNumber);
      setShowLoader(true);
      const response = await apiService.initiateAutoLienFormCreation(encodedFIR);
      fetchTasks(); // Refresh the task list
      handleAlertDisplay("Lien forms creation is Initiated","success");
      setShowLoader(false);
    }
  };

  const handleCourtOrderFormsAutoCreation = async (firNumber, status) => {
    if(status !== "UI")
    {
      handleAlertDisplay("FIR is in an invalid status. Please refresh/retry after sometime","danger");
    }
    else
    {
      const encodedFIR = encodeURIComponent(firNumber);
      setShowLoader(true);
      const response = await apiService.initiateAutoCourtOrderFormCreation(encodedFIR);
      fetchTasks(); // Refresh the task list
      handleAlertDisplay("Court Orders creation is Initiated","success");
      setShowLoader(false);
    }
  };

  const handleGenerateNCRPReport = async (firNumber, status) => {

      const encodedFIR = encodeURIComponent(firNumber);
      setShowLoader(true);
      const response = await apiService.createAndDownloadNCRPReport(encodedFIR);
      const blob = new Blob([response.FileBytes], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url);
      fetchTasks(); // Refresh the task list
      handleAlertDisplay("NCRP Report is generated","success");
      setShowLoader(false);

  };

  return (
    <div bsClassName='UserDashboard'>
        <header className="user-dashboard-header">
            <div><img className="navbar-brand" src={logo}></img></div>
            <div>
            <h1 className="navbar-brand-text"><u>Notices And Record Management System</u></h1>
            <p><strong>CEN, North Division, Bangalore</strong></p></div>
            <div>
            <button className="notification-button" title="Notifications" onClick={() => handleNotification(true)}></button>
            <button className="logout-button" title="Log Out" onClick={() => handleLogout()}></button>
            </div>
        </header>
        <div id="loader-mask" style={{ display: showLoader ? "block" : "none" }}><div id="loader" style={{ display: showLoader ? "block" : "none" }}></div></div>
        <Alert className="alert-box" show={show} key={variant} variant={variant} onClose={() => setShow(false)} dismissible>
                         <b>{alertMessage}</b></Alert>
         {modalShow && (
                <NotificationModal handleNotification={handleNotification} show={modalShow} onHide={handleNotificationHide} userClick={userClick} />
              )}
        <div className="user-dashboard">
            <div className="user-search-section">
                <table className="search-table-user">
                <thead>
                <tr><td colSpan="2" className="search-table-header"><b><u>FILTERS</u></b></td></tr>
                </thead>
                <tbody><tr><td>
                    <label>Enter FIR Number &nbsp;&nbsp;</label><input ref={searchBox} type = "text" name="firNumber"></input><button className="search-buttons" title="Search" onClick={() => handleSearchByIdTask()}></button>
                </td><td>
                    <label>Enter Date &nbsp;&nbsp;</label><input ref={searchDate} type = "date"></input><button className="search-buttons" title="Search" onClick={() => handleSearchByDateTask()}></button>
                </td></tr></tbody></table>
            </div>
        </div>
        <div className="list-section">
            <h2 className="section-title">LIST OF FIRs<button className="refresh-button" title="Reload List" onClick={() => tableReload()}></button></h2>
            <div className="task-list">
                <div className="task-header-user">
                    <table><thead><tr><td>FIR</td>
                    <td>MAJOR HEAD</td>
                    <td>COMPLAINANT</td>
                    <td>PSI</td>
                    <td>FIR DATE</td>
                    <td>STATUS</td>
                    <td>ACTIONS</td></tr></thead></table></div>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <details key={task.FirDTO.FirNumber} className="task-item">
              <summary className="task-summary">
                <div className="task-row-user">
                <table><tbody><tr>
                  <td><strong>No:</strong> {task.FirDTO.FirNumber.length > 25 ? task.FirDTO.FirNumber.substring(0,25)+"..." : task.FirDTO.FirNumber}</td>
                  <td>{task.FirDTO.MajorHeader}</td>
                  <td>{task.FirDTO.ComplainantName}</td>
                  <td>{task.FirDTO.PsiName}</td>
                  <td>{task.FirDTO.FirDate}</td>
                  <td>{task.FirDTO.Status}</td>
                  <td>
                    <button className="action-buttons-mainlist-user add-button" title="Add Document" onClick={() => handleFormCreationPopup(task.FirDTO.FirNumber, '', task.FirDTO.PsiName)}></button>
                    <button style={{ display: task.FirDTO.AttachmentFileBytes !== null ? "inline" : "none" }} className="action-buttons-mainlist-user view-button" title="View FIR" onClick={() => handleViewDocument(task.documentUrl)}></button>
                    <button className="action-buttons-mainlist-user upload-form-button" title="Upload NCRP Document" onClick={() => handleNCRPUploadPopup(task.FirDTO.FirNumber, task.FirDTO.CreatedDateTime)}></button>
                  </td>
                  </tr></tbody></table>
                </div>
              </summary>
              <div className="documents-panel">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>Document ({task.UnApprovedFirSupportingDocumentsCount})</th>
                      <th><button style={{ display: task.FirDTO.NcrpFileBytes !== null ? "block" : "none" }} className="create-lien-letter-button" title="Create Lien Letters Automatically" onClick={() => handleLienFormAutoCreation(task.FirDTO.FirNumber, task.FirDTO.Status)}></button></th>
                     </tr>
                  </thead>
                  <tbody>{task.UnApprovedFirSupportingDocuments && task.UnApprovedFirSupportingDocuments.length > 0 ? (
  task.UnApprovedFirSupportingDocuments.map((document, index) =>
       document.FirNumber === "BLANK" ? (
    <tr key={index}>
    <td className="document-date-line-splitter"></td>
    <td className="document-date-line-splitter"></td>
    </tr>
     ) : (
     <tr key={index}>
      <td style={{color : document.FileBytes !== null ? "green" : "red"}}>{(document.FileName && document.CreatedDateTime && document.FileName+' '+(document.CreatedDateTime.substring(0, document.CreatedDateTime.lastIndexOf('.')))) || 'Unnamed Document'}</td>
      <td>
        <button
          className="action-buttons-sublist edit-button" title="Edit Document"
          onClick={() => handleShow(task.FirDTO.FirNumber, document.FileName ,"edit", document.Pk, task.FirDTO.PsiName, document.CreatedDateTime)}
        ></button>
        <button style={{ display: document.FileBytes !== null ? "inline" : "none"}}
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
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>Approved Document ({task.ApprovedFirSupportingDocumentsCount})</th>
                      //<th><button className="upload-button approved-document-upload-button" title="Upload Document" onClick={() => handleApprovedDocumentsUploadPopup(task.FirDTO.FirNumber, task.UnApprovedFirSupportingDocuments)}></button></th>
                      <th><button className="create-ncrp-report-button" title="Generate NCRP Report" onClick={() => handleGenerateNCRPReport(task.FirDTO.FirNumber, task.FirDTO.Status)}></button></th>
                      <th><button className="create-court-order-letters-button" title="Create court order letters Automatically" onClick={() => handleCourtOrderFormsAutoCreation(task.FirDTO.FirNumber, task.FirDTO.Status)}></button></th>
                    </tr>
                  </thead>
                  <tbody>{task.ApprovedFirSupportingDocuments && task.ApprovedFirSupportingDocuments.length > 0 ? (
  task.ApprovedFirSupportingDocuments.map((document, index) =>
           document.FirNumber === "BLANK" ? (
        <tr key={index}>
        <td className="document-date-line-splitter"></td>
        <td className="document-date-line-splitter"></td>
        </tr>
         ) : (
    <tr key={index}>
      <td>{(document.FileName) || 'Unnamed Document'}</td>
      <td>
        <button
          className="action-buttons-sublist edit-button" title="Edit Document"
          onClick={() => handleShow(task.FirDTO.FirNumber, document.FileName ,"edit", document.Pk, task.FirDTO.PsiName, document.CreatedDateTime)}
        ></button>
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
              <option value="35 (3) Notice">35 (3) NOTICE</option>
              <option value="41(A) Notice">41(A) NOTICE</option>
              <option value="91 & 160 NOTICE ENGLISH">91 & 160 NOTICE ENGLISH</option>
              <option value="94 & 179 NOTICE ENGLISH">94 & 179 NOTICE ENGLISH</option>
              <option value="ACCOUNT HOLDER INTIMATION LETTER">ACCOUNT HOLDER INTIMATION LETTER</option>
              <option value="AMAZON">AMAZON</option>
              <option value="ATM CCTV LETTER">ATM CCTV LETTER</option>
              <option value="BENEFICIARY DETAILS REQUEST">BENEFICIARY DETAILS REQUEST</option>
              <option value="BINANCE LETTER">BINANCE LETTER</option>
              <option value="CCTV LETTER">CCTV LETTER</option>
              <option value="CDR REQUEST">CDR REQUEST</option>
              <option value="COURT ORDER">COURT ORDER</option>
              <option value="DEBIT FREEZE">DEBIT FREEZE</option>
              <option value="DELETATION LETTER">DELETATION LETTER</option>
              <option value="DOMAIN LETTER">DOMAIN LETTER</option>
              <option value="FB LETTER">FB LETTER</option>
              <option value="FLIPKART LETTER">FLIPKART LETTER</option>
              <option value="FREEZE INTIMATION TO COURT">FREEZE INTIMATION TO COURT</option>
              <option value="GMAIL LETTER">GMAIL LETTER</option>
              <option value="HOTMAIL LETTER">HOTMAIL LETTER</option>
              <option value="INSTA LETTER">INSTA LETTER</option>
              <option value="IPDR">IPDR</option>
              <option value="KYC AND STATEMENT">KYC AND STATEMENT</option>
              <option value="LIEN LETTER">LIEN LETTER</option>
              <option value="MATRIMONIAL">MATRIMONIAL</option>
              <option value="MERCHANT LETTER">MERCHENT LETTER</option>
              <option value="NCRP 1ST NOTICE">NCRP 1ST NOTICE</option>
              <option value="NCRP 2ND NOTICE">NCRP 2ND NOTICE</option>
              <option value="NPCI FORMAT">NPCI FORMAT</option>
              <option value="OUTLOOK LETTER">OUTLOOK LETTER</option>
              <option value="PAN LINKED LETTER">PAN LINKED LETTER</option>
              <option value="PHONEPE WALLET">PHONEPE WALLET</option>
              <option value="PROTON LETTER">PROTON LETTER</option>
              <option value="RECHARGE DETAILS FORMAT">RECHARGE DETAILS FORMAT</option>
              <option value="REDIFF LETTER">REDIFF LETTER</option>
              <option value="ROC">ROC</option>
              <option value="SWIGGY">SWIGGY</option>
              <option value="TELEGRAM">TELEGRAM</option>
              <option value="TWITTER">TWITTER</option>
              <option value="UNFREEZE LETTER">UNFREEZE LETTER</option>
              <option value="WHATSAPP">WHATSAPP</option>
              <option value="YOUTUBE">YOUTUBE</option>
              <option value="ZOMATO">ZOMATO</option>
            </select>
            </div>
            <div className="popup-buttons">
              <button title="Create Form" onClick={() => {
                        handleShow(createFormPopup.FirNumber,createFormPopup.FileName,"create", "", createFormPopup.PSI,"");
                    }}>Create</button>
              <button title="Close" onClick={() => setCreateFormPopup({ visible: false, FirNumber: '', FileName: '', PSI: '' })}>Cancel</button>
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
                <option key={document.Pk} value={(document.FileName && document.CreatedDateTime && document.FileName+' '+(document.CreatedDateTime)) || 'Unnamed Document'}>
                  {(document.FileName && document.CreatedDateTime && document.FileName+' '+(document.CreatedDateTime)) || 'Unnamed Document'}
                </option>
              ))}
            </select><br/><br/>
                <label className="required-field"><b>Select File To Upload (pdf only: 15MB)</b></label><br/>
                 <input ref={firFile} type="file" accept="application/pdf" onChange={handleApprovedFileUpload} />
            </div><br/>
            <div className="popup-buttons">
              <button title="Upload Document" onClick={handleApprovedDocumentsUpload}>Upload</button>
              <button title="Close" onClick={handleUploadPopupClose}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {uploadNCRPPopup.visible && (
              <div className="popup">
                <div className="popup-content">
                  <h2 className="popup-header"><u>Upload NCRP Document</u></h2><br/>
                  <div>
                  <label><b>FIR Number</b> <br/>{uploadNCRPPopup.FirNumber}</label><br/><br/>
                  <label className="required-field"><b>Select File To Upload (pdf only: 15MB)</b></label><br/>
                  <input ref={firFile} type="file" accept="application/pdf" onChange={handleNCRPFileUpload} />
                  </div><br/>
                  <div className="popup-buttons">
                    <button title="Upload Document" onClick={handleNCRPUpload}>Upload</button>
                    <button title="Close" onClick={handleUploadNCRPPopupClose}>Cancel</button>
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