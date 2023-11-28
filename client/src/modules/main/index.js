import * as React from 'react';
import { RouterProvider } from 'react-router-dom';
import {
  Link,
  CssBaseline,
  Box,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { Navbar, Order, TopBar } from '../common/components';
import { Router } from '../router';

function Copyright(props) {
  return (
    <Typography variant='body2' color='text.secondary' align='center' {...props}>
      {'Copyright © '}
      <Link color='inherit' href='https://ilampagency.com/'>
        iLamp
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function Dashboard() {
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <TopBar toggleDrawer={() => toggleDrawer()} open={open} />
        <Navbar toggleDrawer={() => toggleDrawer()} open={open} />

        <Box
          component='main'
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}>
          <Toolbar />
          <Container maxWidth='lg' sx={{ mt: 4, mb: 4, backgroundColor: '#fff' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8} lg={9}>
                <Paper
                  sx={{
                    p: 2,
                  }}>
                  <RouterProvider router={Router} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4} lg={3}>
                <Order />
              </Grid>
            </Grid>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
