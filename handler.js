'use strict';

const jsonToMesh = require('./build/src/mesh_json')

module.exports.viewspots = async (event) => {
  if (event.body) {
    const numberOfDesiredViewSpots = parseInt(event.queryStringParameters?.n);
    let statusCode, body
    try {
      const mesh = jsonToMesh.jsonStringToMesh(event.body);
      const viewSpots = mesh.computeBestNViewSpots(numberOfDesiredViewSpots);
      statusCode = 200;
      body = JSON.stringify(viewSpots);
    } catch(e) {
      statusCode = 400;
      body = `Something went wrong: ${e.message}`;
    }
    return {
      statusCode: statusCode,
      body: body,
    };
  } else {
    return { statusCode: 400 };
  }
};
