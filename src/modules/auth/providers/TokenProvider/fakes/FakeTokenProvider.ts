import { ITokenProvider } from '../models/ITokenProvider';

class FakeTokenProvider implements ITokenProvider {
  public async generateToken(id: string): Promise<string> {
    return id;
  }

  public async generateRefreshToken(
    expires_in: string,
    secret: string,
  ): Promise<string> {
    return '';
  }
}

export { FakeTokenProvider };
