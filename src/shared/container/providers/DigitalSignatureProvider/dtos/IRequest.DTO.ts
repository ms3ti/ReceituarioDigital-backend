import { ApiProperty } from '@nestjs/swagger';

class Participante {
  @ApiProperty()
  CpfCnpj: string;
  @ApiProperty()
  DsNome: string;
  @ApiProperty()
  DsEmail: string;
  @ApiProperty()
  DsTelefoneContato: string;
}

export class SignResponse {
  @ApiProperty()
  idDocument: string;
  @ApiProperty()
  url: string;
}
export class Request {
  @ApiProperty()
  DsDocumento: string;

  @ApiProperty()
  DsDetalhesDocumento: string;

  @ApiProperty()
  DtLimiteAssinatura: string;

  @ApiProperty()
  MD5Documento: string;

  @ApiProperty()
  participantes: Participante;

  @ApiProperty()
  pdfBase64: string;
}
export class SignedResponse {
  @ApiProperty()
  mensagem: string;

  @ApiProperty()
  idDocumento: string;

  @ApiProperty()
  docBase64: string;
}
