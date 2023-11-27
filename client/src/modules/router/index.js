import { createBrowserRouter } from 'react-router-dom';
import { Home } from '../../pages';

export const Router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
]);
