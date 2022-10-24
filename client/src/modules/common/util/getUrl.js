const getUrl = (type) => {
  if (process.env.NODE_ENV === 'development') {
    switch (type) {
      case 'client':
        return process.env.REACT_APP_DEV_CLIENT_URL;

      case 'server':
        return process.env.REACT_APP_DEV_SERVER_URL;

      default:
        break;
    }
  }
  return process.env.REACT_APP_BASE_URL;
};

export default getUrl;
