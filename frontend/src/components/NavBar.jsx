import React, { useEffect } from 'react';
import { AppBar, Toolbar, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  const NAVBAR_HEIGHT = 24;

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--navbar-height',
      `${NAVBAR_HEIGHT}px`
    );
  }, []);

  return (
    <AppBar position="static" color="default">
      <Toolbar sx={{ minHeight: NAVBAR_HEIGHT }}>
        <Stack direction="row" spacing={2}>
          <Button color="inherit" onClick={() => navigate('/')}>Projects</Button>
          <Button color="inherit" onClick={() => navigate('/manage-projects')}>Manage Projects</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
