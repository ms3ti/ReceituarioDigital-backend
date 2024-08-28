import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Res,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TermService } from '../../services/term.service';
import { Response } from 'express';
import { ResponseClass } from '../../../../shared/ResponseBody';
import { ITermDto } from '../../contracts/dtos/term/term.dto';

@Controller('term')
@ApiTags('Term')
export class TermController {
  private readonly logger = new Logger();
  constructor(public readonly termService: TermService) {}

  @Get('/:type')
  @ApiResponse({ type: ITermDto, status: HttpStatus.OK })
  async getTermByType(@Param('type') type: number, @Res() res: Response) {
    try {
      const result = await this.termService.getTermByType(type);
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      this.logger.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }
}
