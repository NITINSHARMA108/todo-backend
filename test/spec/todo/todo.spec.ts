// tslint:disable-next-line: no-var-requires
require('module-alias/register');

import chai from 'chai';
// tslint:disable-next-line: import-name
import spies from 'chai-spies';
chai.use(spies);
import chaiHttp from 'chai-http';
import { Application } from 'express';
import { respositoryContext, testAppContext } from '../../mocks/app-context';

import { AuthHelper } from '../../../src/helpers';
import { App } from '../../../src/server';
import { Todo } from '../../../src/models';

import { delay } from 'lodash';

chai.use(chaiHttp);
const expect = chai.expect;
let expressApp: Application;

before(async () => {
  await respositoryContext.store.connect();
  const app = new App(testAppContext);
  app.initializeMiddlewares();
  app.initializeControllers();
  app.initializeErrorHandling();
  expressApp = app.expressApp;
});


// test case for creating a todo item

describe('POST /todos', () => {
  it('it should create a new todo item', async () => {
    const res = await chai
      .request(expressApp)
      .post('/todos')
      .send({
        title: 'first todo creation',
      });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('title');
    expect(res.body).to.have.property('id');
  });

  it('if incoming request data is empty object', async () => {
    const res = await chai
		.request(expressApp)
		.post('/todos')
		.send({});
    expect(res).to.have.status(400);
  });
  it('if incoming request title field is empty', async () => {
    const res = await chai
		.request(expressApp)
		.post('/todos')
		.send({
      title: ''
    });
    expect(res).to.have.status(400);
  });
});


// test case for deleting a todo item

describe('DELETE /todos/:id', () => {
  it('todo is present in "todos" collection', async () => {
    const title = 'creating a test todo item';
    const todoItem = await testAppContext.todoRepository.save(new Todo({ title,}));

    const res = await chai.request(expressApp)
    .delete(`/todos/${todoItem._id}`);

    expect(res).to.have.status(204);
  })

  it('todo is not present in "todos" collection', async () => {
    const id = '0000000000000000000000';
    const res = await chai.request(expressApp)
    .delete(`/todos/${id}`);

   
    expect(res).to.have.status(400);
  })
})
// test case for get single todo

describe('GET /todos/:id', () => {
  it('todo is present in "todos" collection', async () => {
    const title = 'creating a test todo item';
    const todoItem = await testAppContext.todoRepository.save(new Todo({ title,}));

    const res = await chai.request(expressApp)
    .get(`/todos/${todoItem._id}`);
    
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('title');
  })

  it('todo is not present in "todos" collection', async () => {
    const id = '0000000000000000000000';
    const res = await chai.request(expressApp)
    .get(`/todos/${id}`);

    expect(res).to.have.status(400);
  })
})


// test case for fetching all todo items

describe('GET /todos', () => {
  it('requesting all todo items from "todos" collection', async () => {
    const res = await chai.request(expressApp)
    .get(`/todos`);
    expect(res).to.have.status(200);  
  }) 
})


// test for todo updation
describe('PUT /todos/:id', () => {
  it('it should create a new todo item and then update it ', async () => {
    const todo = await testAppContext.todoRepository.save(new Todo({
      title: 'first step: todo creation',
    }))
    const res = await chai
      .request(expressApp)
      .put(`/todos/${todo._id}`)
      .send({
        title: 'second step: todo updation',
      });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('title');
    expect(res.body).to.have.property('id');
  });

  it('if request body is an empty object ', async () => {
    const todo = await testAppContext.todoRepository.save(new Todo({
      title: 'first step: todo creation',
    }))
    const res = await chai
      .request(expressApp)
      .put(`/todos/${todo._id}`)
      .send({
      });

    expect(res).to.have.status(400);
  });

  it('ithe title property in req object is empty string ', async () => {
    const todo = await testAppContext.todoRepository.save(new Todo({
      title: 'first step: todo creation',
    }))
    const res = await chai
      .request(expressApp)
      .put(`/todos/${todo._id}`)
      .send({
        title: '',
      });

    expect(res).to.have.status(400);
  });

  it('if requested todo item is not present in database', async () => {
    const res = await chai
		.request(expressApp)
		.put('/todos/update')
		.send({
      title: 'item not present in database'
    });
    expect(res).to.have.status(400);
  });
});

