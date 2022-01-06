import lodash from 'lodash';
import { check, ValidationChain } from 'express-validator';
import { AppContext } from '@typings';

const createTodoValidator  = (appContext: AppContext): ValidationChain[] => [
  check('title', 'VALIDATION_ERRORS.NOT_VALID_TITLE').notEmpty(),
];

export default createTodoValidator;