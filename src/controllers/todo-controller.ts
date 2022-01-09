import lodash, { create } from 'lodash';
import { BaseController } from './base-controller';
import { Request, Response, NextFunction, Router } from 'express';
import { Validation } from '@helpers'; // perform validation check from express-validator
import {
  AppContext,
  Errors,
  ExtendedRequest,
  ValidationFailure,
} from '@typings';
import { createTodoValidator, updateTodoValidator } from '@validators'; 
import { Todo } from '@models';

export class TodoController extends BaseController {
  public basePath: string = '/todos';
  public router: Router = Router();

  constructor(ctx: AppContext) {
    super(ctx);
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.basePath}`,
      createTodoValidator(this.appContext),
      this.createTodo,
    );
    this.router.delete(
      `${this.basePath}/:id`,
      this.deleteTodo,
    );
    this.router.get(
      `${this.basePath}/:id`,
      this.getTodo
    );
    this.router.get(
      `${this.basePath}`,
      this.allTodo
    );
    this.router.put(
      `${this.basePath}/:id`,
      updateTodoValidator(this.appContext),
      this.updateTodo
    )
  }
  // function handles creation of a todo 
  private createTodo = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

    const failures: ValidationFailure[] = Validation.extractValidationErrors(
      req,
    );
    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.INSUFFUCIENT_REQUEST'),
        failures,
      );
      return next(valError);
    }
    const { title } = req.body;

    const todo = await this.appContext.todoRepository.save(
      new Todo({
        title,
      }),
    );
    res.status(201).json(todo.serialize());
  }

  // // function handles deletion of a todo 
  private deleteTodo = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try{
      const failures: ValidationFailure[] = Validation.extractValidationErrors(
        req,
      );
      if (failures.length > 0) {
        const valError = new Errors.ValidationError(
          res.__('DEFAULT_ERRORS.INSUFFUCIENT_REQUEST'),
          failures,
        );
        return next(valError);
      }
      const { id } = req.params;
      const response  = await this.appContext.todoRepository.deleteMany( { _id: id });
      if(response.deletedCount > 0){
        res.status(204);
        res.end();
      }
      else{
        throw new Error('todo item not found');
      }
    }
    catch(err){
      
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.INVALID_REQUEST'),
        err
      );
      return next(valError);
    }
  }

  private getTodo = async (req: ExtendedRequest, res: Response, next: NextFunction)=> {
    try{
      const failures: ValidationFailure[] = Validation.extractValidationErrors(
        req,
      );
      if (failures.length > 0) {
        const valError = new Errors.ValidationError(
          res.__('DEFAULT_ERRORS.INSUFFUCIENT_REQUEST'),
          failures,
        );
        return next(valError);
      }
      const { id } = req.params;
      const todoItem  = await this.appContext.todoRepository.findById(id);
      let flag = false;
      for(let key in todoItem){
        if(key === 'title'){
          flag = true;
        }
      }
      if(flag){
        res.status(200).json(todoItem.serialize());
      }
      else{
        throw new Error('todo item not found');
      } 
    }
    catch(err){
      const failures = [ { message: err.message, field : req.params.id } ];
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.RESOURCE_NOT_FOUND'),
        failures
      );
      return next(valError);
    }
  }

  private allTodo = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
      const failures: ValidationFailure[] = Validation.extractValidationErrors(
        req,
      );
      if (failures.length > 0) {
        const valError = new Errors.ValidationError(
          res.__('DEFAULT_ERRORS.INSUFFUCIENT_REQUEST'),
          failures,
        );
        return next(valError);
      }
      let todoItems: Todo[] = await this.appContext.todoRepository.getAll();
      let todos = todoItems.map((todo) =>{
        return todo.serialize();
      })
      res.status(200).json(Array.from(todos));
    } catch(err) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.RESOURCE_NOT_FOUND'),
        err,
      );
      return next(valError);
    }
  }

  // function handles updation of a todo item
  private updateTodo = async (req:ExtendedRequest, res: Response, next: NextFunction) => {
    try{
      const failures: ValidationFailure[] = Validation.extractValidationErrors(
        req,
      );
      if (failures.length > 0) {
        const valError = new Errors.ValidationError(
          res.__('DEFAULT_ERRORS.INSUFFUCIENT_REQUEST'),
          failures,
        );
        return next(valError);
      }
      const { title } = req.body;
      const { id } = req.params;
      const updatedTodo = await this.appContext.todoRepository.update({_id: id}, { title });
      let flag = false;
      for( let key in updatedTodo){
        if(key === 'title'){
          flag = true;
        }
      }
      if(flag){
      res.status(200).json(updatedTodo.serialize());
      }
      else{
        throw new Error('todo item not found');
      }
    } catch(err) {
      const failures = [ { message: err.message, field : req.params.id } ];
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.RESOURCE_NOT_FOUND'),
        failures,
      );
      return next(valError);
    }
  }
}
