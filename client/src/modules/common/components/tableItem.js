import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import table from '../assets/images/table.png';
import { Typography, Paper } from '@mui/material';

import { experimentalStyled as styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function TableItem({ index }) {
  return (
    <Grid xs={2} sm={4} md={4}>
      <Item>
        <a href={`/tables/${index + 1}`}>
          <Typography>{index + 1}</Typography>
          <img src={table} alt={'table'} loading='lazy' />
        </a>
      </Item>
    </Grid>
  );
}

export default TableItem;
