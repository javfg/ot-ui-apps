import { useEffect, useMemo, useReducer } from "react";
import { Box, Typography, Alert, Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Link, OtInvalidResultFilters } from "ui";
import { getConfig } from "@ot/config";
import { v1 } from "uuid";
import { Fragment } from "react/jsx-runtime";
import DownloadsCard from "./DownloadsCard";
import DownloadsFilter from "./DownloadsFilter";
import DownloadsLoading from "./DownloadsLoading";
import { createInitialState, downloadsReducer, initialState } from "./context/downloadsReducer";
import { setDownloadsData } from "./context/downloadsActions";
import { DownloadsContext } from "./context/DownloadsContext";
import DownloadsTags from "./DownloadsTags";
import { Route, Routes } from "react-router-dom";
import DownloadsDialog from "./DownloadsDialog";

const config = getConfig();

const useStyles = makeStyles(theme => ({
  alert: {
    marginBottom: theme.spacing(2),
  },
}));

function DownloadsPage() {
  const [state, dispatch] = useReducer(downloadsReducer, initialState, createInitialState);

  useEffect(() => {
    let isCurrent = true;
    fetch(config.downloadsURL)
      .then(res => res.json())
      .then(data => {
        if (isCurrent) dispatch(setDownloadsData(data));
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const classes = useStyles();

  if (state.loading) return <DownloadsLoading />;

  return (
    <DownloadsContext.Provider value={{ state, dispatch }}>
      <>
        <Typography variant="h4" component="h1" paragraph>
          {state.downloadsData?.name}
        </Typography>
        <Typography paragraph>{state.downloadsData?.description}</Typography>

        {config.profile.isPartnerPreview ? (
          <Alert severity="info" className={classes.alert}>
            This table provides data file paths that have been integrated into the Open Targets
            Partner Preview Platform. This includes pre-publication data generated by the consortium
            combined with{" "}
            <Link
              external
              to="https://ftp.ebi.ac.uk/pub/databases/opentargets/platform/latest/output/"
            >
              {" "}
              publicly available datasets
            </Link>
            . Please contact{" "}
            <Link to={`mailto: ${config.profile.helpdeskEmail}`} external>
              {config.profile.helpdeskEmail}
            </Link>{" "}
            to access the following datasets.
          </Alert>
        ) : null}

        <DownloadsTags />

        <Grid container sx={{ display: "flex", justifyContent: "space-between" }}>
          <Grid item xs={12} md={3} lg={2} sx={{ display: "flex", justifyContent: "center" }}>
            <DownloadsFilter />
          </Grid>
          <Grid
            item
            xs={12}
            md={9}
            lg={10}
            sx={{ display: "flex", flexDirection: "column", gap: 1, pl: { md: 2 } }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              All Datasets ({state.count})
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 2,
              }}
            >
              {state.count > 0 ? (
                <>
                  {state.filteredRows.map(e => (
                    <DownloadsCard key={v1()} data={e} />
                  ))}
                </>
              ) : (
                <OtInvalidResultFilters />
              )}
            </Box>
          </Grid>
        </Grid>
      </>
      <Routes>
        <Route path="/:downloadsRow/:downloadsView" element={<DownloadsDialog />} />
      </Routes>
    </DownloadsContext.Provider>
  );
}

export default DownloadsPage;
