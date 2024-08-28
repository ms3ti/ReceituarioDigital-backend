import { Module } from '@nestjs/common';
import { TermController } from './infra/controller/term.controller';
import { TermRepository } from './infra/domain/repositories/term.repository';
import { TermService } from './services/term.service';

@Module({
  imports: [],
  providers: [TermRepository, TermService],
  controllers: [TermController],
})
export class TermModule {}
