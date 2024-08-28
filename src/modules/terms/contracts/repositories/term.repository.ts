import { Term } from '../../infra/domain/entities/term.entity';

interface ITermRepository {
  getTerm(tyoe: number): Promise<Term>;
}

export { ITermRepository };
