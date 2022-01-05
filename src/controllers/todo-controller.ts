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
import { createTodoValidator } from '@validators'; // validator for createtodo
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

  }

  private createTodo = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    console.log('in createTodo');
    console.log(req.body);
    const failures: ValidationFailure[] = Validation.extractValidationErrors(
      req,
    );
    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.VALIDATION_FAILED'),
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
}
