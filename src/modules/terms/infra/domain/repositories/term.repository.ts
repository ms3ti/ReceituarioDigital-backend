import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ITermRepository } from '../../../contracts/repositories/term.repository';
import { Term } from '../entities/term.entity';

@Injectable()
class TermRepository implements ITermRepository {
  private ormRepository: Repository<Term>;

  constructor(manager: EntityManager) {
    this.ormRepository = manager.getRepository(Term);
  }

  public async getTerm(type: number): Promise<Term> {
    return await this.ormRepository.findOne({
      where: { termType: type },
    });
  }
}

export { TermRepository };
