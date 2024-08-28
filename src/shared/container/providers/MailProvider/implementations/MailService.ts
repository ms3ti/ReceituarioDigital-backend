import { Injectable, InternalServerErrorException } from '@nestjs/common';

import * as fs from 'fs';
import handlebars from 'handlebars';

import { MailerService } from '@nestjs-modules/mailer';
import { ISendMailDTO } from '../dtos/ISendMailDTO';
import { IMailProvider } from '../models/IMailProvider';

import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
class MailService implements IMailProvider {
  constructor(private mailerService: MailerService) {}

  public async sendMail({
    to,
    from,
    copy,
    subject,
    templateData,
  }: ISendMailDTO): Promise<void> {
    try {
      const templateFileContent = fs
        .readFileSync(templateData.file)
        .toString('utf-8');

      const parseTemplate = handlebars.compile(templateFileContent);
      await this.mailerService.sendMail({
        from: {
          name: from?.name || process.env.EMAIL_USER,
          address: from?.email || process.env.EMAIL_PASS,
        },
        to: {
          name: to.name,
          address: to.email,
        },
        cc: {
          name: copy?.name,
          address: copy?.email,
        },
        subject,
        html: parseTemplate(templateData.variables),
      });
    } catch (error) {
      console.log(error);
      new InternalServerErrorException('Não foi possível enviar o email');
    }
  }
}

export { MailService };
