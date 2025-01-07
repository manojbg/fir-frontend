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

    if (!response.ok) {
      // Log and throw an error if the response status is not 2xx
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Return the response data
  } catch (error) {
    console.error('Login API Error:', error);
    throw error;
  }
};


const getAllTasks = async (pageNumber = 0, size = 10) => {
  try {
    const response = await fetch(`${API_URL}/dashboard/listAllFIRsWithDocumentDataByUserId?userId=&pageNumber=${pageNumber}&size=${size}`);
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
      const documentUrl = task.FirDTO.AttachmentFileBytes
        ? (() => {
            const byteArray = Uint8Array.from(atob(task.FirDTO.AttachmentFileBytes), (c) => c.charCodeAt(0));
            const blob = new Blob([byteArray], { type: 'application/pdf' }); // Assuming PDFs
            return URL.createObjectURL(blob);
          })()
        : null;

      return{
        ...task,
        documentUrl,
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

const createTask = async ({ FirNumber, FileName, AttachmentFileBytes, AssigneeUserId }) => {
  try {
    const payload = {
      FirNumber,
      FileName,
      AttachmentFileBytes,
      AssigneeUserId,
    };

    const response = await fetch(`${API_URL}/fileOps/saveFIRDocument`, {
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


const getAssignees = async () => {
  try {
    const response = await fetch(`${API_URL}/user/listAllUsers?userRole=user`, {
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

const deleteTask = async (firNumber) =>{
  try {
    const payload = [
      {
        AssigneeUserId: '',
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

const searchByIdTask = async (firNumber) => {
  var data = null;
    try {
      const response = await fetch(`${API_URL}/dashboard/listSpecificFIRsWithDocumentData?firNumbers=${firNumber}`);
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
  try {
    const response = await fetch(`${API_URL}/dashboard/listFIRsByDate?date=${date}&pageNumber=${pageNumber}&size=${size}`);
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

const getAllTasksByUserId = async (userId, pageNumber = 0, size = 10) => {
  var data = null;
  try {
    const response = await fetch(`${API_URL}/dashboard/listAllFIRsWithDocumentDataByUserId?userId=${userId}&pageNumber=${pageNumber}&size=${size}`);
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
  try {
    const response = await fetch(`${API_URL}/dashboard/listEitherAssignedOrUnAssignedFIRsWithPaging?assigned=${assigned}&pageNumber=${pageNumber}&size=${size}`);
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

const createTaskItemData = async ({ FirNumber, FileName, FileContent }) => {
  try {
    const payload = {
      FirNumber,
      FileName,
      FileContent
    };

    const response = await fetch(`${API_URL}/fileOps/saveFIRSupportingDocument`, {
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

export default {
  login,
  getAllTasks,
  assignTask,
  createTask,
  getAssignees,
  deleteTask,
  searchByIdTask,
  getAllTasksByDate,
  getAllTasksByAssignedOrUnAssigned,
  getAllTasksByUserId,
  getAllNotificationForUser,
  deleteAllNotificationsForUser,
  deleteNotification
};