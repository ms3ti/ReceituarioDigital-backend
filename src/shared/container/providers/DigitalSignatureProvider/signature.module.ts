import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { DigitalSignatureProvider } from './implementations/DigitalSignatureProvider';

@Global()
@Module({
  imports: [HttpModule],
  providers: [DigitalSignatureProvider],
  exports: [DigitalSignatureProvider],
})
export class SignatureModule {}
