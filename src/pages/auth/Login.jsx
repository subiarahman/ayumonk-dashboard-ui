import { Box } from "@mui/material";
import LoginForm from "./LoginForm";

// Full-page sign-in at /login. The form itself (and all auth logic) lives in
// LoginForm, which is also reused inside a Dialog on the marketing landing
// page (see LoginModal). This page just centers it in the viewport.
export default function Login() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
      }}
    >
      <LoginForm />
    </Box>
  );
}
