import React, { useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, Tabs, tabsClasses, Tab } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

function CategoriesBar() {
  const [value, setValue] = useState(0);
  const [, setSearchParams] = useSearchParams();

  const handleChange = (event, newValue) => {
    setSearchParams({ category: newValue + 1 });

    setValue(newValue);
  };

  const categories = [
    { name: 'Pizza', id: 1 },
    { name: 'Pasta', id: 2 },
    { name: 'Hot drinks', id: 3 },
    { name: 'Cold drinks', id: 4 },
    { name: 'Dessert', id: 5 },
  ];

  return (
    <Grid item xs={12} md={4} lg={3} mb={5}>
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: 'background.paper',
        }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant='scrollable'
          scrollButtons
          aria-label='visible arrows tabs example'
          sx={{
            [`& .${tabsClasses.scrollButtons}`]: {
              '&.Mui-disabled': { opacity: 0.3 },
            },
          }}>
          {categories.map((category) => (
            <Tab key={category.id} label={category.name} />
          ))}
        </Tabs>
      </Box>
    </Grid>
  );
}
export default CategoriesBar;
