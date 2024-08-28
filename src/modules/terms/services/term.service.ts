import { Injectable } from '@nestjs/common';
import { ITermDto } from '../contracts/dtos/term/term.dto';
import { TermRepository } from '../infra/domain/repositories/term.repository';

@Injectable()
export class TermService {
  constructor(public readonly termRepository: TermRepository) {
    this.termRepository = termRepository;
  }

  async getTermByType(type: number): Promise<ITermDto> {
    try {
      const termEntity = await this.termRepository.getTerm(type);
      const termDto: ITermDto = { term: termEntity?.termDescripton };
      return termDto;
    } catch (error) {
      throw error;
    }
  }
}
