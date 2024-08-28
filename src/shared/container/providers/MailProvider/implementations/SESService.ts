import { Injectable, InternalServerErrorException } from '@nestjs/common';

import * as fs from 'fs';
import handlebars from 'handlebars';

import { SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { ses } from '../../../../../config/ses';
import { ISendMailDTO } from '../dtos/ISendMailDTO';
import { IMailProvider } from '../models/IMailProvider';

@Injectable()
class SESService implements IMailProvider {
  public async sendMail({
    to,
    from,
    subject,
    templateData,
  }: ISendMailDTO): Promise<void> {
    try {
      const templateFileContent = fs
        .readFileSync(templateData.file)
        .toString('utf-8');
      const parseTemplate = handlebars.compile(templateFileContent);
      const mail: SendEmailCommandInput = {
        Content: {
          Simple: {
            Body: {
              Html: {
                Data: parseTemplate(templateData.variables),
              },
            },
            Subject: {
              Data: subject,
            },
          },
        },
        Destination: {
          ToAddresses: [to.email],
        },
        FromEmailAddress: from.email,
      };
      ses.sendEmail(mail);
    } catch (e) {
      console.log(e);
      new InternalServerErrorException({
        title: 'Falha ao enviar email!',
        message: 'Problema no integrador de email',
        data: null,
        cod: 'server.error',
      });
    }
  }
}
export { SESService };
