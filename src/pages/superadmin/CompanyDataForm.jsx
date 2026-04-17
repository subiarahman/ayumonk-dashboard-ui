import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Layout from "../../layouts/commonLayout/Layout";
import {
  assignCompanyAdmin,
  clearCompanyCreateState,
  clearCompanyDetailState,
  clearCompanyUpdateState,
  createCompany,
  fetchCompanyById,
  updateCompany,
} from "../../store/companySlice";
import { getSurfaceBackground } from "../../theme";

const createCompanyDefaults = {
  company_name: "",
  industry: "",
  size_bucket: "",
  email: "",
  phone: "",
  no_of_employees: 0,
  is_active: true,
};

const createAdminDefaults = {
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

export default function CompanyDataForm({ mode }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    selectedCompany,
    detailLoading,
    detailError,
    createLoading,
    createError,
    updateLoading,
    updateError,
    assignAdminLoading,
    assignAdminError,
  } = useSelector((state) => state.company);
  const [companyForm, setCompanyForm] = useState(() =>
    mode === "edit" ? {} : createCompanyDefaults,
  );
  const [adminForm, setAdminForm] = useState(() =>
    mode === "edit" ? {} : createAdminDefaults,
  );
  const [adminEnabled, setAdminEnabled] = useState(mode === "add");
  const [formError, setFormError] = useState("");

  const pageTitle = useMemo(
    () => (mode === "edit" ? "Edit Company" : "Add Company"),
    [mode],
  );

  useEffect(() => {
    if (mode === "edit" && id) {
      dispatch(fetchCompanyById(id));
    }

    return () => {
      dispatch(clearCompanyCreateState());
      dispatch(clearCompanyUpdateState());
      dispatch(clearCompanyDetailState());
    };
  }, [dispatch, id, mode]);

  const resolvedCompanyForm = useMemo(() => {
    if (mode !== "edit") {
      return companyForm;
    }

    return {
      company_name: selectedCompany?.company_name || "",
      industry: selectedCompany?.industry || "",
      size_bucket: selectedCompany?.size_bucket || "",
      email: selectedCompany?.email || "",
      phone: selectedCompany?.phone || "",
      no_of_employees: selectedCompany?.no_of_employees ?? 0,
      is_active: Boolean(selectedCompany?.is_active),
      ...companyForm,
    };
  }, [companyForm, mode, selectedCompany]);

  const resolvedAdminEnabled = useMemo(
    () => adminEnabled || Boolean(selectedCompany?.admin),
    [adminEnabled, selectedCompany?.admin],
  );

  const resolvedAdminForm = useMemo(() => {
    if (mode !== "edit") {
      return adminForm;
    }

    return {
      username: selectedCompany?.admin?.username || "",
      email: selectedCompany?.admin?.email || "",
      password: "",
      emp_id: selectedCompany?.admin?.emp_id || "",
      full_name: selectedCompany?.admin?.full_name || "",
      department: selectedCompany?.admin?.department || "",
      location: selectedCompany?.admin?.location || "",
      gender: selectedCompany?.admin?.gender || "",
      phone: selectedCompany?.admin?.phone || "",
      is_active:
        adminForm.is_active ??
        selectedCompany?.admin?.is_active ??
        createAdminDefaults.is_active,
      ...adminForm,
    };
  }, [adminForm, mode, selectedCompany]);

  const validate = () => {
    if (
      !resolvedCompanyForm.company_name.trim() ||
      !resolvedCompanyForm.industry.trim() ||
      !resolvedCompanyForm.size_bucket ||
      !resolvedCompanyForm.email.trim() ||
      !resolvedCompanyForm.phone.trim()
    ) {
      return "Complete all required company fields.";
    }

    if (resolvedAdminEnabled) {
      if (
        !resolvedAdminForm.username.trim() ||
        !resolvedAdminForm.email.trim() ||
        !resolvedAdminForm.emp_id.trim() ||
        !resolvedAdminForm.full_name.trim()
      ) {
        return "Complete the required admin fields.";
      }

      if (!resolvedAdminForm.password.trim()) {
        return "Enter an admin password to save admin details.";
      }
    }

    return "";
  };

  const handleSave = async () => {
    const nextError = validate();
    if (nextError) {
      setFormError(nextError);
      return;
    }

    setFormError("");

    try {
      if (mode === "edit") {
        await dispatch(
          updateCompany({
            companyId: id,
            company: {
              company_name: resolvedCompanyForm.company_name.trim(),
              industry: resolvedCompanyForm.industry.trim(),
              size_bucket: resolvedCompanyForm.size_bucket,
              email: resolvedCompanyForm.email.trim(),
              phone: resolvedCompanyForm.phone.trim(),
              no_of_employees: Number(resolvedCompanyForm.no_of_employees) || 0,
              is_active: resolvedCompanyForm.is_active,
            },
          }),
        ).unwrap();

        if (resolvedAdminEnabled) {
          await dispatch(
            assignCompanyAdmin({
              companyId: id,
              admin: {
                username: resolvedAdminForm.username.trim(),
                email: resolvedAdminForm.email.trim(),
                password: resolvedAdminForm.password,
                emp_id: resolvedAdminForm.emp_id.trim(),
                full_name: resolvedAdminForm.full_name.trim(),
                department: resolvedAdminForm.department.trim(),
                location: resolvedAdminForm.location.trim(),
                gender: resolvedAdminForm.gender.trim(),
                phone: resolvedAdminForm.phone.trim(),
                is_active: resolvedAdminForm.is_active,
              },
            }),
          ).unwrap();
        }

        navigate("/super-admin/company-data", {
          replace: true,
          state: {
            feedback: {
              severity: "success",
              message: resolvedAdminEnabled
                ? "Company and admin updated successfully."
                : "Company updated successfully.",
            },
          },
        });
        return;
      }

      await dispatch(
        createCompany({
          company: {
            company_name: companyForm.company_name.trim(),
            industry: companyForm.industry.trim(),
            size_bucket: companyForm.size_bucket,
            email: companyForm.email.trim(),
            phone: companyForm.phone.trim(),
            no_of_employees: Number(companyForm.no_of_employees) || 0,
          },
          admin: resolvedAdminEnabled
            ? {
                username: resolvedAdminForm.username.trim(),
                email: resolvedAdminForm.email.trim(),
                password: resolvedAdminForm.password,
                emp_id: resolvedAdminForm.emp_id.trim(),
                full_name: resolvedAdminForm.full_name.trim(),
                department: resolvedAdminForm.department.trim(),
                location: resolvedAdminForm.location.trim(),
                gender: resolvedAdminForm.gender.trim(),
                phone: resolvedAdminForm.phone.trim(),
                is_active: resolvedAdminForm.is_active,
              }
            : null,
        }),
      ).unwrap();

      navigate("/super-admin/company-data", {
        replace: true,
        state: {
          feedback: {
            severity: "success",
            message: resolvedAdminEnabled
              ? "Company and admin created successfully."
              : "Company created successfully.",
          },
        },
      });
    } catch {
      // Redux state already stores the API error.
    }
  };

  if (mode === "edit" && detailLoading) {
    return (
      <Layout role="superadmin" title={pageTitle}>
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
    <Layout role="superadmin" title={pageTitle}>
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
              {pageTitle}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              {mode === "edit"
                ? "Update the company profile and activation state."
                : "Create a company. Admin details can be added later."}
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/super-admin/company-data")}
          >
            Back to list
          </Button>
        </Stack>

        {(formError ||
          detailError ||
          createError ||
          updateError ||
          assignAdminError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError ||
              detailError ||
              createError ||
              updateError ||
              assignAdminError}
          </Alert>
        )}

        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Company Details
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <TextField
                label="Company Name"
                value={resolvedCompanyForm.company_name}
                onChange={(event) =>
                  setCompanyForm((current) => ({
                    ...current,
                    company_name: event.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label="Industry"
                value={resolvedCompanyForm.industry}
                onChange={(event) =>
                  setCompanyForm((current) => ({
                    ...current,
                    industry: event.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label="Size Bucket"
                value={resolvedCompanyForm.size_bucket}
                onChange={(event) =>
                  setCompanyForm((current) => ({
                    ...current,
                    size_bucket: event.target.value,
                  }))
                }
                select
                fullWidth
              >
                <MenuItem value="">Select Size Bucket</MenuItem>
                {["small", "medium", "large", "enterprise"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Company Email"
                value={resolvedCompanyForm.email}
                onChange={(event) =>
                  setCompanyForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label="Phone"
                value={resolvedCompanyForm.phone}
                onChange={(event) =>
                  setCompanyForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label="No. of Employees"
                type="number"
                value={resolvedCompanyForm.no_of_employees}
                onChange={(event) =>
                  setCompanyForm((current) => ({
                    ...current,
                    no_of_employees: event.target.value,
                  }))
                }
                fullWidth
              />
            </Box>

            {mode === "edit" && (
              <>
                <Alert
                  severity={selectedCompany?.admin ? "success" : "info"}
                  sx={{ mt: 2 }}
                >
                  {selectedCompany?.admin
                    ? `Admin added: ${selectedCompany.admin.full_name || selectedCompany.admin.email || "Yes"}`
                    : "No admin added yet for this company."}
                </Alert>
                <FormControlLabel
                  sx={{ mt: 2 }}
                  control={
                    <Switch
                      checked={resolvedCompanyForm.is_active}
                      onChange={(event) =>
                        setCompanyForm((current) => ({
                          ...current,
                          is_active: event.target.checked,
                        }))
                      }
                    />
                  }
                  label="Company is active"
                />
              </>
            )}
          </Box>

          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {mode === "edit" ? "Company Admin" : "Optional Company Admin"}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  {resolvedAdminEnabled
                    ? "Admin details will be saved with this form."
                    : "Leave this off to create or update only the company."}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={resolvedAdminEnabled}
                    onChange={(event) => setAdminEnabled(event.target.checked)}
                  />
                }
                label={resolvedAdminEnabled ? "Admin enabled" : "Admin disabled"}
              />
            </Stack>

            {resolvedAdminEnabled ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 2,
                }}
              >
                <TextField
                  label="Username"
                  value={resolvedAdminForm.username}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Admin Email"
                  value={resolvedAdminForm.email}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Password"
                  type="password"
                  value={resolvedAdminForm.password}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  helperText={
                    mode === "edit"
                      ? "Enter a password to update or replace the company admin."
                      : ""
                  }
                  fullWidth
                />
                <TextField
                  label="Employee ID"
                  value={resolvedAdminForm.emp_id}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      emp_id: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Full Name"
                  value={resolvedAdminForm.full_name}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      full_name: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Department"
                  value={resolvedAdminForm.department}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      department: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Location"
                  value={resolvedAdminForm.location}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Gender"
                  value={resolvedAdminForm.gender}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      gender: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Phone"
                  value={resolvedAdminForm.phone}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={resolvedAdminForm.is_active}
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
              </Box>
            ) : (
              <Alert severity="info">
                Creating company without admin
              </Alert>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.25} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            onClick={handleSave}
            disabled={createLoading || updateLoading || assignAdminLoading}
          >
            {createLoading || updateLoading || assignAdminLoading
              ? "Saving..."
              : mode === "edit"
                ? "Update Company"
                : "Create Company"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/super-admin/company-data")}
          >
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Layout>
  );
}
