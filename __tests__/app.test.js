require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('posts todos', async() => {

      const expectation = [
        {
          'id': 4,
          'todo': 'thing',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 5,
          'todo': 'thing2',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 6,
          'todo': 'thing3',
          'completed': false,
          'owner_id': 2
        }
      ];

      for(let task of expectation) {
        await fakeRequest(app)
          .post('/api/todos')
          .send(task)
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200);
      }

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('gets todos for specific user', async() => {

      const expectation = [
        {
          'id': 4,
          'todo': 'thing',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 5,
          'todo': 'thing2',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 6,
          'todo': 'thing3',
          'completed': false,
          'owner_id': 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
