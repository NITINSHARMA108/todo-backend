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

describe('DELETE /todos/:id', () => {
  it('todo is present in "todos" collection', async () => {
    const title = 'creating a test todo item';
    const todoItem = await testAppContext.todoRepository.save(new Todo({ title,}));
    console.log(todoItem);
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