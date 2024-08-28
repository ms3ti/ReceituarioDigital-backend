import { IAddressDto } from './../../../address/contracts/dtos/address/IAddress.dto';
import { IDoctorDto } from '../../../doctor/contracts/dtos/doctor/doctor.dto';
import { IPrescriptionDto } from './prescription.dto';
import { ApiProperty } from '@nestjs/swagger';

export class IPrescriptionForPrint {
  @ApiProperty()
  prescription: IPrescriptionDto;
  @ApiProperty()
  doctor: IDoctorDto;
  @ApiProperty()
  patientAddress: IAddressDto;
}
