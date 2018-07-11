const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

const configuration = require('../knexfile')['test']
const knex = require('knex')(configuration)

chai.use(chaiHttp);

describe('API Routes', () => {

  before(() => knex.migrate.latest())
  beforeEach(() => knex.seed.run())

  describe('GET /api/v1/volcanoes', () => {
      it('should return all the volcanoes', done => {
        chai.request(server)
          .get('/api/v1/volcanoes')
          .end((err, response) => {
            response.should.have.status(200)
            response.should.be.json
            response.body.volcanoes.should.be.a('array')
            response.body.volcanoes.length.should.equal(3)
            response.body.volcanoes[0].should.have.property('name')
            response.body.volcanoes[0].name.should.equal('Vesuvius')
            response.body.volcanoes[0].should.have.property('country')
            response.body.volcanoes[0].country.should.equal('Italy')
            response.body.volcanoes[0].should.have.property('last_known_eruption')
            response.body.volcanoes[0].last_known_eruption.should.equal('1944 CE')
            done();
      });
    })
  });

  describe('GET /api/v1/geo-info', () => {
    it('should return all geological info', done => {
      chai.request(server)
        .get('/api/v1/geo-info')
        .end((err, response) => {
          response.should.have.status(200)
          response.should.be.json
          response.body.geoInfo.length.should.equal(1)
          response.body.geoInfo.should.be.a('array')
          reponse.body.geoInfo[0].should.have.property('volcano_type')
          reponse.body.geoInfo[0].volcano_type.should.equal('cone')
          reponse.body.geoInfo[0].should.have.property('rock_type')
          reponse.body.geoInfo[0].rock_type.should.equal('basalt')
          reponse.body.geoInfo[0].should.have.property('tectonic')
          reponse.body.geoInfo[0].tectonic.should.equal('rift zone')
        });
        done();
    })
  });
});
