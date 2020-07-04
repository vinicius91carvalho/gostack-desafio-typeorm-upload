import { Router, Request, Response } from 'express';

import multer from 'multer';

import { getCustomRepository } from 'typeorm';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import CreateCategoryService from '../services/CreateCategoryService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request: Request, response: Response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const { transactions, balance } = await transactionsRepository.all();

  response.status(200).json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request: Request, response: Response) => {
  const { title, value, type, category } = request.body;

  const createCategory = new CreateCategoryService();
  const createTransaction = new CreateTransactionService();

  const { category: categorySynchronized } = await createCategory.execute(
    category,
  );

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category: categorySynchronized,
  });

  response.status(201).json(transaction);
});

transactionsRouter.delete(
  '/:id',
  async (request: Request, response: Response) => {
    const { id } = request.params;
    const deleteTransaction = new DeleteTransactionService();
    await deleteTransaction.execute(id);
    response.status(204).send();
  },
);

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request: Request, response: Response) => {
    const importTransactions = new ImportTransactionsService();
    const transactions = await importTransactions.execute(
      request.file.filename,
    );
    response.status(201).json(transactions);
  },
);

export default transactionsRouter;
