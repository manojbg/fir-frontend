import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import apiService from '../services/apiService';
import 'bootstrap/dist/css/bootstrap.css';
import styles from '../styles/Notification.css';

function NotificationModal(props) {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    fetchNotifications();
  },[props.show]);

  const fetchNotifications = async () => {
    const userId = localStorage.getItem('UserId');

    try{
      const response = await apiService.getAllNotificationForUser(userId);
      setNotifications(response.content);
      return await response.content
    } catch(error)
      {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
    }
  }

  const handleClearAll = async () => {
    await apiService.deleteAllNotificationsForUser(localStorage.getItem('UserId'));
    fetchNotifications();
  }

  const handleClearSpecificNotification = async (firNumber, assignee) => {
    await apiService.deleteNotification(firNumber, assignee);
    fetchNotifications();
  }

  return (
    <Modal bsClass='Notification' {...props}>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Notifications
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="grid-example">
        <Container>
        {notifications.length > 0 ? (
           notifications.map((notification) => (
             <React.Fragment>
               <div className="notification-text">
                 You have been assigned the FIR <strong>{notification.FirNumber}</strong> uploaded on <strong>{notification.FirDate}</strong>.
                 <button className="clear-button" onClick={() => handleClearSpecificNotification(notification.FirNumber, notification.AssigneeUserId)}></button>
               </div>
           </React.Fragment>
          ))
          ) : (
                    <p>No Notifications available</p>
          )}
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => handleClearAll()}>Clear All</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default NotificationModal;