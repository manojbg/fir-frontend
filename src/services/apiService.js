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
    const response = await fetch(`${API_URL}/dashboard/listAllFIRs?pageNumber=${pageNumber}&size=${size}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Process tasks and create document URLs
    const tasks = (data.content || []).map((task) => {
      const documentUrl = task.AttachmentFileBytes
        ? (() => {
            const byteArray = Uint8Array.from(atob(task.AttachmentFileBytes), (c) => c.charCodeAt(0));
            const blob = new Blob([byteArray], { type: 'application/pdf' }); // Assuming PDFs
            return URL.createObjectURL(blob);
          })()
        : null;

      return {
        ...task,
        documentUrl,
      };
    });

    return {
      ...data,
      content: tasks,
    };
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    throw error;
  }
};

const assignTask = async (taskId, userId) => {
  return "";
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

export default {
  login,
  getAllTasks,
  assignTask,
  createTask,
  getAssignees,
};
