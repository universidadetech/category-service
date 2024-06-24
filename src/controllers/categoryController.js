const magentoService = require('../services/magentoService');

const filterCategories = (categories) => {
  return categories.filter(category => {
    category.children = filterCategories(category.children || []);
    return category.include_in_menu === 1;
  });
};

exports.getCategories = async (req, res) => {
  try {
    const allCategories = await magentoService.fetchCategories();
    const filteredCategories = filterCategories(allCategories);
    
    // Ignorar a "Default Category" e retornar apenas os children
    const categories = filteredCategories.length > 0 ? filteredCategories[0].children : [];
    
    res.json(categories);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
