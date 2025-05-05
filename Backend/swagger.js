const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sarthi API Documentation',
      version: '1.0.0',
      description: 'API documentation for Sarthi learning platform',
      contact: {
        name: 'API Support',
        url: 'https://sarthi.com/support',
        email: 'support@sarthi.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './routes/*.js',
    './routes/videoprocessingroutes/*.js',
    './models/*.js',
    './controllers/*.js'
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpec };