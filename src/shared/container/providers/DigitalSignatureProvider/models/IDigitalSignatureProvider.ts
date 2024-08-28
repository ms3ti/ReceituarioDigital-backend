interface IDigitalSignatureProvider {
  publishDocument(data: string): Promise<string>;
  chackDocument(data: string): Promise<string>;
  recoverDocument(id: string): Promise<string>;
}

export { IDigitalSignatureProvider };
