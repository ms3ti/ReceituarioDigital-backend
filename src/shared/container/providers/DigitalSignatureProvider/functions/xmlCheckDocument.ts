export async function xmlCheckDocument(idDocument: string): Promise<string> {
  return `
  <x:Envelope
      xmlns:x="http://schemas.xmlsoap.org/soap/envelope/"
      xmlns:tem="http://tempuri.org/">
      <x:Header/>
      <x:Body>
      <VerificarDocumento xmlns="http://tempuri.org/">
        <XmlString>
        <![CDATA[
          <AssinaWeb VersaoDados="3.00">
            <TpAmbiente>${process.env.ENVIRONMENT}</TpAmbiente>
            <IdChaveAcesso>${process.env.ACCESS_KEY}</IdChaveAcesso>
            <documento>
              <IdDocumento>${idDocument}</IdDocumento>
            </documento>
          </AssinaWeb>
        ]]>
        </XmlString>
      </VerificarDocumento>
      </x:Body>
  </x:Envelope>
`;
}
