import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { experimentalStyled as styled } from '@mui/material/styles';
import { Typography, Paper, Button } from '@mui/material';
import dish from '../assets/images/dish.png';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function ProductItem() {
  return (
    <Grid xs={2} sm={4} md={4}>
      <Item>
        <img src={dish} alt={'table'} loading='lazy' />
        <Typography>Spagetty</Typography>
        <Typography fontWeight={'bold'}>120 LE</Typography>
        <Button variant='contained' sx={{ mt: 1 }}>
          Add
        </Button>
      </Item>
    </Grid>
  );
}

export default ProductItem;
