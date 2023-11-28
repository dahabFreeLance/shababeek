import React from 'react';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';
import { Typography } from '@mui/material';
import CategoriesBar from '../modules/common/components/categoriesBar';
import ProductItem from '../modules/common/components/productItem';

const Menu = () => {
  let { tableNumber } = useParams();

  return (
    <>
      <Typography sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: 30, marginBottom: 5 }}>
        Table #{tableNumber}
      </Typography>
      <CategoriesBar />

      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 1, sm: 8, md: 12 }}>
        {Array.from(Array(12)).map((_, index) => (
          <ProductItem />
        ))}
      </Grid>
    </>
  );
};

export default Menu;
