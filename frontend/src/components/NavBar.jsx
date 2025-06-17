import React, { useRef, useEffect } from 'react';
import { AppBar, Toolbar, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  const toolbarRef = useRef(null);

  useEffect(() => {
    const setHeight = () => {
      if (toolbarRef.current) {
        const h = toolbarRef.current.offsetHeight;
        document.documentElement.style.setProperty('--navbar-height', `${h}px`);
      }
    };
    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  return (
    <AppBar position="static" color="default">
      <Toolbar ref={toolbarRef}>
        <Stack direction="row" spacing={2}>
          <Button color="inherit" onClick={() => navigate('/')}>Projects</Button>
          <Button color="inherit" onClick={() => navigate('/manage-projects')}>Manage Projects</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
