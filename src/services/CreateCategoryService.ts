import { getRepository } from 'typeorm';

import Category from '../models/Category';

class CreateCategoryService {
  public async execute(title: string): Promise<{ category: Category }> {
    const categoriesRepository = getRepository(Category);

    const categoryFound = await categoriesRepository.findOne({
      where: { title },
      select: ['id', 'title', 'created_at', 'updated_at'],
    });

    if (categoryFound) {
      return { category: categoryFound };
    }

    const category = await categoriesRepository.create({
      title,
    });

    await categoriesRepository.save(category);

    return {
      category,
    };
  }
}

export default CreateCategoryService;
