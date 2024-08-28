export class ICreateOwnerAddressDto {
  id?: number;
  idPerson: number;
  idAddress: number;
  cnpj?: string;
  isDefault: boolean;
  ownerName: string;
  ownerPhone: string;
  ownerPhone2?: string;
  ownerEmail: string;
}
