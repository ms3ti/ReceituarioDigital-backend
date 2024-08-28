export interface IAddressModel {
  id: number;
  state: string;
  cep: string;
  city: string;
  district: string;
  street: string;
  number: string;
  complement: string | undefined;
  createDate?: Date;
  updateDate?: Date;
}
