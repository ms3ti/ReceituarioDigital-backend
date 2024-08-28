export class ISignatureDto {
  DsDocumento: string;
  DsDetalhesDocumento: string;
  DtLimiteAssinatura: string;
  MD5Documento: string;
  participantes: IPaticipantes;
  pdfBase64: string;
}

class IPaticipantes {
  CpfCnpj: string;
  DsNome: string;
  DsAliasPerfil: string;
  DsEmail: string;
  DsTelefoneContato: string;
  TpAssinatura: string;
  Perfil: string;
}
