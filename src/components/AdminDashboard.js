// Updated AdminDashboard.js
import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import '../styles/AdminDashboard.css';
import logo from '../styles/assets/images/ksplogo1.jpg';
import { useNavigate } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [majorHeaders, setMajorHeaders] = useState([]);
  const [psiNames, setPsiNames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [newTask, setNewTask] = useState({ FirNumber: '', file: null, AssigneeUserId: '', ComplainantName: '', MajorHeader: '', InvestigationOfficer: '', PoliceInspector: '', PsiName: '', NcrpFile: '' });
  const [assignPopup, setAssignPopup] = useState({ visible: false, FirNumber: '', FirDate:'', AssigneeUserId: '' });
  const [uploadPopup, setUploadPopup] = useState({ visible: false, FirNumber: '', FileName:'', UnApprovedFirSupportingDocuments: '', file: null});
  const searchBox = React.createRef(null);
  const searchDate = React.createRef(null);
  const searchToggle = React.createRef(null);
  const firFile = React.createRef(null);
  const ncrpFile = React.createRef(null);
  const firDate = React.createRef(null);
  const firDatePopup = React.createRef(null);

  const navigate = useNavigate();
  const [modalShow, setModalShow] = useState(false);
  const [userClick, setUserClick] = useState(false);
  const [show, setShow] = useState(false);
  const [alertMessage, setAlertMessage] = useState();
  const [variant, setVariant] = useState();
  const investigationOfficer = "PAVAN";
  const policeInspector = "PO 123";

  useEffect(() => {
    fetchTasks();
    fetchAssigneesAndPsiNames();
    fetchMajorHeaders();
    document.querySelector("#root").classList.add('admin-dashboard-root');
            // Cleanup by removing the class when the component unmounts
    return () => {
      document.querySelector("#root").classList.remove('admin-dashboard-root');
    };
  }, [currentPage]);

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

  const fetchAssigneesAndPsiNames = async () => {
    try {
      const usersMap = await apiService.getAllUsers();
      setAssignees(usersMap["USER"]);
      var psiNames = usersMap["ADMIN"].filter((user) => {
           return user.Designation === "PSI";
         })
      setPsiNames(psiNames);
    } catch (error) {
      console.error('Error fetching Assignee and PSI:', error);
      handleAlertDisplay("Error fetching Assignee and PSI.","danger");
    }
  };

  const fetchMajorHeaders = async () => {
    try {
      const headersList = await apiService.getAllHeaders();
      setMajorHeaders(headersList);
    } catch (error) {
      console.error('Error fetching headersList:', error);
      handleAlertDisplay("Error fetching headersList.","danger");
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

  const handleSearchByAssignedOrUnAssignedTask = async () => {
    searchBox.current.value = '';
    searchDate.current.value = '';
    const input = searchToggle.current;
    const assigned = input.checked;
    try{
      const response =await apiService.getAllTasksByAssignedOrUnAssigned(assigned,currentPage - 1, pageSize);
      setTasks(response.content);
      if(response.content.length == 0)
      {
        handleAlertDisplay("No FIR/s found.","danger");
      }
    }catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      handleAlertDisplay("No FIR/s found.","danger");
     }
  };

  const handleCreateTask = async () => {
    const firNumberInput = newTask.FirNumber;
    const firDateInput = firDate.current.value;
    const firFileInput = firFile.current.value;
    const complainantName = newTask.ComplainantName;
    const majorHeader = newTask.MajorHeader;
    const psiName = newTask.PsiName;
    const ncrpFileInput = ncrpFile.current.value;

    if(firNumberInput == '' || firDateInput == '' || firFileInput == '' || complainantName == '' || majorHeader == '' || psiName == '')
    {
       handleAlertDisplay("Mandatory Fields Are Not Populated","danger");
    }
    else{
      try {
        const fileReader = new FileReader();
        fileReader.onload = async () => {
          const base64FirFile = fileReader.result.split(',')[1];
          const taskData = {
                FirNumber: firNumberInput,
                FileName: newTask.file.name,
                AttachmentFileBytes: base64FirFile,
                AssigneeUserId: newTask.AssigneeUserId,
                FirDate : firDateInput,
                ComplainantName : complainantName,
                MajorHeader : majorHeader,
                InvestigationOfficer : investigationOfficer,
                PoliceInspector : policeInspector,
                PsiName : psiName,
                NcrpFileBytes : null
              };
          if(ncrpFileInput !== "")
          {
            const fileReader2 = new FileReader();
            fileReader2.onload = async () => {
              const base64NcrpFile = fileReader.result.split(',')[1];
              taskData.NcrpFileBytes = base64NcrpFile;
              persistTaskToDB(taskData);
            }
            fileReader2.readAsDataURL(newTask.NcrpFile);
          }
          else{
            persistTaskToDB(taskData);
          }
        };
        fileReader.readAsDataURL(newTask.file);
      } catch (error) {
        console.error('Error creating FIR:', error);
        handleAlertDisplay("Error creating FIR. Please try again.","danger");
      }
    }
  };

  const persistTaskToDB = async(taskData) => {
    try{
      await apiService.createTask(taskData);
    }catch (error) {
      console.error('Error creating FIR:', error);
      handleAlertDisplay("Error creating FIR. Please try again.","danger");
      return;
    }
    handleAlertDisplay("FIR created successfully","success");
    setCurrentPage(1); // Reset to first page to see the new task
    handleReset();
    fetchTasks();
  }

  const handleReset = async () => {
    firDate.current.value = '';
    firFile.current.value = '';
    setNewTask({ FirNumber: '', file: null, AssigneeUserId: '', ComplainantName: '', MajorHeader: '', InvestigationOfficer: '', PoliceInspector: '', PsiName: '' , NcrpFile: ''});
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
      handleAlertDisplay("Assignee updated successfully","success");
      setAssignPopup({ visible: false, FirNumber: '', FirDate: '', AssigneeUserId: '' });
      fetchTasks();
    } catch (error) {
      console.error('Error assigning FIR:', error);
      handleAlertDisplay("Error assigning FIR. Please try again.","danger");
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

  const handleApprovedFileUpload = (e) => {
    setUploadPopup({ ...uploadPopup, file: e.target.files[0] });
  };

  const handleNCRPFileUpload = (e) => {
    setNewTask({ ...newTask, NcrpFile: e.target.files[0] });
  };

  const handleAssignPopup = (FirNumber, FirDate, AssigneeUserId) => {
    setAssignPopup({ visible: true, FirNumber: FirNumber, FirDate: FirDate, AssigneeUserId: AssigneeUserId });
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

  const handleAlertDisplay = (message,variant) => {
    setVariant(variant);
    setAlertMessage(message);
    setShow(true);
    setTimeout(() => {
      setShow(false)
    }, 5000);
  }

  return (
    <div bsClass='AdminDashboard' >
        <header className="dashboard-header">
            <div><img className="navbar-brand" src={logo}></img></div>
            <div>
            <h1 className="navbar-brand-text"><u>Crime Report Tracking System</u></h1>
            <p><strong>Karnataka State</strong></p></div>
            <div>
            <button className="logout-button" title="Log Out" onClick={() => handleLogout()}></button>
            </div>
        </header>
        <div className="admin-dashboard">
               <Alert className="alert-box" show={show} key={variant} variant={variant} onClose={() => setShow(false)} dismissible>
                   <b>{alertMessage}</b></Alert>
            <div className="create-section">
                <div className="create-header">Upload FIR</div>
                <table class="create-table"><tbody><tr><td>
                <label className="required-field">FIR Number </label><br/>
                    <input type="text" value={newTask.FirNumber}
                            onChange={(e) => setNewTask({ ...newTask, FirNumber: e.target.value })}
                    /></td><td>
                    <label className="required-field">Complainant Name </label><br/>
                    <input value={newTask.ComplainantName} type="text"
                    onChange={(e) => setNewTask({ ...newTask, ComplainantName: e.target.value })}/>
                    </td><td>
                    <label>Investigation Officer : &nbsp;</label>
                    <span>{investigationOfficer}</span><br/>
                    <label>Police Inspector : &nbsp;</label>
                    <span>{policeInspector}</span>
                   </td></tr><tr><td>
                <label className="required-field">FIR File Upload (pdf only: 10MB)</label><br/>
                 <input ref={firFile} type="file" accept="application/pdf" onChange={handleFileUpload} />
                </td><td>
                    <label className="required-field">FIR / NCRP Date </label><br/>
                    <input ref={firDate} type = "date"></input>
                </td>
                <td>
                <label className="required-field">P S I</label><br/>
                     <select
                             value={newTask.PsiName}
                             onChange={(e) => setNewTask({ ...newTask, PsiName: e.target.value })}>
                     <option value="">Select PSI</option>
                     {psiNames.map((psiName) => (
                     <option key={psiName.UserId} value={psiName.UserId}>
                         {psiName.UserName}
                     </option>
                     ))}
                     </select>
                </td>
                </tr><tr><td>
                   <label className="required-field">FIR Header</label><br/>
                      <select
                              value={newTask.MajorHeader}
                              onChange={(e) => setNewTask({ ...newTask, MajorHeader: e.target.value })}
                      >
                      <option value="">Select FIR Header</option>
                      {majorHeaders.map((header) => (
                      <option key={header.Id} value={header.Header}>
                          {header.Header}
                      </option>
                      ))}
                      </select>
                </td><td>
                <label>NCRP File Upload (pdf only: 10MB)</label><br/>
                 <input ref={ncrpFile} type="file" accept="application/pdf" onChange={handleNCRPFileUpload} />
                </td>
                <td>
                <label>Assignee</label><br/>
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
                </td>
                </tr></tbody></table>
                <div className="popup-buttons create-buttons">
                    <button title="Upload FIR" onClick={handleCreateTask}>Submit</button>
                    <button title="Reset" onClick={() => handleReset()}>Reset</button>
                </div>
            </div>

            <div className="search-section">
                <table className="search-table"><thead><tr><td>
                    <label>Enter FIR Number &nbsp;&nbsp;</label><input ref={searchBox} type = "text" name="firNumber"></input><button className="search-buttons" title="Search" onClick={() => handleSearchByIdTask()}></button>
                </td><td>
                    <label>Enter Date &nbsp;&nbsp;</label><input ref={searchDate} type = "date"></input><button className="search-buttons" title="Search" onClick={() => handleSearchByDateTask()}></button>
                </td><td>
                    <label>Un-Assigned &nbsp;&nbsp;</label><label class="switch"><input id="toggle-switch" ref={searchToggle} type="checkbox"></input><span class="slider round"></span></label><label>&nbsp;&nbsp;Assigned</label><button className="search-buttons" title="Search" onClick={() => handleSearchByAssignedOrUnAssignedTask()}></button>
                </td></tr></thead></table>
            </div>
        </div>
        <div className="list-section">
            <h2 className="section-title">LIST OF FIRs<button className="refresh-button" title="Reload Table" onClick={() => fetchTasks()}></button></h2>
            <div className="task-list">
                <div className="task-header">
                    <table><thead><tr><td className="task-header-td1">FIR</td>
                    <td>MAJOR HEAD</td>
                    <td>COMPLAINANT</td>
                    <td>PSI</td>
                    <td>ASSIGNEE</td>
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
                  <td>{task.FirDTO.AssigneeUserId || 'Unassigned'}</td>
                  <td>{task.FirDTO.FirDate}</td>
                  <td>{task.FirDTO.Status}</td>
                  <td>
                    <button className="action-buttons-mainlist assign-button" title="Assign" onClick={() => handleAssignPopup(task.FirDTO.FirNumber, task.FirDTO.FirDate, task.FirDTO.AssigneeUserId || '')}></button>
                    <button className="action-buttons-mainlist view-button" title="View FIR" onClick={() => handleViewDocument(task.documentUrl)}></button>
                    <button className="action-buttons-mainlist delete-button" title="Delete FIR" onClick={() => handleDeleteTask(task.FirDTO.FirNumber)}></button>
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
      {assignPopup.visible && (
        <div className="popup">
          <div className="popup-content">
            <h2 className="popup-header"><u>Assign Assignee</u></h2><br/>
            <label><b>FIR Number : </b>{assignPopup.FirNumber}</label><br/><br/>
            <label><b>FIR Date : </b>{assignPopup.FirDate}</label><br/>
            <label><b>Change FIR Date To : </b>&nbsp;</label>
                                <input ref={firDatePopup} id="assigneeDate" type = "date"></input><br/><br/>
            <div>
            <label><b>Assignee : </b>&nbsp;</label>
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
              <button title="Update Assignee" onClick={handleSaveAssignee}>Save</button>
              <button title="Close" onClick={() => setAssignPopup({ visible: false, FirNumber: '', FirDate:'', AssigneeUserId: '' })}>Cancel</button>
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
                <option key={document.Pk} value={document.FileName}>
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
      </div>
    </div>
  );
};

export default AdminDashboard;