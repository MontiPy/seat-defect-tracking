import React from 'react';
import { AppBar, Toolbar, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Stack direction="row" spacing={2}>
          <Button color="inherit" onClick={() => navigate('/')}>Projects</Button>
          <Button color="inherit" onClick={() => navigate('/manage-projects')}>Manage Projects</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
