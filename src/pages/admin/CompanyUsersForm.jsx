import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Layout from "../../layouts/commonLayout/Layout";
import {
  clearUserCreateState,
  clearUserDetailState,
  clearUserUpdateState,
  createUser,
  fetchUserById,
  updateUser,
} from "../../store/userSlice";
import { fetchCompanies } from "../../store/companySlice";
import {
  clearRoleListState,
  fetchRolesByTenant,
} from "../../store/roleSlice";
import {
  fetchDepartments,
  resetDepartments,
} from "../../store/departmentSlice";
import api, { getApiErrorMessage } from "../../services/api";
import { API_URLS } from "../../services/apiUrls";
import { getCompanyId, setCompanyId } from "../../utils/roleHelper";
import { getSurfaceBackground } from "../../theme";
import usePermissions from "../../hooks/usePermissions";

const emptyForm = {
  emp_id: "",
  full_name: "",
  department: "",
  gender: "",
  age_band: "",
  phone: "",
  email: "",
  company_id: "",
  role_id: "",
};

export default function CompanyUsersForm({ mode, role = "admin" }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    selectedUser,
    detailLoading,
    detailError,
    createLoading,
    createError,
    updateLoading,
    updateError,
  } = useSelector((state) => state.user);
  const { companies } = useSelector((state) => state.company);
  const {
    items: roleItems,
    listLoading: rolesLoading,
    listError: rolesError,
  } = useSelector((state) => state.role);
  const {
    items: departmentItems,
    listLoading: departmentsLoading,
    listError: departmentsError,
  } = useSelector((state) => state.department);
  const [form, setForm] = useState(mode === "edit" ? {} : emptyForm);
  const [formError, setFormError] = useState("");
  const [companyMe, setCompanyMe] = useState(null);
  const [companyMeError, setCompanyMeError] = useState("");
  const { canCreate, canEdit } = usePermissions();
  const canSubmitForm = mode === "edit" ? canEdit("company-users") : canCreate("company-users");

  const pageTitle = useMemo(
    () => (mode === "edit" ? "Edit User" : "Add User"),
    [mode],
  );
  const companyId = getCompanyId();

  useEffect(() => {
    dispatch(fetchCompanies());

    if (role === "admin") {
      const fetchCompanyMe = async () => {
        try {
          const response = await api.get(API_URLS.companyMe);
          const payload = response?.data || {};
          if (!payload?.success || !payload?.data) {
            throw new Error(payload?.message || "Failed to fetch company details.");
          }

          setCompanyMe(payload.data);
          setCompanyMeError("");
          setCompanyId(payload.data?.id || payload.data?.company_id || "");
        } catch (error) {
          setCompanyMe(null);
          setCompanyMeError(getApiErrorMessage(error, "Failed to fetch company details."));
        }
      };

      fetchCompanyMe();
    }

    if (mode === "edit" && id) {
      dispatch(fetchUserById(id));
    }

    return () => {
      dispatch(clearUserCreateState());
      dispatch(clearUserUpdateState());
      dispatch(clearUserDetailState());
      dispatch(clearRoleListState());
      dispatch(resetDepartments());
    };
  }, [dispatch, id, mode, role]);

  const selectedCompanyId = useMemo(() => {
    if (role === "admin") {
      return companyMe?.id || companyMe?.company_id || companyId || "";
    }
    return form.company_id || selectedUser?.company_id || "";
  }, [companyId, companyMe, form.company_id, role, selectedUser?.company_id]);

  const resolvedForm = useMemo(() => {
    const base =
      mode === "edit"
        ? {
            emp_id: selectedUser?.emp_id || "",
            full_name: selectedUser?.full_name || "",
            department: selectedUser?.department || "",
            gender: selectedUser?.gender || "",
            age_band: selectedUser?.age_band || "",
            phone: selectedUser?.phone || "",
            email: selectedUser?.email || "",
            company_id: selectedUser?.company_id || "",
            role_id:
              selectedUser?.role_id != null
                ? String(selectedUser.role_id)
                : "",
          }
        : emptyForm;

    // Only surface a role_id when the matching role is loaded into the
    // dropdown options; otherwise Select would render an empty value
    // because no <MenuItem> matches yet.
    const draftRoleId =
      form.role_id !== undefined && form.role_id !== null
        ? form.role_id
        : base.role_id;
    const resolvedRoleId =
      draftRoleId &&
      roleItems.some((item) => String(item.id) === String(draftRoleId))
        ? String(draftRoleId)
        : "";

    return {
      ...base,
      ...form,
      company_id: role === "admin" ? selectedCompanyId : form.company_id || base.company_id,
      role_id: resolvedRoleId,
    };
  }, [form, mode, role, roleItems, selectedCompanyId, selectedUser]);

  useEffect(() => {
    if (resolvedForm.company_id) {
      dispatch(fetchRolesByTenant(resolvedForm.company_id));
      dispatch(fetchDepartments(resolvedForm.company_id));
    }
  }, [dispatch, resolvedForm.company_id]);

  const validate = () => {
    if (
      !resolvedForm.emp_id.trim() ||
      !resolvedForm.full_name.trim() ||
      !resolvedForm.department.trim() ||
      !resolvedForm.gender.trim() ||
      !resolvedForm.phone.trim() ||
      !resolvedForm.email.trim()
    ) {
      return "Complete all required user fields.";
    }

    if (!resolvedForm.company_id) {
      return "Select a company for this user.";
    }

    if (!resolvedForm.role_id) {
      return "Select a role for this user.";
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

    const departmentName = resolvedForm.department.trim();
    const selectedDepartment = departmentItems.find(
      (item) => item.name === departmentName,
    );

    const payload = {
      emp_id: resolvedForm.emp_id.trim(),
      full_name: resolvedForm.full_name.trim(),
      department: departmentName,
      ...(selectedDepartment ? { department_id: selectedDepartment.id } : {}),
      gender: resolvedForm.gender.trim(),
      age_band: resolvedForm.age_band,
      phone: resolvedForm.phone.trim(),
      email: resolvedForm.email.trim(),
      company_id: resolvedForm.company_id,
      role_id: Number(resolvedForm.role_id),
    };

    try {
      if (mode === "edit") {
        await dispatch(updateUser({ userId: id, user: payload })).unwrap();
      } else {
        await dispatch(createUser(payload)).unwrap();
      }

      navigate(role === "admin" ? "/admin/company-users" : "/super-admin/company-users", {
        replace: true,
        state: {
          feedback: {
            severity: "success",
            message: `User ${mode === "edit" ? "updated" : "created"} successfully.`,
          },
        },
      });
    } catch {
      // Redux state already stores the error.
    }
  };

  if (mode === "edit" && detailLoading) {
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
          <Typography>Loading user...</Typography>
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
                ? "Update the employee details below."
                : "Create a new company user record."}
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() =>
              navigate(role === "admin" ? "/admin/company-users" : "/super-admin/company-users")
            }
          >
            Back to list
          </Button>
        </Stack>

        {(formError || companyMeError || detailError || createError || updateError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError || companyMeError || detailError || createError || updateError}
          </Alert>
        )}

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
          {role === "superadmin" ? (
            <TextField
              label="Company"
              value={resolvedForm.company_id}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  company_id: event.target.value,
                  role_id: "",
                }))
              }
              select
              fullWidth
            >
              <MenuItem value="">Select Company</MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.company_name}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              label="Company"
              value={companyMe?.company_name || ""}
              fullWidth
              disabled
            />
          )}
          <TextField
            label="Employee ID"
            value={resolvedForm.emp_id}
            onChange={(event) =>
              setForm((current) => ({ ...current, emp_id: event.target.value }))
            }
            fullWidth
          />
          <TextField
            label="Full Name"
            value={resolvedForm.full_name}
            onChange={(event) =>
              setForm((current) => ({ ...current, full_name: event.target.value }))
            }
            fullWidth
          />
          <TextField
            label="Department"
            value={resolvedForm.department}
            onChange={(event) =>
              setForm((current) => ({ ...current, department: event.target.value }))
            }
            select
            fullWidth
            disabled={!resolvedForm.company_id || departmentsLoading}
            error={Boolean(departmentsError)}
            helperText={
              !resolvedForm.company_id
                ? "Select a company first"
                : departmentsLoading
                  ? "Loading departments..."
                  : departmentsError
                    ? departmentsError
                    : departmentItems.length === 0
                      ? "No departments available for this company"
                      : ""
            }
          >
            <MenuItem value="">Select Department</MenuItem>
            {departmentItems.map((department) => (
              <MenuItem key={department.id} value={department.name}>
                {department.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Gender"
            value={resolvedForm.gender}
            onChange={(event) =>
              setForm((current) => ({ ...current, gender: event.target.value }))
            }
            select
            fullWidth
          >
            <MenuItem value="">Select Gender</MenuItem>
            {["male", "female", "other"].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Age Band"
            value={resolvedForm.age_band}
            onChange={(event) =>
              setForm((current) => ({ ...current, age_band: event.target.value }))
            }
            select
            fullWidth
          >
            <MenuItem value="">Select Age Band</MenuItem>
            {["20-25", "26-30", "31-35", "36-40", "41-50", "50+"].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Phone"
            value={resolvedForm.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
            fullWidth
          />
          <TextField
            label="Email"
            value={resolvedForm.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            fullWidth
          />
          <TextField
            label="Role"
            value={resolvedForm.role_id || ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, role_id: event.target.value }))
            }
            select
            fullWidth
            disabled={!resolvedForm.company_id || rolesLoading}
            error={Boolean(rolesError)}
            helperText={
              !resolvedForm.company_id
                ? "Select a company first"
                : rolesLoading
                  ? "Loading roles..."
                  : rolesError
                    ? rolesError
                    : roleItems.length === 0
                      ? "No roles available for this company"
                      : ""
            }
          >
            <MenuItem value="">Select Role</MenuItem>
            {roleItems.map((roleOption) => (
              <MenuItem key={roleOption.id} value={roleOption.id}>
                {roleOption.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Stack direction="row" spacing={1.25} sx={{ mt: 3 }}>
          {canSubmitForm && (
            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              onClick={handleSave}
              disabled={createLoading || updateLoading}
            >
              {createLoading || updateLoading
                ? "Saving..."
                : mode === "edit"
                  ? "Update User"
                  : "Create User"}
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() =>
              navigate(role === "admin" ? "/admin/company-users" : "/super-admin/company-users")
            }
          >
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Layout>
  );
}
