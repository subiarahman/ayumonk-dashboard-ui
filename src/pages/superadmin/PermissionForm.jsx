import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
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
  clearPermissionMasterCreateState,
  clearPermissionMasterDetailState,
  clearPermissionMasterUpdateState,
  createPermissionMaster,
  fetchPermissionMasterById,
  updatePermissionMaster,
} from "../../store/permissionMasterSlice";
import { getSurfaceBackground } from "../../theme";
import usePermissions from "../../hooks/usePermissions";

const defaultFormValues = {
  name: "",
  module: "",
  action: "",
  codename: "",
  resource: "",
};

const normalizeFormValues = (item) => ({
  name: item?.name || "",
  module: item?.module || "",
  action: item?.action || "",
  codename: item?.codename || "",
  resource: item?.resource || "",
});

const buildCodename = (module, action) => {
  const m = String(module || "").trim().toLowerCase();
  const a = String(action || "").trim().toLowerCase();
  if (!m && !a) return "";
  if (!m) return a;
  if (!a) return m;
  return `${m}:${a}`;
};

export default function PermissionForm({ mode = "add" }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    selectedPermission,
    detailLoading,
    detailError,
    createLoading,
    createError,
    updateLoading,
    updateError,
  } = useSelector((state) => state.permissionMaster);

  const isEdit = mode === "edit";
  const isSubmitting = createLoading || updateLoading;

  const [formValues, setFormValues] = useState(defaultFormValues);
  const [codenameTouched, setCodenameTouched] = useState(isEdit);
  const [formError, setFormError] = useState("");
  const [lastSyncedPermissionId, setLastSyncedPermissionId] = useState(null);
  const { canCreate, canEdit } = usePermissions();
  const canSubmitForm = isEdit ? canEdit("permissions") : canCreate("permissions");

  const pageTitle = useMemo(
    () => (isEdit ? "Edit Permission" : "Add Permission"),
    [isEdit],
  );

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchPermissionMasterById(id));
    }
    return () => {
      dispatch(clearPermissionMasterCreateState());
      dispatch(clearPermissionMasterUpdateState());
      dispatch(clearPermissionMasterDetailState());
    };
  }, [dispatch, id, isEdit]);

  if (
    isEdit &&
    selectedPermission &&
    String(selectedPermission.id) === String(id) &&
    lastSyncedPermissionId !== selectedPermission.id
  ) {
    setLastSyncedPermissionId(selectedPermission.id);
    setFormValues(normalizeFormValues(selectedPermission));
  }

  const handleChange = (field, value) => {
    setFormValues((current) => {
      const next = { ...current, [field]: value };
      if (!codenameTouched && (field === "module" || field === "action")) {
        next.codename = buildCodename(
          field === "module" ? value : current.module,
          field === "action" ? value : current.action,
        );
      }
      return next;
    });
    setFormError("");
  };

  const handleCodenameChange = (value) => {
    setCodenameTouched(true);
    setFormValues((current) => ({ ...current, codename: value }));
    setFormError("");
  };

  const validate = () => {
    if (!formValues.name.trim()) return "Name is required.";
    if (!formValues.module.trim()) return "Module is required.";
    if (!formValues.action.trim()) return "Action is required.";
    if (!formValues.codename.trim()) return "Codename is required.";
    if (!formValues.resource.trim()) return "Resource is required.";
    return "";
  };

  const handleSave = async () => {
    const nextError = validate();
    if (nextError) {
      setFormError(nextError);
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      module: formValues.module.trim(),
      action: formValues.action.trim(),
      codename: formValues.codename.trim(),
      resource: formValues.resource.trim(),
    };

    try {
      if (isEdit) {
        await dispatch(
          updatePermissionMaster({ permissionId: id, payload }),
        ).unwrap();
        navigate("/super-admin/permissions", {
          replace: true,
          state: {
            feedback: {
              severity: "success",
              message: "Permission updated successfully.",
            },
          },
        });
        return;
      }

      await dispatch(createPermissionMaster(payload)).unwrap();
      navigate("/super-admin/permissions", {
        replace: true,
        state: {
          feedback: {
            severity: "success",
            message: "Permission created successfully.",
          },
        },
      });
    } catch {
      // Redux state already stores the error.
    }
  };

  if (isEdit && detailLoading) {
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
          <Typography>Loading permission...</Typography>
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
              {isEdit
                ? "Update the permission record. The codename retains its existing value unless you edit it."
                : "Define a new permission record. The codename auto-fills from module and action; override it if your scheme differs."}
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/super-admin/permissions")}
          >
            Back to list
          </Button>
        </Stack>

        {(formError || detailError || createError || updateError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError || detailError || createError || updateError}
          </Alert>
        )}

        <Stack spacing={3}>
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
              label="Name"
              value={formValues.name}
              onChange={(event) => handleChange("name", event.target.value)}
              fullWidth
            />
            <TextField
              label="Codename"
              value={formValues.codename}
              onChange={(event) => handleCodenameChange(event.target.value)}
              fullWidth
              helperText={
                isEdit
                  ? "Edit to change the codename."
                  : "Auto-fills as module:action; edit to override."
              }
            />
            <TextField
              label="Module"
              value={formValues.module}
              onChange={(event) => handleChange("module", event.target.value)}
              fullWidth
            />
            <TextField
              label="Action"
              value={formValues.action}
              onChange={(event) => handleChange("action", event.target.value)}
              fullWidth
              helperText="e.g. read, create, update, delete"
            />
            <TextField
              label="Resource"
              value={formValues.resource}
              onChange={(event) => handleChange("resource", event.target.value)}
              fullWidth
              sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}
            />
          </Box>

          <Stack direction="row" spacing={1.5}>
            {canSubmitForm && (
              <Button
                variant="contained"
                startIcon={<SaveRoundedIcon />}
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : isEdit
                    ? "Save Changes"
                    : "Create Permission"}
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => navigate("/super-admin/permissions")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Layout>
  );
}
