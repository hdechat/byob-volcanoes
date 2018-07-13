require('dotenv').config();
const chai = require('chai');
// eslint-disable-next-line no-unused-vars
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

const configuration = require('../knexfile')['test'];
const knex = require('knex')(configuration);
const token = process.env.token;

chai.use(chaiHttp);

describe('Client routes', () => {
  it('should return status 200', done => {
    chai.request(server)
      .get('/')
      .end((err, response) => {
        response.should.have.status(200);
        done();
      });
  });

  it('should return 404 with bad url', done => {
    chai.request(server)
      .get('/api/v1/badpath')
      .end((err, response) => {
        response.should.have.status(404);
      });
    done();
  });
});

describe('API Routes', () => {

  beforeEach((done) => {
    knex.migrate.rollback()
      .then(() => {
        knex.migrate.latest()
          .then(() => {
            return knex.seed.run()
              .then(() => {
                done();
              });
          });
      }).catch(error => {
        throw error;
      });
  });

  describe('GET /api/v1/volcanoes', () => {
    it('should return all the volcanoes', done => {
      chai.request(server)
        .get('/api/v1/volcanoes')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.volcanoes.should.be.a('array');
          response.body.volcanoes.length.should.equal(3);
          response.body.volcanoes[0].should.have.property('name');
          response.body.volcanoes[0].name.should.equal('Vesuvius');
          response.body.volcanoes[0].should.have.property('country');
          response.body.volcanoes[0].country.should.equal('Italy');
          response.body.volcanoes[0]
            .should.have.property('last_known_eruption');
          response.body.volcanoes[0]
            .last_known_eruption.should.equal('1944 CE');
          done();
        });
    });

    it('should return all the volcanoes that erupted in the year given as param', done => {
      chai.request(server)
      .get('/api/v1/volcanoes/')
      .query({ year: '4040'})
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('object');
        response.body.filteredVolcanoes[0].should.have.property('name');
        response.body.filteredVolcanoes[0].name.should.equal('Maar');
        response.body.filteredVolcanoes[0].should.have.property('country');
        response.body.filteredVolcanoes[0].country.should.equal('Germany');
        response.body.filteredVolcanoes[0].should.have.property('last_known_eruption');
        response.body.filteredVolcanoes[0].last_known_eruption.should.equal('4040 CE')
        response.body.filteredVolcanoes[0].should.have.property('geological_info_id');
        response.body.filteredVolcanoes[0].geological_info_id.should.equal(1)
        done();
      });
    });
  });

  describe('GET /api/v1/volcanoes/:name', () => {
    it('should return all the info for given volcano name', done => {
      chai.request(server)
        .get('/api/v1/volcanoes/Vesuvius')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('object');
          response.body.should.have.property('name');
          response.body.name.should.equal('Vesuvius');
          response.body.should.have.property('country');
          response.body.country.should.equal('Italy');
          response.body.should.have.property('geoInfo');
          response.body.geoInfo.should.be.a('object');
          done();
        });
    });

    it('should return status 404 if parameter doesn\'t exist', done => {
      chai.request(server)
        .get('/api/v1/volcanoes/Kaboom')
        .end((err, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });

  describe('PUT /api/v1/volcanoes/:id', () => {
    it('should return item(s) that were updated', done => {
      chai.request(server)
        .put('/api/v1/volcanoes/1')
        .send({
          'name': 'Agua',
          'country': 'Guatemala',
          'email':'papa@turing.io',
          'app': 'volcanoes',
          'token': token
        })
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('object');
          response.body.should.have.property('name');
          response.body.name.should.equal('Agua');
          response.body.should.have.property('country');
          response.body.country.should.equal('Guatemala');
          done();
        });
    });

    it('should return 404 when item to update does not exist', done => {
      chai.request(server)
        .put('/api/v1/volcanoes/7')
        .send({
          'name': 'Agua',
          'country': 'Guatemala',
          'email':'papa@turing.io',
          'app': 'volcanoes',
          'token': token
        })
        .end((err, response) => {
          response.should.have.status(404);
          response.res.text.should
            .equal('{"error":"Could not find project with id: 7"}');
          done();
        });
    });
  });

  describe('GET /api/v1/volcanoes/country/:country', () => {
    it('should return all the volcano names for the given country', done => {
      chai.request(server)
        .get('/api/v1/volcanoes/country/Italy')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body[0].should.have.property('name');
          response.body[0].name.should.equal('Vesuvius');
          done();
        });
    });

    it('should return 404 if country not found', done => {
      chai.request(server)
        .get('/api/v1/volcanoes/country/United States of America')
        .end((err, response) => {
          response.should.have.status(404);
          response.res.text.should.equal('No volcanoes listed '+
          'for that country');
          done();
        });
    });
  });

  describe('POST /api/v1/volcanoes', () => {
    it('should not create a new volcano if sent incorrect request', done => {
      chai.request(server)
        .post('/api/v1/volcanoes')
        .send({
          name: 'Kablamo',
          bicycles: 'Ork',
          email:'papa@turing.io',
          app: 'volcanoes',
          token: token
        })
        .end((err, response) => {
          response.should.have.status(422);
          response.body.should.be.a('object');
          response.body.should.have.property('error');
          done();
        });
    });

    it('should return new post item id', done => {
      chai.request(server)
        .post('/api/v1/volcanoes')
        .send({
          "name": "Agua",
          "country":"Guatemala",
          "geological_info_id": 1,
          "email":'papa@turing.io',
          "app": 'volcanoes',
          "token": token

        })
        .end((err, response) => {
          response.should.have.status(201);
          response.should.be.json;
          response.should.be.a('object');
          done();
        });
    });
  });

  describe('DELETE /api/v1/volcanoes/:id', () => {
    it('should return status 204', done => {
      chai.request(server)
        .delete('/api/v1/volcanoes/1')
        .send({
          "email":'papa@turing.io',
          "app": 'volcanoes',
          "token": token
        })
        .end((err, response) => {
          response.should.have.status(204);
          done();
        });
    });

    it('should return status 404 when item to delete is not found', done => {
      chai.request(server)
        .delete('/api/v1/volcanoes/8')
        .send({
          "email":'papa@turing.io',
          "app": 'volcanoes',
          "token": token
        })
        .end((err, response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.res.text.should
            .equal('{"error":"Could not find project with id: 8"}');
          done();
        });
    });

    
  });

  describe('GET /api/v1/geo-info', () => {
    it('should return all geological info', done => {
      chai.request(server)
        .get('/api/v1/geo-info')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.geoInfo.length.should.equal(1);
          response.body.geoInfo.should.be.a('array');
          response.body.geoInfo[0].should.have.property('volcano_type');
          response.body.geoInfo[0].volcano_type.should.equal('cone');
          response.body.geoInfo[0].should.have.property('rock_type');
          response.body.geoInfo[0].rock_type.should.equal('basalt');
          response.body.geoInfo[0].should.have.property('tectonic');
          response.body.geoInfo[0].tectonic.should.equal('rift zone');
          done();
        });
    });
  });

  describe('POST /api/v1/geo-info', () => {
    it('should return new post item id', done => {
      chai.request(server)
        .post('/api/v1/geo-info')
        .send({
          'volcano_type': 'Stratovolcano',
          'rock_type':'Adesite',
          'tectonic': 'Subduction zone',
          'email':'papa@turing.io',
          'app': 'volcanoes',
          'token': token
        })
        .end((err, response) => {
          response.should.have.status(201);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(1);
          done();
        });
    });

    it('should not post new geo-info with invalid request body', done => {
      chai.request(server)
        .post('/api/v1/geo-info')
        .send({
          'rock_type':'Adesite',
          'tectonic': 'Subduction zone',
          'email':'papa@turing.io',
          'app': 'volcanoes',
          'token': token
        })
        .end((err, response) => {
          response.should.have.status(422);
          response.res.text.should.equal('You must use a valid request body');
          done();
        });
    });
  });

  describe('PATCH /api/v1/geo-info/:id', () => {
    it('should return updated item', done => {
      chai.request(server)
        .patch('/api/v1/geo-info/1')
        .send({
          "rock_type": 'Andesite',
          "email":'papa@turing.io',
          "app": 'volcanoes',
          "token": token
        })
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body[0].should.have.property('volcano_type');
          response.body[0].volcano_type.should.equal('cone');
          response.body[0].should.have.property('rock_type');
          response.body[0].rock_type.should.equal('Andesite');
          response.body[0].should.have.property('tectonic');
          response.body[0].tectonic.should.equal('rift zone');
          done();
        });
    });

    it('should return 404 when id is not found', done => {
      chai.request(server)
        .patch('/api/v1/geo-info/9')
        .send({
          "rock_type": 'Andesite',
          "email":'papa@turing.io',
          "app": 'volcanoes',
          "token": token
        })
        .end((err, response) => {
          response.should.have.status(422);
          response.res.text.should.equal('Please provide valid ' +
          'key/value to update');
          done();
        });
    });
  });

  describe('DELETE /api/v1/geo-info/:id', () => {
    it('should return deleted item and all relational items', done => {
      chai.request(server)
        .delete('/api/v1/geo-info/1')
        .send({
          "email":'papa@turing.io',
          "app": 'volcanoes',
          "token": token
        })
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('object');
          response.body.should.have.property('deletedVolcanoes');
          response.body.should.have.property('deletedGeoInfo');
          response.body.deletedVolcanoes.should.deep.equal([3]);
          response.body.deletedGeoInfo.should.equal(1);
          done();
        });
    });

    it('should return status 400 when item to delete is not found', done => {
      chai.request(server)
        .delete('/api/v1/geo-info/6')
        .send({
          "email":'papa@turing.io',
          "app": 'volcanoes',
          "token": token
        })
        .end((err, response) => {
          response.should.have.status(400);
          response.res.text.should
            .equal(`{"error":"Could not delete id 6, item not found."}`);
          done();
        });
    });
  });
});
