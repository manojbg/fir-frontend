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

    // Convert byte array to document URL
    const tasks = (data.content || []).map((task) => {
      const documents = (task.attachmentFileBytes || []).map((doc) => {
        if (!doc.attachmentFileBytes || !Array.isArray(doc.attachmentFileBytes)) {
          console.warn('Invalid or missing attachmentFileBytes:', doc);
          return { ...doc, documentUrl: null };
        }

        const byteArray = new Uint8Array(doc.attachmentFileBytes);
        const blob = new Blob([byteArray], { type: 'application/pdf' }); // Assuming documents are PDFs
        const url = URL.createObjectURL(blob);
        return { ...doc, documentUrl: url };
      });
      return { ...task, documents };
    });

    return { ...data, content: tasks };
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    throw error;
  }
};



const assignTask = async (taskId, userId) => {
  return "";
};

const createTask = async ({ firNumber, file, assigneeUserId }) => {
  try {
    // Convert file to byte array
    const fileReader = new FileReader();
    const fileBytes = await new Promise((resolve, reject) => {
      fileReader.onloadend = () => {
        const arrayBuffer = fileReader.result;
        const byteArray = new Uint8Array(arrayBuffer);
        resolve(Array.from(byteArray));
      };
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(file);
    });

    const payload = {
      AssigneeUserId: assigneeUserId,
      AttachmentFileBytes: fileBytes,
      CreatedDateTime: '',
      FirNumber: firNumber,
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

    return await response.json();
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
