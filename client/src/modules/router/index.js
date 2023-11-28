import { createBrowserRouter } from 'react-router-dom';
import { Tables, Menu } from '../../pages';

export const Router = createBrowserRouter([
  {
    path: '/',
    element: <Tables />,
  },
  {
    path: '/tables/:tableNumber',
    element: <Menu />,
  },
]);
