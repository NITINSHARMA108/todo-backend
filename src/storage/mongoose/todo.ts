import { model, Schema } from 'mongoose';

const todoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'todos',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

const todo = model('Todo', todoSchema);
export default todo;
