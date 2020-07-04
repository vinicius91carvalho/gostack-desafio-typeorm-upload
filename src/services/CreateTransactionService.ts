import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: Category;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const transactions = await transactionsRepository.find();
      const { income } = transactionsRepository.getBalance(transactions);

      if (value > income) {
        throw new AppError('The outcome value is greather than your income');
      }
    }

    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
