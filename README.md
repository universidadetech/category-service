# Category Menu Service

Este microserviço é responsável por buscar as categorias de um Magento 2.4 usando sua API GraphQL e expor essas categorias através de um endpoint REST. O objetivo principal é fornecer um menu de categorias que pode ser utilizado em um frontend.

## Funcionalidades

- Consulta a API GraphQL do Magento para obter a lista de categorias.
- Filtra as categorias para incluir apenas aquelas configuradas para aparecer no menu.
- Ignora a categoria "Default Category" e retorna apenas suas subcategorias.
- Expõe as categorias através de um endpoint REST.

## Estrutura do Projeto

```
/category-menu-service
|-- /src
|   |-- /controllers
|   |   |-- categoryController.js
|   |-- /services
|   |   |-- magentoService.js
|   |-- /routes
|   |   |-- categoryRoutes.js
|   |-- app.js
|-- /config
|   |-- default.json
|-- package.json
|-- README.md
```

## Instalação

1. Clone este repositório:
    ```bash
    git clone https://github.com/seu-usuario/category-menu-service.git
    cd category-menu-service
    ```

2. Instale as dependências:
    ```bash
    npm install
    ```

3. Configure o arquivo `config/default.json` com a URL do GraphQL do seu Magento:
    ```json
    {
      "magento": {
        "graphqlUrl": "https://seu-magento/graphql"
      }
    }
    ```

4. Inicie o servidor:
    ```bash
    npm start
    ```

## Endpoints

### GET /api/categories

Retorna a lista de categorias incluídas no menu, excluindo a "Default Category" e retornando apenas suas subcategorias.

**Exemplo de Requisição:**

```bash
curl http://localhost:3000/api/categories
```

**Exemplo de Resposta:**

```json
[
  {
    "id": 38,
    "name": "What's New",
    "url_key": "what-is-new",
    "include_in_menu": 1,
    "children": []
  },
  {
    "id": 20,
    "name": "Women",
    "url_key": "women",
    "include_in_menu": 1,
    "children": []
  },
  {
    "id": 11,
    "name": "Men",
    "url_key": "men",
    "include_in_menu": 1,
    "children": []
  },
  {
    "id": 3,
    "name": "Gear",
    "url_key": "gear",
    "include_in_menu": 1,
    "children": []
  },
  {
    "id": 9,
    "name": "Training",
    "url_key": "training",
    "include_in_menu": 1,
    "children": []
  },
  {
    "id": 37,
    "name": "Sale",
    "url_key": "sale",
    "include_in_menu": 1,
    "children": []
  }
]
```

## Detalhes de Implementação

### magentoService.js

Este serviço faz a requisição à API GraphQL do Magento para obter todas as categorias, incluindo suas subcategorias e o campo `include_in_menu`.

```javascript
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
```

### categoryController.js

Este controlador filtra as categorias obtidas do Magento para incluir apenas aquelas configuradas para aparecer no menu e ignora a "Default Category", retornando apenas suas subcategorias.

```javascript
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
```

### categoryRoutes.js

Define a rota para acessar as categorias.

```javascript
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getCategories);

module.exports = router;
```

### app.js

Configura o servidor Express, incluindo o middleware CORS, e define a rota para acessar as categorias.

```javascript
const express = require('express');
const cors = require('cors');
const categoryRoutes = require('./routes/categoryRoutes');
const app = express();
const port = process.env.PORT || 3000;

// Configurar o middleware cors
app.use(cors());

app.use('/api/categories', categoryRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

## Frontend de Exemplo

Aqui está um exemplo de página HTML que consome o endpoint `/api/categories` e exibe o menu de categorias:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Category Menu</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body class="bg-gray-100">

    <!-- Header -->
    <header class="bg-blue-500 text-white p-4 flex items-center justify-between">
        <div class="flex items-center">
            <i class="fas fa-store h-8 mr-4"></i>
            <nav id="category-menu" class="flex space-x-4">
                <!-- Categories will be injected here -->
            </nav>
        </div>
        <div>
            <i class="fas fa-shopping-cart h-8"></i>
        </div>
    </header>

    <!-- Main Content -->
    <main class="p-4">
        <h1 class="text-2xl font-bold mb-4">Bem-vindo à nossa loja</h1>
        <p>Use o menu acima para navegar pelas categorias.</p>
    </main>

    <!-- JavaScript to fetch categories -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            fetch('http://localhost:3000/api/categories')
                .then(response => response.json())
                .then(data => {
                    const menu = document.getElementById('category-menu');
                    data.forEach(category => {
                        const menuItem = document.createElement('div');
                        menuItem.className = 'relative group';

                        const link = document.createElement('a');
                        link.href = `/${category.url_key}`;
                        link.className = 'hover:underline';
                        link.textContent = category.name;
                        menuItem.appendChild(link);

                        if (category.children.length > 0) {
                            const subMenu = document.createElement('div');
                            subMenu.className = 'absolute left-0 mt-2 hidden group-hover:block bg-blue-600 text-white p-2 rounded';
                            
                            category.children.forEach(subCategory => {
                                const subLink = document.createElement('a');
                                subLink.href = `/${subCategory.url_key}`;
                                subLink.className = 'block hover:underline';
                                subLink.textContent = subCategory.name;
                                subMenu.appendChild(subLink);
                            });

                            menuItem.appendChild(subMenu);
                        }

                        menu.appendChild(menuItem);
                    });
                })
                .catch(error => console.error('Error fetching categories:', error));
        });
    </script>
</body>
</html>
```

Com essas alterações, o servidor Node.js aceitará requisições de qualquer origem, resolvendo o problema de CORS. Certifique-se de reiniciar o servidor Node.js após fazer as alterações para que elas tenham efeito.

