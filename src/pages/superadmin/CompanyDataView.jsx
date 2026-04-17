import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import Layout from "../../layouts/commonLayout/Layout";
import {
  assignCompanyAdmin,
  clearAssignedAdminState,
  clearCompanyDetailState,
  fetchCompanyById,
} from "../../store/companySlice";
import { getSurfaceBackground } from "../../theme";
import { formatDateTimeIST } from "../../utils/dateTime";

const emptyAdminForm = {
  username: "",
  email: "",
  password: "",
  emp_id: "",
  full_name: "",
  department: "",
  location: "",
  gender: "",
  phone: "",
  is_active: true,
};

export default function CompanyDataView() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    selectedCompany,
    detailLoading,
    detailError,
    assignAdminLoading,
    assignAdminError,
    assignAdminMessage,
    assignedAdmin,
  } = useSelector((state) => state.company);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const currentAdmin = selectedCompany?.admin || assignedAdmin;

  useEffect(() => {
    dispatch(fetchCompanyById(id));

    return () => {
      dispatch(clearCompanyDetailState());
    };
  }, [dispatch, id]);

  const handleAssignAdmin = async () => {
    try {
      await dispatch(
        assignCompanyAdmin({
          companyId: id,
          admin: {
            username: adminForm.username.trim(),
            email: adminForm.email.trim(),
            password: adminForm.password,
            emp_id: adminForm.emp_id.trim(),
            full_name: adminForm.full_name.trim(),
            department: adminForm.department.trim(),
            location: adminForm.location.trim(),
            gender: adminForm.gender.trim(),
            phone: adminForm.phone.trim(),
            is_active: adminForm.is_active,
          },
        }),
      ).unwrap();
      setAdminForm(emptyAdminForm);
      setDialogOpen(false);
    } catch {
      // Redux state already stores the error.
    }
  };

  if (detailLoading) {
    return (
      <Layout role="superadmin" title="View Company">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: getSurfaceBackground(theme),
          }}
        >
          <Typography>Loading company...</Typography>
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout role="superadmin" title="View Company">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: getSurfaceBackground(theme),
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 750 }}>
              Company Details
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Review the company profile and assign additional company admins.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate("/super-admin/company-data")}
            >
              Back to list
            </Button>
            <Button
              variant="outlined"
              startIcon={<PersonAddAltRoundedIcon />}
              onClick={() => {
                dispatch(clearAssignedAdminState());
                setDialogOpen(true);
              }}
            >
              {currentAdmin ? "Replace Admin" : "Assign Admin"}
            </Button>
            <Button
              variant="contained"
              startIcon={<EditRoundedIcon />}
              onClick={() => navigate(`/super-admin/company-data/${id}/edit`)}
            >
              Edit
            </Button>
          </Stack>
        </Stack>

        {(detailError || assignAdminError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {detailError || assignAdminError}
          </Alert>
        )}
        {assignAdminMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {assignAdminMessage}
          </Alert>
        )}

        {selectedCompany ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            {[
              ["Company Name", selectedCompany.company_name],
              ["Industry", selectedCompany.industry],
              ["Size Bucket", selectedCompany.size_bucket],
              ["Email", selectedCompany.email],
              ["Phone", selectedCompany.phone],
              ["Employees", selectedCompany.no_of_employees],
              ["Status", selectedCompany.is_active ? "Active" : "Inactive"],
              [
                "Updated At",
                formatDateTimeIST(selectedCompany.updated_at),
              ],
              ["Admin Added", selectedCompany.admin ? "Yes" : "No"],
            ].map(([label, value]) => (
              <Paper key={label} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography sx={{ mt: 0.8, fontWeight: 600 }}>{value || "-"}</Typography>
              </Paper>
            ))}
          </Box>
        ) : null}

        <Paper variant="outlined" sx={{ mt: 3, p: 2, borderRadius: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            Company Admin
          </Typography>
          {currentAdmin ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 2,
              }}
            >
              {[
                ["Full Name", currentAdmin.full_name],
                ["Email", currentAdmin.email],
                ["Employee ID", currentAdmin.emp_id],
                ["Department", currentAdmin.department],
                ["Location", currentAdmin.location],
                ["Gender", currentAdmin.gender],
                ["Phone", currentAdmin.phone],
                ["Status", currentAdmin.is_active ? "Active" : "Inactive"],
              ].map(([label, value]) => (
                <Paper key={label} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography sx={{ mt: 0.8, fontWeight: 600 }}>{value || "-"}</Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <Alert severity="info">No admin has been added for this company yet.</Alert>
          )}
        </Paper>

        {assignedAdmin && (
          <Paper variant="outlined" sx={{ mt: 3, p: 2, borderRadius: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              Last Assigned Admin
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 2,
              }}
            >
              {[
                ["Full Name", assignedAdmin.full_name],
                ["Email", assignedAdmin.email],
                ["Employee ID", assignedAdmin.emp_id],
                ["Department", assignedAdmin.department],
                ["Location", assignedAdmin.location],
                ["Gender", assignedAdmin.gender],
                ["Phone", assignedAdmin.phone],
                ["Status", assignedAdmin.is_active ? "Active" : "Inactive"],
              ].map(([label, value]) => (
                <Paper key={label} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography sx={{ mt: 0.8, fontWeight: 600 }}>{value || "-"}</Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign Company Admin</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Username"
              value={adminForm.username}
              onChange={(event) =>
                setAdminForm((current) => ({ ...current, username: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Email"
              value={adminForm.email}
              onChange={(event) =>
                setAdminForm((current) => ({ ...current, email: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={adminForm.password}
              onChange={(event) =>
                setAdminForm((current) => ({ ...current, password: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Employee ID"
              value={adminForm.emp_id}
              onChange={(event) =>
                setAdminForm((current) => ({ ...current, emp_id: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Full Name"
              value={adminForm.full_name}
              onChange={(event) =>
                setAdminForm((current) => ({ ...current, full_name: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Department"
              value={adminForm.department}
              onChange={(event) =>
                setAdminForm((current) => ({ ...current, department: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Location"
              value={adminForm.location}
              onChange={(event) =>
                setAdminForm((current) => ({ ...current, location: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Gender"
              value={adminForm.gender}
              onChange={(event) =>
                setAdminForm((current) => ({ ...current, gender: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Phone"
              value={adminForm.phone}
              onChange={(event) =>
                setAdminForm((current) => ({ ...current, phone: event.target.value }))
              }
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={adminForm.is_active}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      is_active: event.target.checked,
                    }))
                  }
                />
              }
              label="Admin is active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssignAdmin}
            disabled={assignAdminLoading}
          >
            {assignAdminLoading ? "Assigning..." : "Assign Admin"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
