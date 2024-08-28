export class IGetPatientByIdDto {
  cpf: string;
  name: string;
  mothersName: string;
  birthDate: Date;
  email: string;
  phoneNumber: string;
  personType: number;
  socialName: string;
  personId: number;
  patientId: number;
  sex: string;
  id: number;
  active: boolean;
  createDate: Date;
  updateDate: Date;
  responsibleSocialName: string;
  responsibleName: string;
  responsibleCPF: string;
  hasResponsible: boolean;
  responsibleSex?: string;
  responsibleMothersName?: string;
  responsibleBirthDate?: Date;
  address: {
    addressId: number;
    ownerAddressId: number;
    cep: string;
    city: string;
    district: string;
    street: string;
    number: string;
    complement: string;
    state: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
  };
}
