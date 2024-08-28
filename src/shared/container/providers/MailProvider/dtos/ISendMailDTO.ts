interface ITemplateVariables {
  [key: string]: string | number | boolean | object | [];
}

export interface IParseMailTemplateDTO {
  file: string;
  variables: ITemplateVariables;
}

interface IMailContact {
  name: string;
  email: string;
}

interface IMailCopy {
  name: string;
  email: string;
}
export interface ISendMailDTO {
  to: IMailContact;
  from?: IMailContact;
  copy?: IMailCopy;
  subject: string;
  templateData: IParseMailTemplateDTO;
}
