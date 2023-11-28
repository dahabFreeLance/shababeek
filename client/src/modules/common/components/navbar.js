import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import { ListItemText, ListItemIcon, ListItemButton, IconButton, Divider, Toolbar, List } from '@mui/material';
import { Settings, BarChart, ShoppingCart, People, ChevronLeft, TableRestaurant } from '@mui/icons-material';

function Navbar({ toggleDrawer, open }) {
  const mainListItems = (
    <React.Fragment>
      <ListItemButton href={'/'}>
        <ListItemIcon>
          <TableRestaurant />
        </ListItemIcon>
        <ListItemText primary='Tables' />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <ShoppingCart />
        </ListItemIcon>
        <ListItemText primary='Orders' />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <People />
        </ListItemIcon>
        <ListItemText primary='Customers' />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <BarChart />
        </ListItemIcon>
        <ListItemText primary='Reports' />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <Settings />
        </ListItemIcon>
        <ListItemText primary='Settings' />
      </ListItemButton>
    </React.Fragment>
  );

  const drawerWidth = 240;

  const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }));
  return (
    <Drawer variant='permanent' open={open}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: [1],
        }}>
        <IconButton onClick={toggleDrawer}>
          <ChevronLeft />
        </IconButton>
      </Toolbar>
      <Divider />
      <List component='nav'>{mainListItems}</List>
    </Drawer>
  );
}

export default Navbar;
