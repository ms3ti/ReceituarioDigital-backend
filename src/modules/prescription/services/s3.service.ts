import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
interface IS3Result {
  ETag: string;
  Location: string;
  Key: string;
  Bucket: string;
}
@Injectable()
export class S3Service {
  private readonly AWS_S3_BUCKET = process.env.S3_BUCKET;
  private readonly s3 = new AWS.S3({
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_USER,
      secretAccessKey: process.env.S3_PASSWORD,
    },
  });

  async upload(
    key: string,
    body: string | Buffer,
    ContentType: string,
  ): Promise<IS3Result> {
    try {
      const result = await this.s3
        .upload({
          Bucket: this.AWS_S3_BUCKET,
          Key: key,
          Body: body,
          ACL: 'public-read',
          ContentEncoding: 'base64',
          ContentType: ContentType,
        })
        .promise();
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
