import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import { Typography } from '@mui/material';

export const Notification = ({ modalOpen, handleModalClose, handleModalOpen, responseData }) => {
  const hasResponse = responseData && responseData.length > 0;

  return (
    <>
      <Tooltip title="Notification">
        <Fab size="small" aria-label="Notification" style={{ position: 'fixed', marginTop: '70px', right: '1%', zIndex: 1000, backgroundColor: '#036c9e', color: 'white' }}>
          <NotificationsIcon onClick={handleModalOpen} />
        </Fab>
      </Tooltip>
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 550,
          bgcolor: 'white',
          boxShadow: 4,
          borderRadius: 4,
          maxHeight: '95vh',
          overflow: 'auto',
        }}>
          <Typography variant="h4" color="primary" gutterBottom
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: 'center',
          }}
          >
            Notification
          </Typography>
          {hasResponse? (
            responseData.map((data, index) => (
              <div key={index} sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: 'center',
                gap: 4,
                padding: 20,
              }}>
                <Typography variant="body1" color="textSecondary">
                  {data.timestamp}
                </Typography>
                <pre sx={{ margin: 0, fontSize: 12 }}>{JSON.stringify(data.responseData, null, 2)}</pre>
                {index < responseData.length - 1 && <hr style={{ margin: '12px 0' }} />}
              </div>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary" sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: 'center',
              }}>
              No response or notification.
            </Typography>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default Notification;