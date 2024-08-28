import { ApiProperty } from '@nestjs/swagger';
class PayloadDto {
  @ApiProperty()
  sub: string;
  @ApiProperty()
  email_verified: boolean;
  @ApiProperty()
  iss: string;
  @ApiProperty()
  phone_number_verified: boolean;
  @ApiProperty()
  'cognito:username': string;
  @ApiProperty()
  origin_jti: string;
  @ApiProperty()
  aud: string;
  @ApiProperty()
  event_id: string;
  @ApiProperty()
  updated_at: number;
  @ApiProperty()
  token_use: string;
  @ApiProperty()
  auth_time: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  phone_number: string;
  @ApiProperty()
  exp: number;
  @ApiProperty()
  iat: number;
  @ApiProperty()
  jti: string;
  @ApiProperty()
  email: string;
}
class IdTokenDto {
  @ApiProperty()
  jwtToken: string;

  @ApiProperty()
  payload: PayloadDto;
}

class RefreshTokenDto {
  @ApiProperty()
  token: string;
}

class AcessTokenDto {
  @ApiProperty()
  jwtToken: string;
  @ApiProperty()
  payload: PayloadDto;
}
export class ICognitoDto {
  @ApiProperty()
  idToken: IdTokenDto;
  @ApiProperty()
  refreshToken: RefreshTokenDto;
  @ApiProperty()
  accessToken: AcessTokenDto;
  @ApiProperty()
  clockDrift: number;
}
