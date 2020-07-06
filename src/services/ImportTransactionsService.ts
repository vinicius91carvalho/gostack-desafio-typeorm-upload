import path from 'path';
import fs from 'fs';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateCategoryService from './CreateCategoryService';
import CreateTransactionService from './CreateTransactionService';

interface TransactionImport {
  title: string;
  type: 'outcome' | 'income';
  value: number;
  category: string;
}

class ImportTransactionsService {
  public async readFile(fileName: string): Promise<string> {
    const filePath = path.join(uploadConfig.directory, fileName);
    return fs.promises.readFile(filePath, 'utf8');
  }

  public extractHeaders(headerLine: string): string[] {
    return headerLine.split(',').map(header => header.trim());
  }

  public extractTransactions(
    headers: string[],
    lines: string[],
  ): TransactionImport[] {
    const transactions = lines
      .map(line => {
        const columns = line.split(',').map(column => column.trim());

        if (headers.length !== columns.length) {
          return undefined;
        }

        const transaction: any = {};
        headers.forEach((header, index) => {
          transaction[header] = columns[index];
        });

        return transaction;
      })
      .filter(transation => transation);

    return transactions;
  }

  async execute(fileName: string): Promise<Transaction[]> {
    const loadedCSVFile: string = await this.readFile(fileName);

    const lines = loadedCSVFile.split('\n');
    const [headerLine] = lines.splice(0, 1);

    const headers = this.extractHeaders(headerLine);
    const transactions = this.extractTransactions(headers, lines);

    const createCategory = new CreateCategoryService();
    const createTransaction = new CreateTransactionService();

    const savedTransactions: Array<Transaction> = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const transaction of transactions) {
      // eslint-disable-next-line no-await-in-loop
      const { category: categorySynchronized } = await createCategory.execute(
        transaction.category,
      );

      const { title, value, type } = transaction;

      // eslint-disable-next-line no-await-in-loop
      const savedTransaction = await createTransaction.execute({
        title,
        value,
        type,
        category: categorySynchronized,
      });

      savedTransactions.push(savedTransaction);
    }

    return savedTransactions;
  }
}

export default ImportTransactionsService;
