import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginPromptDialog = ({ open, onClose, redirectPath }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/login', { state: { from: redirectPath } });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Login Required</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please log in to book appointments with this service provider.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleLogin} color="primary" variant="contained">
          Login
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginPromptDialog; 