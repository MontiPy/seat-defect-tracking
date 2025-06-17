import React, { useRef, useEffect } from 'react';
import { AppBar, Toolbar, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  const toolbarRef = useRef(null);

  useEffect(() => {
    const node = toolbarRef.current;
    if (!node) return;
    const update = () => {
      const h = node.offsetHeight;
      document.documentElement.style.setProperty('--navbar-height', `${h}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
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
