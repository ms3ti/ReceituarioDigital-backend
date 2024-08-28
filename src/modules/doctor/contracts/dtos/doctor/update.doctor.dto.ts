import { IDoctorSpecialityDto } from './doctor.speciality.dto';

export interface IUpdateDoctorDto {
  crm: string;
  cpf: string;
  name: string;
  birthDate: Date;
  email: string;
  phoneNumber: string;
  personType: number;
  socialName: string;
  doctorId: number;
  doctorSpecialty: IDoctorSpecialityDto[];
  personId: number;
  councilUf: string;
  councilType: string;
  address: {
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
    addressId: number;
    ownerAddressId: number;
  };
}
