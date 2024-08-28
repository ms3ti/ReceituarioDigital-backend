import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class SNSService {
  private logger = new Logger();
  private readonly sns = new AWS.SNS({
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_USER,
      secretAccessKey: process.env.S3_PASSWORD,
    },
  });

  async sendSMS(phoneNumber: string, message: string): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        this.sns.setSMSAttributes({
          attributes: {
            DefaultSMSType: 'Transactional',
          },
        });

        this.sns.publish(
          {
            PhoneNumber: '55' + phoneNumber,
            Subject: 'MRD - Meu Receituário Digital.',
            Message: message,
          },
          (error, data) => {
            if (error) {
              this.logger.error(`Error on send SMS`, error);
              return reject(error);
            }
            this.logger.log(`Message send to ${phoneNumber}`, data);
            return resolve(data);
          },
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
}
