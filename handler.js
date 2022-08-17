'use strict';

const jsonToMesh = require('./build/src/mesh_json')

module.exports.hello = async (event) => {
  if (event.body) {
    const numberOfDesiredViewSpots = parseInt(event.queryStringParameters?.n)
    const mesh = jsonToMesh.jsonStringToMesh(event.body);
    const viewSpots = mesh.computeBestNViewSpots(numberOfDesiredViewSpots)
    return {
      statusCode: 200,
      body: JSON.stringify(viewSpots),
    };
  } else {
    return { statusCode: 400 }
  }
};
