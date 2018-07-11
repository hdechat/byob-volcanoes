const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.set('port', process.env.PORT || 3000);

app.get('/api/v1/volcanoes', (request, response) => {
  database('volcanoes').select()
    .then(volcanoes => {
      response.status(200).json({ volcanoes });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/geo-info', (request, response) => {
  database('geological_info').select()
    .then(geoInfo => {
      response.status(200).json({ geoInfo });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/volcanoes/:name', (request, response) => {
  const { name } = request.params;
  database('volcanoes').where('name', name).select()
    .then(volcano => {
      if (volcano.length) {
        const { geological_info_id } = volcano[0];
        database('geological_info').where('id', geological_info_id).select()
          .then(geoInfo => {
            const volcanoInfo = Object
              .assign(volcano[0], {geoInfo: geoInfo[0]});
            response.status(200).json(volcanoInfo);
          });
      } else {
        response.status(404).send('Volcano does not exist');
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.listen(app.get('port'), () => {
  console.log(`Sever is running on ${app.get('port')}.`);
});

app.use((request, response, next) => {
  response.status(404).send('PAGE NOT FOUND');
});

module.exports = app;