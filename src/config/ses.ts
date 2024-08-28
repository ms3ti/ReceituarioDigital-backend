import * as AWS from '@aws-sdk/client-sesv2';
import * as dotenv from 'dotenv';
dotenv.config();

const ses = new AWS.SESv2({
  region: process.env.SES_REGION,
  credentials: {
    accessKeyId: process.env.SES_KEY,
    secretAccessKey: process.env.SES_SECRET,
  },
});

export { ses };
