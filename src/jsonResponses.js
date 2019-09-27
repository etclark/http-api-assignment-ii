const query = require('querystring');
// Store users purely in memory
const users = {};
// respond with JSON
const respond = (request, response, status, object, type) => {
  response.writeHead(status, { 'Content-Type': type });
  response.write(JSON.stringify(object));
  response.end();
};

const respondMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// Checks the accepted type and then responds accordingly
const checkType = (request, response, responseJSON, status, acceptedTypes) => {
  // Return XML
  if (acceptedTypes[0] === 'text/xml') {
    let responseXML = '<reponse>';
    responseXML += `<message>${responseJSON.message}</message><br>`;
    if (responseJSON.id) {
      responseXML += `<id>${responseJSON.id}</id>`;
    }
    responseXML += '</response>';

    return respond(request, response, status, responseXML, 'text/xml');
  }
  // Return JSON
  return respond(request, response, status, responseJSON, 'application/json');
};

// Add User
const addUser = (request, response, acceptedTypes) => {
  const body = [];

  request.on('error', (err) => {
    console.log(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    const responseJSON = {
      message: 'Name and age are both required',
    };

    if (!bodyParams.name || !bodyParams.age) {
      responseJSON.id = 'badRequest';
      return respond(request, response, 400, responseJSON, 'application/json');
    }

    let responseCode = 201;

    if (users[bodyParams.name]) {
      responseCode = 204;
    } else {
      users[bodyParams.name] = {};
    }

    users[bodyParams.name].name = bodyParams.name;
    users[bodyParams.name].age = bodyParams.age;

    if (responseCode === 201) {
      responseJSON.message = 'Created Successfully';
      responseJSON.id = 'create';
      return checkType(request, response, responseJSON, responseCode, acceptedTypes);
    }
    return respondMeta(request, response, responseCode);
  });
};

// Get Users
const getUsers = (request, response, acceptedTypes) => {
  const responseJSON = {
    users,
  };
  checkType(request, response, responseJSON, 200, acceptedTypes);
};

const getUsersMeta = (request, response) => respondMeta(request, response, 200);

// Not Real
const notReal = (request, response, acceptedTypes) => {
  const responseJSON = {
    message: 'The page you are looking for was not real',
    id: 'not real',
  };
  checkType(request, response, responseJSON, 404, acceptedTypes);
};

const notRealMeta = (request, response) => respondMeta(request, response, 404);

// Not Found
const notFound = (request, response, acceptedTypes) => {
  const responseJSON = {
    message: 'The page you are looking for was not found',
    id: 'not found',
  };
  checkType(request, response, responseJSON, 404, acceptedTypes);
};

const notFoundMeta = (request, response) => respondMeta(request, response, 404);

module.exports = {
  addUser,
  getUsers,
  getUsersMeta,
  notReal,
  notRealMeta,
  notFound,
  notFoundMeta,
};
