import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  InputAdornment,
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
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import Layout from "../../layouts/commonLayout/Layout";
import {
  clearCompanyCreateState,
  clearCompanyDetailState,
  clearCompanyUpdateState,
  createCompany,
  fetchCompanyById,
  updateCompany,
} from "../../store/companySlice";
import api, { getApiErrorMessage } from "../../services/api";
import { API_URLS } from "../../services/apiUrls";
import { getCompanyId, setCompanyId } from "../../utils/roleHelper";
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

export default function CompanyDataForm({ mode, role = "superadmin" }) {
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
  const [adminEnabled, setAdminEnabled] = useState(mode === "add" && role === "superadmin");
  const [formError, setFormError] = useState("");
  const [companyMe, setCompanyMe] = useState(null);
  const [companyMeError, setCompanyMeError] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const pageTitle = useMemo(
    () =>
      role === "admin"
        ? "Edit Company Details"
        : mode === "edit"
          ? "Edit Company"
          : "Add Company",
    [mode, role],
  );

  const resolvedCompanyId = useMemo(() => {
    if (role === "admin") {
      return id || getCompanyId() || "";
    }
    return id || "";
  }, [id, role]);

  useEffect(() => {
    let isMounted = true;

    if (role === "admin") {
      const fetchCompanyMe = async () => {
        try {
          const response = await api.get(API_URLS.companyMe);
          const payload = response?.data || {};
          if (!payload?.success || !payload?.data) {
            throw new Error(payload?.message || "Failed to fetch company details.");
          }

          if (isMounted) {
            setCompanyMe(payload.data);
            setCompanyMeError("");
            setCompanyId(payload.data?.id || payload.data?.company_id || "");
          }
        } catch (error) {
          if (isMounted) {
            setCompanyMe(null);
            setCompanyMeError(
              getApiErrorMessage(error, "Failed to fetch company details."),
            );
          }
        }
      };

      fetchCompanyMe();

      return () => {
        isMounted = false;
      };
    }

    if (mode === "edit" && id) {
      dispatch(fetchCompanyById(id));
    }

    return () => {
      dispatch(clearCompanyCreateState());
      dispatch(clearCompanyUpdateState());
      dispatch(clearCompanyDetailState());
    };
  }, [dispatch, id, mode, role]);

  const activeCompany = role === "admin" ? companyMe : selectedCompany;

  const resolvedCompanyForm = useMemo(() => {
    if (mode !== "edit") {
      return companyForm;
    }

    return {
      company_name: activeCompany?.company_name || "",
      industry: activeCompany?.industry || "",
      size_bucket: activeCompany?.size_bucket || "",
      email: activeCompany?.email || "",
      phone: activeCompany?.phone || "",
      no_of_employees: activeCompany?.no_of_employees ?? 0,
      is_active: Boolean(activeCompany?.is_active),
      ...companyForm,
    };
  }, [activeCompany, companyForm, mode]);

  const resolvedAdminEnabled =
    role === "admin" ? false : adminEnabled || Boolean(selectedCompany?.admin);

  const resolvedAdminForm = useMemo(() => {
    if (role === "admin") {
      return createAdminDefaults;
    }

    if (mode !== "edit") {
      return adminForm;
    }

    const resolveText = (currentValue, fallbackValue) =>
      typeof currentValue === "string" && currentValue.trim()
    ? currentValue
    : fallbackValue || "";
    
    return {
      username: resolveText(adminForm.username, selectedCompany?.admin?.username),
      email: resolveText(adminForm.email, selectedCompany?.admin?.email),
      password: resolveText(adminForm.password, selectedCompany?.admin?.password),
      emp_id: resolveText(adminForm.emp_id, selectedCompany?.admin?.emp_id),
      full_name: resolveText(adminForm.full_name, selectedCompany?.admin?.full_name),
      department: resolveText(adminForm.department, selectedCompany?.admin?.department),
      location: resolveText(adminForm.location, selectedCompany?.admin?.location),
      gender: resolveText(adminForm.gender, selectedCompany?.admin?.gender),
      phone: resolveText(adminForm.phone, selectedCompany?.admin?.phone),
      is_active:
        adminForm.is_active ??
        selectedCompany?.admin?.is_active ??
        createAdminDefaults.is_active,
    };
  }, [adminForm, mode, role, selectedCompany]);


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

    if (role === "admin" && !resolvedCompanyId) {
      return "Company details are unavailable. Please refresh and try again.";
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
      if (role === "admin") {
        await dispatch(
          updateCompany({
            companyId: resolvedCompanyId,
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

        navigate("/admin/dashboard", {
          replace: true,
          state: {
            feedback: {
              severity: "success",
              message: "Company details updated successfully.",
            },
          },
        });
        return;
      }

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

  const backPath = role === "admin" ? "/admin/dashboard" : "/super-admin/company-data";

  if (mode === "edit" && (detailLoading || (role === "admin" && !companyMe && !companyMeError))) {
    return (
      <Layout role={role} title={pageTitle}>
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
    <Layout role={role} title={pageTitle}>
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
                ? role === "admin"
                  ? "Update your company profile and activation state."
                  : "Update the company profile and activation state."
                : "Create a company. Admin details can be added later."}
            </Typography>
          </Box>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(backPath)}>
            Back to list
          </Button>
        </Stack>

        {(formError ||
          detailError ||
          createError ||
          updateError ||
          companyMeError ||
          assignAdminError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError ||
              detailError ||
              createError ||
              updateError ||
              companyMeError ||
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
                {["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"].map((option) => (
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

            {mode === "edit" && role === "superadmin" && (
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

          {role === "superadmin" && (
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
                    type={showAdminPassword ? "text" : "password"}
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showAdminPassword ? "Hide password" : "Show password"
                            }
                            onClick={() => setShowAdminPassword((current) => !current)}
                            edge="end"
                          >
                            {showAdminPassword ? (
                              <VisibilityOffRoundedIcon />
                            ) : (
                              <VisibilityRoundedIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
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
                <Alert severity="info">Creating company without admin</Alert>
              )}
            </Box>
          )}
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
              : role === "admin"
                ? "Update Company"
                : mode === "edit"
                  ? "Update Company"
                  : "Create Company"}
          </Button>
          <Button variant="outlined" onClick={() => navigate(backPath)}>
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Layout>
  );
}
