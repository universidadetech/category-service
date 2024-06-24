const axios = require('axios');
const config = require('config');
const https = require('https');

const fetchCategories = async () => {
  const endpoint = config.get('magento.graphqlUrl');

  const query = `
    {
      categoryList {
        id
        name
        url_key
        include_in_menu
        children {
          id
          name
          url_key
          include_in_menu
        }
      }
    }
  `;

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  try {
    console.log('Fetching categories from:', endpoint);
    
    const response = await axios.post(
      endpoint,
      { query },
      { httpsAgent: agent, headers: { 'Content-Type': 'application/json' } }
    );

    console.log('Response from Magento:', response.data);
    return response.data.data.categoryList;
  } catch (error) {
    console.error('Error details:', error.response ? error.response.data : error.message);
    throw new Error('Error fetching categories from Magento');
  }
};

module.exports = {
  fetchCategories
};
