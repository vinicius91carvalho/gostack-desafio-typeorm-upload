import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  private sum(transactions: Transaction[], type: 'income' | 'outcome'): number {
    return transactions
      .filter(transaction => transaction.type === type)
      .map(transaction => transaction.value)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  }

  public getBalance(transactions: Transaction[]): Balance {
    const income = this.sum(transactions, 'income');
    const outcome = this.sum(transactions, 'outcome');
    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }

  public async all(): Promise<{
    transactions: Transaction[];
    balance: Balance;
  }> {
    const transactions = await this.find({
      relations: ['category'],
    });

    const balance = this.getBalance(transactions);

    return {
      transactions,
      balance,
    };
  }
}

export default TransactionsRepository;
