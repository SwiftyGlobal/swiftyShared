const getHeaders = (vars) => {
  let { method } = vars;
  method = method.toLowerCase();
  let methods = '';
  const credentials = true;
  const origin = '*';
  const headers = '*';
  switch (method) {
    case 'post':
      methods = 'OPTIONS,POST';
      break;
    case 'get':
      methods = 'OPTIONS,GET';
      break;
    case 'delete':
      methods = 'OPTIONS,DELETE';
      break;
    case 'put':
      methods = 'OPTIONS,PUT';
      break;
    case 'all':
    default:
      methods = 'OPTIONS,GET,POST,PUT,DELETE';
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': headers,
    'Access-Control-Allow-Credentials': credentials,
    'Access-Control-Allow-Methods': methods,
  };
};

export { getHeaders };
