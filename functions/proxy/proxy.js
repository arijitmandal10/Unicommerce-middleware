const axios = require('axios');

exports.handler = async (event) => {
  try {
    const { skus, updatedSinceInMinutes } = JSON.parse(event.body);
    const accessToken = event.headers.authorization?.replace('Bearer ', '');
    const facilityCode = event.headers.facility;

    if (!accessToken || !facilityCode) {
      return {
        statusCode: 400,
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
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.response?.data?.message || error.message
      })
    };
  }
};