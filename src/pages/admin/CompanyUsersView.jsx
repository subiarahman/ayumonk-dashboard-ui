import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Layout from "../../layouts/commonLayout/Layout";
import { fetchCompanies } from "../../store/companySlice";
import { clearUserDetailState, fetchUserById } from "../../store/userSlice";
import { getSurfaceBackground } from "../../theme";
import { formatDateTimeIST } from "../../utils/dateTime";

export default function CompanyUsersView() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedUser, detailLoading, detailError } = useSelector(
    (state) => state.user,
  );
  const { companies } = useSelector((state) => state.company);

  useEffect(() => {
    dispatch(fetchUserById(id));
    dispatch(fetchCompanies());

    return () => {
      dispatch(clearUserDetailState());
    };
  }, [dispatch, id]);

  const companyName = useMemo(
    () => companies.find((company) => company.id === selectedUser?.company_id)?.company_name,
    [companies, selectedUser?.company_id],
  );

  if (detailLoading) {
    return (
      <Layout role="admin" title="View User">
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
    <Layout role="admin" title="View User">
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
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate("/admin/company-users")}
            >
              Back to list
            </Button>
            <Button
              variant="contained"
              startIcon={<EditRoundedIcon />}
              onClick={() => navigate(`/admin/company-users/${id}/edit`)}
            >
              Edit
            </Button>
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
              ["Location", selectedUser.location],
              ["Gender", selectedUser.gender],
              ["Phone", selectedUser.phone],
              ["Email", selectedUser.email],
              ["Company", companyName || selectedUser.company_id],
              ["Status", selectedUser.is_active ? "Active" : "Inactive"],
              [
                "Created At",
                formatDateTimeIST(selectedUser.created_at),
              ],
              [
                "Updated At",
                formatDateTimeIST(selectedUser.updated_at),
              ],
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
    </Layout>
  );
}
