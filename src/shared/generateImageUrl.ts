import * as dotenv from 'dotenv';
dotenv.config();

export const generateImageURL = (
  doctorId: string,
  ownerAddressId: string,
  imageName: string,
): string =>
  `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/logo/${doctorId}/${ownerAddressId}/${imageName}`;
