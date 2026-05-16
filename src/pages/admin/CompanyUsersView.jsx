import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Layout from "../../layouts/commonLayout/Layout";
import { fetchCompanies } from "../../store/companySlice";
import { clearUserDetailState, fetchUserById } from "../../store/userSlice";
import { fetchPermissionsMaster } from "../../store/permissionMasterSlice";
import { fetchMenus } from "../../store/menuMasterSlice";
import {
  clearRoleMenusList,
  clearRolePermissionsList,
  fetchRoleMenus,
  fetchRolePermissions,
} from "../../store/roleAssignmentSlice";
import {
  clearUserOverridesFeedback,
  saveUserMenuOverrides,
  saveUserPermissionOverrides,
} from "../../store/userOverridesSlice";
import usePermissions from "../../hooks/usePermissions";
import { getSurfaceBackground } from "../../theme";
import { formatDateTimeIST } from "../../utils/dateTime";
import { getCompanyId } from "../../utils/roleHelper";

const accessLevelOptions = ["view", "full"];

function PermissionOverridesPanel({ userId, tenantId, roleId }) {
  const dispatch = useDispatch();
  const { items: permissionsMaster, listLoading: permissionsLoading } =
    useSelector((state) => state.permissionMaster);
  const {
    rolePermissions,
    rolePermissionsLoading,
    rolePermissionsError,
    rolePermissionsRoleId,
  } = useSelector((state) => state.roleAssignment);
  const { saving, error, message } = useSelector(
    (state) => state.userOverrides,
  );

  const [overrides, setOverrides] = useState([]);

  useEffect(() => {
    dispatch(fetchPermissionsMaster());
  }, [dispatch]);

  useEffect(() => {
    if (roleId && tenantId) {
      dispatch(fetchRolePermissions({ roleId, tenantId }));
    } else {
      dispatch(clearRolePermissionsList());
    }
  }, [dispatch, roleId, tenantId]);

  const inheritedPermissions = useMemo(() => {
    if (!roleId || rolePermissionsRoleId !== String(roleId)) return [];
    return rolePermissions.filter((entry) => entry.is_granted !== false);
  }, [roleId, rolePermissions, rolePermissionsRoleId]);

  const overrideIds = useMemo(
    () => new Set(overrides.map((entry) => String(entry.permission_id))),
    [overrides],
  );

  const availableOptions = useMemo(
    () =>
      permissionsMaster.filter(
        (permission) => !overrideIds.has(String(permission.id)),
      ),
    [overrideIds, permissionsMaster],
  );

  const handlePick = (option) => {
    if (!option) return;
    if (overrideIds.has(String(option.id))) return;
    setOverrides((current) => [
      ...current,
      {
        permission_id: option.id,
        codename: option.codename,
        name: option.name,
        is_granted: true,
      },
    ]);
  };

  const handleToggleGrant = (permissionId, value) => {
    setOverrides((current) =>
      current.map((entry) =>
        String(entry.permission_id) === String(permissionId)
          ? { ...entry, is_granted: value === "grant" }
          : entry,
      ),
    );
  };

  const handleRemove = (permissionId) => {
    setOverrides((current) =>
      current.filter(
        (entry) => String(entry.permission_id) !== String(permissionId),
      ),
    );
  };

  const handleSave = async () => {
    try {
      await dispatch(
        saveUserPermissionOverrides({
          userId,
          tenantId,
          items: overrides,
        }),
      ).unwrap();
      setOverrides([]);
    } catch {
      // error tracked in slice
    }
  };

  const canSubmit = overrides.length > 0 && tenantId && !saving.permissions;
  const inheritedLoading =
    rolePermissionsLoading || rolePermissionsRoleId !== String(roleId);

  return (
    <Stack spacing={3}>
      {message && (
        <Alert
          severity="success"
          onClose={() => dispatch(clearUserOverridesFeedback())}
        >
          {message}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          onClose={() => dispatch(clearUserOverridesFeedback())}
        >
          {error}
        </Alert>
      )}

      <Box>
        <Typography sx={{ fontWeight: 700, mb: 0.75 }}>
          Inherited from role
        </Typography>
        {!roleId ? (
          <Typography variant="body2" color="text.secondary">
            User has no role assigned.
          </Typography>
        ) : rolePermissionsError ? (
          <Alert severity="error">{rolePermissionsError}</Alert>
        ) : inheritedLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading inherited permissions...
          </Typography>
        ) : inheritedPermissions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            The role grants no permissions.
          </Typography>
        ) : (
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
            {inheritedPermissions.map((entry) => (
              <Chip
                key={entry.id}
                size="small"
                label={entry.codename || entry.name || `#${entry.id}`}
                variant="outlined"
              />
            ))}
          </Stack>
        )}
      </Box>

      <Divider />

      <Stack spacing={2}>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>Add user-level override</Typography>
          <Typography variant="body2" color="text.secondary">
            Overrides take precedence over the role&apos;s grants. Use Deny to
            explicitly revoke a permission inherited from the role.
          </Typography>
        </Box>

        <Autocomplete
          options={availableOptions}
          loading={permissionsLoading}
          value={null}
          onChange={(_, value) => handlePick(value)}
          getOptionLabel={(option) =>
            option?.codename
              ? `${option.name || option.codename} (${option.codename})`
              : option?.name || `#${option?.id}`
          }
          isOptionEqualToValue={(option, value) =>
            String(option?.id) === String(value?.id)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Add permission"
              placeholder="Search permissions to override"
            />
          )}
        />

        <Paper
          variant="outlined"
          sx={{ borderRadius: 2.5, p: overrides.length ? 0 : 2 }}
        >
          {overrides.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Pick permissions above to build the override set.
            </Typography>
          ) : (
            <Stack divider={<Divider />}>
              {overrides.map((entry) => (
                <Stack
                  key={entry.permission_id}
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  spacing={1.5}
                  sx={{ p: 1.5 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {entry.name || entry.codename || `#${entry.permission_id}`}
                    </Typography>
                    {entry.codename && entry.codename !== entry.name && (
                      <Typography variant="caption" color="text.secondary">
                        {entry.codename}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      size="small"
                      select
                      value={entry.is_granted ? "grant" : "deny"}
                      onChange={(event) =>
                        handleToggleGrant(entry.permission_id, event.target.value)
                      }
                      sx={{ minWidth: 140 }}
                    >
                      <MenuItem value="grant">Grant</MenuItem>
                      <MenuItem value="deny">Deny</MenuItem>
                    </TextField>
                    <Tooltip title="Remove from set">
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(entry.permission_id)}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Paper>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            onClick={handleSave}
            disabled={!canSubmit}
          >
            {saving.permissions ? "Saving..." : "Save overrides"}
          </Button>
          {overrides.length > 0 && (
            <Button variant="text" onClick={() => setOverrides([])}>
              Clear
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

function MenuOverridesPanel({ userId, tenantId, roleId }) {
  const dispatch = useDispatch();
  const { items: menusMaster, listLoading: menusLoading } = useSelector(
    (state) => state.menuMaster,
  );
  const {
    roleMenus,
    roleMenusLoading,
    roleMenusError,
    roleMenusRoleId,
  } = useSelector((state) => state.roleAssignment);
  const { saving, error, message } = useSelector(
    (state) => state.userOverrides,
  );

  const [overrides, setOverrides] = useState([]);

  useEffect(() => {
    dispatch(fetchMenus());
  }, [dispatch]);

  useEffect(() => {
    if (roleId && tenantId) {
      dispatch(fetchRoleMenus({ roleId, tenantId }));
    } else {
      dispatch(clearRoleMenusList());
    }
  }, [dispatch, roleId, tenantId]);

  const inheritedMenus = useMemo(() => {
    if (!roleId || roleMenusRoleId !== String(roleId)) return [];
    return roleMenus;
  }, [roleId, roleMenus, roleMenusRoleId]);

  const overrideIds = useMemo(
    () => new Set(overrides.map((entry) => String(entry.menu_id))),
    [overrides],
  );

  const availableOptions = useMemo(
    () =>
      menusMaster.filter((menu) => !overrideIds.has(String(menu.id))),
    [menusMaster, overrideIds],
  );

  const handlePick = (option) => {
    if (!option) return;
    if (overrideIds.has(String(option.id))) return;
    setOverrides((current) => [
      ...current,
      {
        menu_id: option.id,
        name: option.name || option.slug,
        slug: option.slug,
        access_level: "view",
      },
    ]);
  };

  const handleAccessChange = (menuId, value) => {
    setOverrides((current) =>
      current.map((entry) =>
        String(entry.menu_id) === String(menuId)
          ? { ...entry, access_level: value }
          : entry,
      ),
    );
  };

  const handleRemove = (menuId) => {
    setOverrides((current) =>
      current.filter((entry) => String(entry.menu_id) !== String(menuId)),
    );
  };

  const handleSave = async () => {
    try {
      await dispatch(
        saveUserMenuOverrides({
          userId,
          tenantId,
          items: overrides,
        }),
      ).unwrap();
      setOverrides([]);
    } catch {
      // error tracked in slice
    }
  };

  const canSubmit = overrides.length > 0 && tenantId && !saving.menus;
  const inheritedLoading =
    roleMenusLoading || roleMenusRoleId !== String(roleId);

  return (
    <Stack spacing={3}>
      {message && (
        <Alert
          severity="success"
          onClose={() => dispatch(clearUserOverridesFeedback())}
        >
          {message}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          onClose={() => dispatch(clearUserOverridesFeedback())}
        >
          {error}
        </Alert>
      )}

      <Box>
        <Typography sx={{ fontWeight: 700, mb: 0.75 }}>
          Inherited from role
        </Typography>
        {!roleId ? (
          <Typography variant="body2" color="text.secondary">
            User has no role assigned.
          </Typography>
        ) : roleMenusError ? (
          <Alert severity="error">{roleMenusError}</Alert>
        ) : inheritedLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading inherited menus...
          </Typography>
        ) : inheritedMenus.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            The role grants no menus.
          </Typography>
        ) : (
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
            {inheritedMenus.map((menu) => (
              <Chip
                key={menu.id}
                size="small"
                label={
                  menu.access_level
                    ? `${menu.name || menu.slug || `#${menu.id}`} · ${menu.access_level}`
                    : menu.name || menu.slug || `#${menu.id}`
                }
                variant="outlined"
              />
            ))}
          </Stack>
        )}
      </Box>

      <Divider />

      <Stack spacing={2}>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>Add user-level override</Typography>
          <Typography variant="body2" color="text.secondary">
            Overrides take precedence over the role&apos;s menu grants.
          </Typography>
        </Box>

        <Autocomplete
          options={availableOptions}
          loading={menusLoading}
          value={null}
          onChange={(_, value) => handlePick(value)}
          getOptionLabel={(option) =>
            option?.slug
              ? `${option.name || option.slug} (${option.slug})`
              : option?.name || `#${option?.id}`
          }
          isOptionEqualToValue={(option, value) =>
            String(option?.id) === String(value?.id)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Add menu"
              placeholder="Search menus to override"
            />
          )}
        />

        <Paper
          variant="outlined"
          sx={{ borderRadius: 2.5, p: overrides.length ? 0 : 2 }}
        >
          {overrides.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Pick menus above to build the override set.
            </Typography>
          ) : (
            <Stack divider={<Divider />}>
              {overrides.map((entry) => (
                <Stack
                  key={entry.menu_id}
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  spacing={1.5}
                  sx={{ p: 1.5 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {entry.name || entry.slug || `#${entry.menu_id}`}
                    </Typography>
                    {entry.slug && entry.slug !== entry.name && (
                      <Typography variant="caption" color="text.secondary">
                        {entry.slug}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      size="small"
                      select
                      value={entry.access_level}
                      onChange={(event) =>
                        handleAccessChange(entry.menu_id, event.target.value)
                      }
                      sx={{ minWidth: 120 }}
                    >
                      {accessLevelOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Tooltip title="Remove from set">
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(entry.menu_id)}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Paper>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            onClick={handleSave}
            disabled={!canSubmit}
          >
            {saving.menus ? "Saving..." : "Save overrides"}
          </Button>
          {overrides.length > 0 && (
            <Button variant="text" onClick={() => setOverrides([])}>
              Clear
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

export default function CompanyUsersView({ role = "admin" }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedUser, detailLoading, detailError } = useSelector(
    (state) => state.user,
  );
  const { companies } = useSelector((state) => state.company);
  const { canEdit } = usePermissions();
  const canEditCompanyUsers = canEdit("company-users");
  const [overrideTab, setOverrideTab] = useState(0);

  useEffect(() => {
    dispatch(fetchUserById(id));
    dispatch(fetchCompanies());

    return () => {
      dispatch(clearUserDetailState());
      dispatch(clearUserOverridesFeedback());
    };
  }, [dispatch, id]);

  const companyName = useMemo(
    () => {
      const resolved = companies.find((company) => company.id === selectedUser?.company_id)?.company_name;
      if (resolved) return resolved;
      if (role === "admin") return companies.find((company) => company.id === getCompanyId())?.company_name || "";
      return selectedUser?.company_id || "";
    },
    [companies, role, selectedUser?.company_id],
  );

  const backPath = role === "admin" ? "/admin/company-users" : "/super-admin/company-users";

  const tenantIdForOverrides = selectedUser?.company_id || "";
  const roleIdForOverrides = selectedUser?.role_id || "";
  const showOverrides =
    canEditCompanyUsers && Boolean(selectedUser?.id) && Boolean(tenantIdForOverrides);

  if (detailLoading) {
    return (
      <Layout role={role} title="View User">
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
    <Layout role={role} title="View User">
      <Stack spacing={2.5}>
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
                User Details
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                Review the complete employee record before making changes.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(backPath)}>
                Back to list
              </Button>
              {canEditCompanyUsers && (
                <Button
                  variant="contained"
                  startIcon={<EditRoundedIcon />}
                  onClick={() =>
                    navigate(
                      role === "admin"
                        ? `/admin/company-users/${id}/edit`
                        : `/super-admin/company-users/${id}/edit`,
                    )
                  }
                >
                  Edit
                </Button>
              )}
            </Stack>
          </Stack>

          {detailError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {detailError}
            </Alert>
          )}

          {selectedUser ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 2,
              }}
            >
              {[
                ["Employee ID", selectedUser.emp_id],
                ["Full Name", selectedUser.full_name],
                ["Department", selectedUser.department],
                ["Gender", selectedUser.gender],
                ["Phone", selectedUser.phone],
                ["Email", selectedUser.email],
                ["Company", companyName || selectedUser.company_id],
                ["Role", selectedUser.role_name || (selectedUser.role_id ? `#${selectedUser.role_id}` : "")],
                ["Status", selectedUser.is_active ? "Active" : "Inactive"],
                ["Created At", formatDateTimeIST(selectedUser.created_at)],
                ["Updated At", formatDateTimeIST(selectedUser.updated_at)],
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
        </Paper>

        {showOverrides && (
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
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Per-user overrides
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Grant or deny permissions and menus for this user only. User
                overrides take precedence over the role&apos;s grants
                (resolution order: user override &gt; role override &gt; role).
              </Typography>
            </Stack>

            <Tabs
              value={overrideTab}
              onChange={(_, value) => setOverrideTab(value)}
              sx={{
                mb: 2.5,
                "& .MuiTab-root": { fontWeight: 700, textTransform: "none" },
                "& .MuiTabs-indicator": { height: 3, borderRadius: 3 },
              }}
            >
              <Tab label="Permissions" />
              <Tab label="Menus" />
            </Tabs>

            {overrideTab === 0 ? (
              <PermissionOverridesPanel
                key={`perms-${id}`}
                userId={id}
                tenantId={tenantIdForOverrides}
                roleId={roleIdForOverrides}
              />
            ) : (
              <MenuOverridesPanel
                key={`menus-${id}`}
                userId={id}
                tenantId={tenantIdForOverrides}
                roleId={roleIdForOverrides}
              />
            )}
          </Paper>
        )}
      </Stack>
    </Layout>
  );
}
