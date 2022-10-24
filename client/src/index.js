import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

import App from './App';
import { getUrl } from './modules/common/util';

if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = getUrl('server');
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
