const API_URL = 'http://localhost:8080/firFileArchival/api';

const login = async (userDetails) => {
  try {
    // Ensure the request body matches the expected KSPUser structure
    const payload = {
      UserId: userDetails.userId || "", // Default empty string
      Password: userDetails.password || "", // Default empty string
      UserName: userDetails.userName || "", // Always send as empty string
      Role: userDetails.role || "", // Always send as empty string
    };

    const response = await fetch(`${API_URL}/user/validateLogin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // Send the payload
    });
    var data;
    if(response.ok)
    {
      data = await response.json();
    }
    return data; // Return the response data
  } catch (error) {
    console.error('Login API Error:', error);
    throw error;
  }
};


const getAllTasks = async (pageNumber = 0, size = 10) => {
  try {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const designation = localStorage.getItem('designation');
    let response = await fetch(`${API_URL}/dashboard/listAllFIRsWithDocumentDataByUserId?userId=${userId}&role=${role}&designation=${designation}&pageNumber=${pageNumber}&size=${size}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const tasks = await processResponseData(data);
    return {
      ...data,
      content: tasks,
    };
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    throw error;
  }
};

const processResponseData = async (data) => {
  // Process tasks and create document URLs
  const tasks = (data.content || []).map((task) => {
    var approvedSupportingDocumentsCount = 0;
    var unApprovedSupportingDocumentsCount = 0;
    // Generate documentUrl for FirDTO.AttachmentFileBytes
    const mainDocumentUrl = task.FirDTO.AttachmentFileBytes
      ? (() => {
          const byteArray = Uint8Array.from(
            atob(task.FirDTO.AttachmentFileBytes),
            (c) => c.charCodeAt(0)
          );
          const blob = new Blob([byteArray], { type: 'application/pdf' }); // Assuming PDFs
          return URL.createObjectURL(blob);
        })()
      : null;

    // Generate documentUrl for each ApprovedFirSupportingDocuments.File
    const supportingDocuments = (task.ApprovedFirSupportingDocuments || []).map(
      supportingDocument => (
        supportingDocument.FirNumber !== "BLANK" ? (approvedSupportingDocumentsCount+=1) : null,
      ({
        ...supportingDocument,
        documentUrl: supportingDocument.FileBytes
          ? (() => {
              const byteArray = Uint8Array.from(
                atob(supportingDocument.FileBytes),
                (c) => c.charCodeAt(0)
              );
              const blob = new Blob([byteArray], { type: 'application/pdf' }); // Assuming HTML
              return URL.createObjectURL(blob);
            })()
          : null,
      })
    ));

    // Generate documentUrl for each UnApprovedFirSupportingDocuments.File
    const unApprovedSupportingDocuments = (task.UnApprovedFirSupportingDocuments || []).map(
      supportingDocument =>(
        supportingDocument.FirNumber !== "BLANK" ? (unApprovedSupportingDocumentsCount+=1) : null,
      ({
        ...supportingDocument,
        documentUrl: supportingDocument.FileBytes
          ? (() => {
              const byteArray = Uint8Array.from(
                atob(supportingDocument.FileBytes),
                (c) => c.charCodeAt(0)
              );
              const blob = new Blob([byteArray], { type: 'application/pdf' }); // Assuming HTML
              return URL.createObjectURL(blob);
            })()
          : null,
      })
    ));

    return {
      ...task,
      documentUrl: mainDocumentUrl,
      ApprovedFirSupportingDocuments: supportingDocuments,
      ApprovedFirSupportingDocumentsCount: approvedSupportingDocumentsCount,
      UnApprovedFirSupportingDocuments: unApprovedSupportingDocuments,
      UnApprovedFirSupportingDocumentsCount: unApprovedSupportingDocumentsCount
    };
  });

  return await tasks;
};


const assignTask = async ({ FirNumber, FileName, AttachmentFileBytes, AssigneeUserId, FirDate }) => {
  try {
    const payload = {
      FirNumber,
      FileName,
      AttachmentFileBytes,
      AssigneeUserId,
      FirDate
    };

    const response = await fetch(`${API_URL}/user/assignOrDeAssignUserToFIR`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

const createTask = async (taskData) => {
  try {
      const response = await fetch(`${API_URL}/fileOps/saveFIRDocument`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};


const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/user/listAllUsers`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

const getAllHeaders = async () => {
  try {
    const response = await fetch(`${API_URL}/dashboard/listAllMajorHeaders`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching assignees:', error);
    throw error;
  }
};

const deleteTask = async (firNumber, assignee) =>{
  try {
    const payload = [
      {
        AssigneeUserId: assignee,
        AttachmentFileBytes: '',
        CreatedDateTime: '',
        FileName: '',
        FirNumber: firNumber,
      },
    ];

    const response = await fetch(`${API_URL}/fileOps/deleteFIRs`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

  } catch (error) {
    alert('Error deleting FIR. Please try again.');
    console.error('Delete Task Error:', error);
  }
};

const deleteTaskDocument = async (pk) =>{
  try {
    const response = await fetch(`${API_URL}/fileOps/deleteFIRSupportDocument?supportingDocumentId=${pk}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

  } catch (error) {
    alert('Error deleting FIR. Please try again.');
    console.error('Delete Task Error:', error);
  }
};


const searchByIdTask = async (firNumber, pageNumber = 0, size = 10) => {
  var data = null;
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  const designation = localStorage.getItem('designation');

  let response = "";
    try {
        response = await fetch(`${API_URL}/dashboard/listSpecificFIRsWithDocumentData?firNumbers=${firNumber}&userId=${userId}&role=${role}&designation=${designation}&pageNumber=${pageNumber}&size=${size}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data = await response.json();
      const tasks = await processResponseData(data);
      return {...data, tasks };
    } catch (error) {
      alert('FIR not found due to an error');
      console.error('FIR Not Found:', error);
      return { ...data,content: []};
  }
};

const getAllTasksByDate = async (date, pageNumber = 0, size = 10) => {
  var data = null;
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  const designation = localStorage.getItem('designation');
  let response = "";

  try {
      response = await fetch(`${API_URL}/dashboard/listFIRsByDate?date=${date}&userId=${userId}&role=${role}&designation=${designation}&pageNumber=${pageNumber}&size=${size}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
      data = await response.json();
      const tasks = await processResponseData(data);
      return {...data, tasks };
    } catch (error) {
      alert('FIR not found due to an error');
      console.error('FIR Not Found:', error);
      return { ...data,content: []};
  }
};

const getAllTasksByAssignedOrUnAssigned = async (assigned, pageNumber = 0, size = 10) => {
  var data = null;
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  const designation = localStorage.getItem('designation');
  try {
    const response = await fetch(`${API_URL}/dashboard/listEitherAssignedOrUnAssignedFIRsWithPaging?assigned=${assigned}&userId=${userId}&role=${role}&designation=${designation}&pageNumber=${pageNumber}&size=${size}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
      data = await response.json();
      const tasks = await processResponseData(data);
      return {...data, tasks };
    } catch (error) {
      alert('FIR not found due to an error');
      console.error('FIR Not Found:', error);
      return { ...data,content: []};
  }
};

const createTaskItemData = async (supportingDocument) => {
  try {
      const response = await fetch(`${API_URL}/fileOps/saveFIRSupportingDocument`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      body: JSON.stringify(supportingDocument),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response;
  } catch (error) {
    console.error('Error creating task item:', error);
    throw error;
  }
};

const deleteAllNotificationsForUser = async (userId) =>{
  try {
    const response = await fetch(`${API_URL}/notification/deleteAllNotificationsByUserId?userId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

  } catch (error) {
    alert('Error deleting Notifications for user '+userId+' . Please try again.');
    console.error('Delete Notifications Error:', error);
  }
};

const deleteNotification = async (firNumber, userId) =>{
  try {
    const payload =
      {
        AssigneeUserId: userId,
        FirNumber: firNumber,
      }

    const response = await fetch(`${API_URL}/notification/deleteNotification`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

  } catch (error) {
    alert('Error deleting Notification. Please try again.');
    console.error('Delete Notification Error:', error);
  }
};

const getAllNotificationForUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/notification/listNotificationsByUserId?userId=${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    throw error;
  }
};

const initiateAutoLienFormCreation = async (firNumber) => {
    try {
      const response = await fetch(`${API_URL}/fileOps/createLienForms?firNumber=${firNumber}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response;
    } catch (error) {
      alert('Failed to initiate form creation');
      console.error('Lien form creation failed:', error);
      throw error;
  }
};

const updateNCRPToFIR = async (taskData) => {
  try {
      const response = await fetch(`${API_URL}/fileOps/updateNCRPToFIR`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

const createAndDownloadNCRPReport = async (firNumber) => {
  try {
      const response = await fetch(`${API_URL}/fileOps/createExcelReport?firNumber=${firNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

const downloadNCRPReport = async (firNumber) => {
  try {
      const response = await fetch(`${API_URL}/fileOps/downloadNCRPExcelReport?firNumber=${firNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response;
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};

const initiateAutoCourtOrderFormCreation = async (firNumber) => {
    try {
      const response = await fetch(`${API_URL}/fileOps/createCourtOrderForms?firNumber=${firNumber}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response;
    } catch (error) {
      alert('Failed to initiate form creation');
      console.error('Court order form creation failed:', error);
      throw error;
  }
};

export default {
  login,
  getAllTasks,
  assignTask,
  createTask,
  getAllUsers,
  deleteTask,
  deleteTaskDocument,
  searchByIdTask,
  getAllTasksByDate,
  getAllTasksByAssignedOrUnAssigned,
  getAllNotificationForUser,
  deleteAllNotificationsForUser,
  deleteNotification,
  getAllHeaders,
  createTaskItemData,
  initiateAutoLienFormCreation,
  updateNCRPToFIR,
  createAndDownloadNCRPReport,
  initiateAutoCourtOrderFormCreation,
  downloadNCRPReport
};