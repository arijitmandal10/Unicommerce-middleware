const axios = require('axios');

exports.handler = async (event) => {
  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://suta.in',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Facility',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  try {
    const { skus, updatedSinceInMinutes } = JSON.parse(event.body);
    const accessToken = event.headers.authorization?.replace('Bearer ', '');
    const facilityCode = event.headers.facility;

    if (!accessToken || !facilityCode) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': 'https://suta.in'
        },
        body: JSON.stringify({ error: 'Missing required headers' })
      };
    }

    const response = await axios.post(
      'https://suta.unicommerce.com/services/rest/v1/inventory/inventorySnapshot/get',
      {
        itemTypeSKUs: Array.isArray(skus) ? skus : [skus],
        ...(updatedSinceInMinutes && { updatedSinceInMinutes })
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Facility': facilityCode,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://suta.in',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://suta.in'
      },
      body: JSON.stringify({
        error: error.response?.data?.message || error.message
      })
    };
  }
};