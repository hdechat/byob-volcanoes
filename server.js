require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('port', process.env.PORT || 3000);
app.set('secretKey', process.env.secretKey);

const checkAuth = (request, response, next) => {
  if (process.env.NODE_ENV === 'development') {
    const { token, email } = request.body;
    if (!token) {
      response.status(400)
        .send('You must include an authentication token to access this endpoint. To receive a token visit api/v1/auth');
    } else {
      jwt.verify(token, app.get('secretKey'), (err, decoded) => {
        if (err) {
          response.status(403).send('Invalid token');
        } else {
          const adminCheck = email.slice(email
            .search(/@/)).match(/@turing.io/);
          if (decoded.app === 'volcanoes' && adminCheck) {
            next();
          } else {
            response.status(401).send('You do not have administrative access');
          }
        }
      });
    }
  } else {
    next();
  }
};

app.get('/', (request, response) => {
  response.send('Success');
});

app.get('/api/v1/volcanoes', (request, response) => {
  const year = request.query.year;

  if (!year) {
    database('volcanoes').select()
      .then(volcanoes => {
        response.status(200).json({ volcanoes });
      })
      .catch(error => {
        response.status(500).json({ error });
      });
  } else {
    database('volcanoes').select()
      .then(volcanoes => {
        const filteredVolcanoes = volcanoes.filter(volcano => {
          return volcano.last_known_eruption.includes(year);
        });
        response.status(200).json({ filteredVolcanoes });
      })
      .catch(error => {
        response.status(500).json({ error });
      });
  }
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

app.post('/api/v1/auth', (request, response) => {
  const payload = request.body;

  if (!payload.email || !payload.app) {
    response.status(422).json({ error: "Both email and app name required" });
  }

  const secretKey = app.get('secretKey');
  const jwtToken = jwt.sign(payload, secretKey);
  response.status(201).json(jwtToken);
});

app.delete('/api/v1/volcanoes/:id', checkAuth, (request, response) => {
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

const deleteSensitiveInfo = (payload) => {
  delete payload['email'];
  delete payload['app'];
  delete payload['token'];
  return payload;
};

app.put('/api/v1/volcanoes/:id', checkAuth, (request, response) => {
  const update = deleteSensitiveInfo(request.body);
  const { id } = request.params;

  for (let props of Object.keys(update)) {
    if (!['name', 'country', 'last_known_eruption', 'geological_info_id']
      .includes(props)) {
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

app.post('/api/v1/volcanoes', checkAuth, (request, response) => {
  const volcano = deleteSensitiveInfo(request.body);

  if (!volcano.name || !volcano.country || !volcano.geological_info_id) {
    return response.status(422).send({
      error: 'Invalid entry. See README for valid POST body instructions'
    });
  }

  database('volcanoes').insert(volcano, 'id')
    .then(volcanoId => response.status(201).json({ id: volcanoId[0] }))
    .catch(error => response.status(500).json({ error }));
});

const verifyPostBody = (request, response, next) => {
  const geoInfo = request.body;
  const { rock_type, volcano_type, tectonic } = geoInfo;

  if (rock_type && volcano_type && tectonic) {
    next();
  } else {
    response.status(422).send('You must use a valid request body');
  }
};

app.post('/api/v1/geo-info', checkAuth, verifyPostBody, (request, response) => {
  const geoInfo = deleteSensitiveInfo(request.body);
  const { volcano_type, rock_type, tectonic } = geoInfo;

  database('geological_info').insert(geoInfo, 'id')
    .then(() => {
      response.status(201).json({volcano_type, rock_type, tectonic});
    })
    .catch(error => {
      response.status(500).json(error);
    });

});

const verifyKeys = (request, response, next) => {
  const geoInfo = request.body;
  const { id } = request.params;

  database('geological_info').where('id', id).select()
    .then(returnedInfo => {
      if (returnedInfo.length) {
        const hasKeys = Object.keys(geoInfo)
          .find(key => Object.keys(returnedInfo[0]).includes(key));
        if (hasKeys) {
          next();
        }
      } else {
        response.status(422).send('Please provide valid key/value to update');
      }
    });
};

app.patch('/api/v1/geo-info/:id', checkAuth, verifyKeys, (request, response) => {
  const geoInfo = deleteSensitiveInfo(request.body);
  const { id } = request.params;

  database('geological_info').where('id', id).select().update(geoInfo)
    .then(() => {
      database('geological_info').where('id', id).select()
        .then(updatedGeoInfo => {
          response.status(200).json(updatedGeoInfo);
        });
    })
    .catch(error => {
      response.status(500).json(error);
    });
});

const verifyDelete = (request, response, next) => {
  var { id } = request.params;

  database('geological_info').where('id', id)
    .then(deletedItem => {
      if (deletedItem.length) {
        next();
      } else {
        response.status(400).send(`Could not delete id ${id}, item not found.`);
      }
    });
};

app.delete('/api/v1/geo-info/:id', checkAuth, verifyDelete, (request, response) => {
  const { id } = request.params;
  let deletedVolcanoes = [];

  database.select('*').from('volcanoes').where('geological_info_id', id).del()
    .then(relatedVolcanoes => {
      deletedVolcanoes.push(relatedVolcanoes);
      database.select('*').from('geological_info').where('id', id).del()
        .then(deletedGeoInfo => response.status(200).json({
          deletedVolcanoes,
          deletedGeoInfo
        }));
    })
    .catch(error => response.status(500).json(error));
});

app.listen(app.get('port'), () => {
  // eslint-disable-next-line no-console
  console.log(`Sever is running on ${app.get('port')}.`);
});

app.use((request, response) => {
  response.status(404).send('PAGE NOT FOUND');
});

module.exports = app;
