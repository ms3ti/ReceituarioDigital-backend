export async function xmlRecoverDocument(idDocument: string): Promise<string> {
  return `
  <x:Envelope
  xmlns:x="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:tem="http://tempuri.org/">
  <x:Header/>
  <x:Body>
      <tem:RecuperarDocumento>
          <tem:IdDocumento>${idDocument}</tem:IdDocumento>
      </tem:RecuperarDocumento>
  </x:Body>
</x:Envelope>
`;
}
