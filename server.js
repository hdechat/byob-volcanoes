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

app.get('/api/v1/volcanoes/country/:country', (request, response) => {
  const { country } = request.params;
  database('volcanoes').where('country', country).select('name')
    .then(names => {
      if (names.length) {
        response.status(200).json(names);
      } else {
        response.status(404).send('No volcanoes listed for that country');
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.delete('/api/v1/volcanoes/:id', (request, response) => {
  const { id } = request.params;

  database('volcanoes').where('id', id).select()
    .then(volcano => {
      if (!volcano.length) {
        response.status(404)
          .json({ error: `Could not find project with id: ${id}` });
      } else {
        database('volcanoes').where('id', id).delete()
          .then(() => response.sendStatus(204))
          .catch(error => response.status(500).json({ error }));
      }
    })
    .catch(error => response.status(500).json({ error }));
});

app.put('/api/v1/volcanoes/:id', (request, response) => {
  const { id } = request.params;
  const update = request.body;

  for (let props of Object.keys(update)) {
    if (!['name', 'country', 'last_known_eruption', 'geological_info_id'].includes(props)) {
      return response.status(422).send({
        error: 'Invalid key. See README for valid PUT body instructions'
      });
    }
  }

  database('volcanoes').where('id', id).update(update)
    .then(volcano => {
      if (volcano) {
        response.status(200).json(update);
      } else {
        response.status(404)
          .json({ error: `Could not find project with id: ${id}`});
      }
    })
    .catch(error => response.status(500).json({ error }));
});

app.post('/api/v1/volcanoes', (request, response) => {
  const volcano = request.body;

  if (!volcano.name || !volcano.country || !volcano.geological_info_id) {
    return response.status(422).send({
      error: 'Invalid entry. See README for valid POST body instructions'
    });
  }
  
  database('volcanoes').insert(volcano, 'id')
    .then(volcanoId => response.status(201).json({ id: volcanoId[0] }))
    .catch(error => response.status(500).json({ error }));
});

app.listen(app.get('port'), () => {
  // eslint-disable-next-line no-console
  console.log(`Sever is running on ${app.get('port')}.`);
});

app.use((request, response) => {
  response.status(404).send('PAGE NOT FOUND');
});

module.exports = app;
