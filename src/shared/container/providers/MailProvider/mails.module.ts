import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './implementations/MailService';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_SMTP_HOST,
        port: process.env.EMAIL_SMTP_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailsModule {}
