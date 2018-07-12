const chai = require('chai');
// eslint-disable-next-line no-unused-vars
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

const configuration = require('../knexfile')['test'];
const knex = require('knex')(configuration);

chai.use(chaiHttp);

describe('Client routes', () => {
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

  before((done) => {
    knex.migrate.latest()
      .then(() => done())
      .catch(error => {
        throw error;
      })
      .done();

  });

  beforeEach((done) => {
    knex.seed.run()
      .then(() => done())
      .catch(error => {
        throw error;
      })
      .done();
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
  });

  describe('POST /api/v1/volcanoes', () => {
    it('should not create a new volcano if not given all the required information', done => {
      chai.request(server)
        .post('/api/v1/volcanoes')
        .send({
          name: 'Kablamo',
          country: 'Ork',
        })
        .end((err, response) => {
          response.should.have.status(422);
          response.body.should.be.a('object');
          response.body.should.have.property('error');
          done();
        });
    });
  });
});
