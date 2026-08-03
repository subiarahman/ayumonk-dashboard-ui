import { Dialog, IconButton } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useDispatch } from "react-redux";
import { clearAuthError } from "../../store/authSlice";
import LoginForm from "./LoginForm";

// Sign-in shown as an overlay on the marketing landing page, so clicking
// "Log in" no longer navigates away from "/". On success LoginForm navigates
// to the workspace (which unmounts the landing page and this modal). Reuses
// the exact same form + auth logic as the /login page.
export default function LoginModal({ open, onClose }) {
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(clearAuthError());
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="login-modal"
      PaperProps={{ sx: { borderRadius: 4, position: "relative", m: 2 } }}
    >
      <IconButton
        aria-label="Close"
        onClick={handleClose}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
      >
        <CloseRoundedIcon />
      </IconButton>
      {open && <LoginForm inModal onSuccess={onClose} />}
    </Dialog>
  );
}
