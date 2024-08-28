import { HttpService } from '@nestjs/axios';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { xml2json } from 'xml-js';
import { Request, SignedResponse, SignResponse } from '../dtos/IRequest.DTO';
import { xmlCheckDocument } from '../functions/xmlCheckDocument';
import { xmlRecoverDocument } from '../functions/xmlRecoverDocument';
import { xmlRequest } from '../functions/xmlRequest';

@Injectable()
export class DigitalSignatureProvider {
  constructor(private http: HttpService) {}

  public async publishDocument(data: Request): Promise<SignResponse> {
    const xml = await xmlRequest(data);
    const url = process.env.URL_WEBSERVICE;

    const headers = {
      'Content-Type': 'text/xml;charset=UTF-8',
      SOAPAction: 'http://tempuri.org/PublicarDocumento',
    };

    let link = `${process.env.URL_PORTAL}/?token=`;

    const responseData = {
      idDocument: '',
      url: '',
    };

    await this.http
      .post(url, xml, {
        headers,
      })
      .toPromise()
      .then((res) => {
        const dataToJson = xml2json(res.data, {
          compact: true,
          spaces: 2,
        });
        const data = JSON.parse(dataToJson);
        responseData.url = link +=
          data['soap:Envelope']['soap:Body'].PublicarDocumentoResponse
            .PublicarDocumentoResult.AssinaWeb.publicacao.participantes
            .participante.Token._text;
        responseData.idDocument =
          data['soap:Envelope'][
            'soap:Body'
          ].PublicarDocumentoResponse.PublicarDocumentoResult.AssinaWeb.publicacao.idDocumento._text;
      })
      .catch((e) => {
        const err = JSON.parse(JSON.stringify(e, null, 3));
        console.log(e.response);
        throw new InternalServerErrorException(err.message);
      });

    return responseData;
  }

  public async recoverDocument(idDocument: string): Promise<SignedResponse> {
    const xml = await xmlRecoverDocument(idDocument);
    const url = process.env.URL_WEBSERVICE;

    const headers = {
      'Content-Type': 'text/xml;charset=UTF-8',
      SOAPAction: 'http://tempuri.org/RecuperarDocumento',
    };

    const responseData = {
      mensagem: '',
      idDocumento: '',
      docBase64: '',
    };
    await this.http
      .post(url, xml, {
        headers,
      })
      .toPromise()
      .then((res) => {
        const dataToJson = xml2json(res.data, {
          compact: true,
          spaces: 2,
        });
        const data = JSON.parse(dataToJson);

        responseData.idDocumento =
          data['soap:Envelope'][
            'soap:Body'
          ].RecuperarDocumentoResponse.RecuperarDocumentoResult.AssinaWeb.documento.idDocumento._text;
        responseData.mensagem =
          data['soap:Envelope'][
            'soap:Body'
          ].RecuperarDocumentoResponse.RecuperarDocumentoResult.AssinaWeb.documento.mensagem._text;
        responseData.docBase64 =
          data['soap:Envelope'][
            'soap:Body'
          ].RecuperarDocumentoResponse.RecuperarDocumentoResult.AssinaWeb.documento.docBase64._text;
      })
      .catch((e) => {
        const err = JSON.parse(JSON.stringify(e, null, 3));
        console.error(e.response);
        throw new InternalServerErrorException(err.message);
      });
    return responseData;
  }

  public async checkDocument(idDocument: string): Promise<object> {
    const xml = await xmlCheckDocument(idDocument);
    const url = process.env.URL_WEBSERVICE;

    const headers = {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: 'http://tempuri.org/VerificarDocumento',
    };

    const responseData = {
      menssagem: '',
      idDocumento: '',
      status: '',
    };

    await this.http
      .post(url, xml, {
        headers,
      })
      .toPromise()
      .then((res) => {
        const dataToJson = xml2json(res.data, {
          compact: true,
          spaces: 2,
        });
        const data = JSON.parse(dataToJson);

        responseData.menssagem =
          data['soap:Envelope'][
            'soap:Body'
          ].VerificarDocumentoResponse.VerificarDocumentoResult.AssinaWeb.documento.mensagem._text;
        responseData.idDocumento =
          data['soap:Envelope'][
            'soap:Body'
          ].VerificarDocumentoResponse.VerificarDocumentoResult.AssinaWeb.documento.idDocumento._text;
        responseData.status =
          data['soap:Envelope']['soap:Body'].VerificarDocumentoResponse
            .VerificarDocumentoResult.AssinaWeb.documento.statusDoc._text ??
          null;
      })
      .catch((e) => {
        const err = JSON.parse(JSON.stringify(e, null, 3));
        console.error(e.response);
        throw new InternalServerErrorException(err.message);
      });
    return responseData;
  }
}
