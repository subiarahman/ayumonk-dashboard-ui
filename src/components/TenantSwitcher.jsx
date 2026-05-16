import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  Tooltip,
} from "@mui/material";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import { fetchCompanies } from "../store/companySlice";
import { setActiveTenantId } from "../store/tenantContextSlice";
import useTenantContext from "../hooks/useTenantContext";

// Spec §7: only platform admins can switch tenants. The selected
// company UUID is attached as `?company_id=<UUID>` on cross-tenant
// CRUD calls (handled per-page via `useTenantContext().companyIdForRequest`).
export default function TenantSwitcher() {
  const dispatch = useDispatch();
  const { canSwitchTenant, activeTenantId } = useTenantContext();
  const { companies, companiesLoading } = useSelector((state) => state.company);

  useEffect(() => {
    if (!canSwitchTenant) return;
    if (!companies || companies.length === 0) {
      dispatch(fetchCompanies());
    }
  }, [canSwitchTenant, companies, dispatch]);

  const selectedCompany = useMemo(
    () =>
      companies.find((company) => String(company.id) === String(activeTenantId)) ||
      null,
    [activeTenantId, companies],
  );

  if (!canSwitchTenant) return null;

  return (
    <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", minWidth: 260 }}>
      <Autocomplete
        size="small"
        fullWidth
        options={companies}
        loading={companiesLoading}
        value={selectedCompany}
        onChange={(_, value) => dispatch(setActiveTenantId(value?.id || ""))}
        getOptionLabel={(option) => option?.company_name || ""}
        isOptionEqualToValue={(option, value) =>
          String(option?.id) === String(value?.id)
        }
        clearOnBlur
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Active company"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <Tooltip title="Active tenant for cross-tenant requests">
                  <BusinessRoundedIcon
                    fontSize="small"
                    sx={{ ml: 0.5, mr: 0.5, color: "text.secondary" }}
                  />
                </Tooltip>
              ),
              endAdornment: (
                <>
                  {companiesLoading ? (
                    <CircularProgress size={16} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        sx={{ minWidth: 260 }}
      />
    </Box>
  );
}
