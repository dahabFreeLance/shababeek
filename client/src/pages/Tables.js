import React from 'react';
import { experimentalStyled as styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import table from '../modules/common/assets/images/table.png';
import { Typography } from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const Tables = () => {
  return (
    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
      {Array.from(Array(12)).map((_, index) => (
        <Grid xs={2} sm={4} md={4} key={index}>
          <Item>
            <a href={`/tables/${index + 1}`}>
              <Typography>{index + 1}</Typography>
              <img src={table} alt={'table'} loading='lazy' />
            </a>
          </Item>
        </Grid>
      ))}
    </Grid>
  );
};

export default Tables;
