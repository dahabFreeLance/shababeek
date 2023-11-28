import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import TableItem from '../modules/common/components/tableItem';

const Tables = () => {
  return (
    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
      {Array.from(Array(12)).map((_, index) => (
        <TableItem index={index} key={index} />
      ))}
    </Grid>
  );
};

export default Tables;
