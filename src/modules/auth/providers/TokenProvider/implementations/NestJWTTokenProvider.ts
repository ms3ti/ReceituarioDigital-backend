import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ITokenProvider } from '../models/ITokenProvider';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../../../../../shared/infra/http/middlewares/constants';
@Injectable()
class NestJWTTokenProvider implements ITokenProvider {
  constructor(private jwtService: JwtService) {}

  public async generateToken(id: string) {
    const payload: JwtSignOptions = {
      subject: id,
      secret: jwtConstants.secret,
    };

    return this.jwtService.sign(payload);
  }

  public async generateRefreshToken(
    expires_in: string,
    secret: string,
  ): Promise<string> {
    return this.jwtService.sign({}, { expiresIn: expires_in, secret: secret });
  }
}

export { NestJWTTokenProvider };
