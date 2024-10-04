const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Blog API',
            version: '1.0.0',
            description: 'API documentation for the Blog API',
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Local server',
            },
        ],
    },
    apis: ['./routes/register.js', './routes/login.js', './routes/profile.js', './routes/post.js', './routes/delete.js', './routes/logout.js'], 
};

const swaggerDocs = swaggerJsDoc(options);

module.exports = {
    swaggerUi,
    swaggerDocs,
};

