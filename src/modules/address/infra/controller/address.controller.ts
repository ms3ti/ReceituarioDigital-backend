import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ResponseClass } from '../../../../shared/ResponseBody';
import { ICreateAddressPayloadDto } from '../../contracts/dtos/address/create.address.payload.dto';
import { ICreatedAddressDto } from '../../contracts/dtos/address/created.address.dto';
import { IAddressOwnerAddressPayloadDto } from '../../contracts/dtos/address/update.address.ownerAddress.dto';
import { AddressService } from '../../services/address.service';

@Controller('address')
@ApiTags('Address')
@UseGuards(AuthGuard('jwt'))
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post('')
  @ApiResponse({ type: ICreatedAddressDto, status: HttpStatus.CREATED })
  async create(@Body() body: ICreateAddressPayloadDto, @Res() res: Response) {
    try {
      const result = await this.addressService.createAddress(body);
      return res
        .status(HttpStatus.CREATED)
        .send(new ResponseClass(result, null));
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error));
    }
  }

  @Get('/list/:personId')
  @ApiResponse({
    type: [ICreatedAddressDto],
    status: HttpStatus.OK,
  })
  async list(@Param('personId') personId: number, @Res() res: Response) {
    try {
      const result = await this.addressService.listAddress(personId);
      return res.status(HttpStatus.OK).send(new ResponseClass(result, null));
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error));
    }
  }

  @Post('/:personId/default/:ownerAddressId')
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async setAddressToDefault(
    @Param('personId') personId: number,
    @Param('ownerAddressId') ownerAddressId: number,
    @Res() res: Response,
  ) {
    try {
      await this.addressService.setToDefault(ownerAddressId, personId);
      return res
        .status(HttpStatus.NO_CONTENT)
        .send(new ResponseClass({}, null));
    } catch (error) {
      console.log(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error));
    }
  }

  @Put('')
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async edit(
    @Body() body: IAddressOwnerAddressPayloadDto,
    @Res() res: Response,
  ) {
    try {
      await this.addressService.editAddress(body);
      return res
        .status(HttpStatus.NO_CONTENT)
        .send(new ResponseClass({}, null));
    } catch (error) {
      console.log(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error));
    }
  }

  @Delete('/:ownerAddressId')
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async disabledAddress(
    @Param('ownerAddressId') ownerAddressId: number,
    @Res() res: Response,
  ) {
    try {
      await this.addressService.disabledOwnerAddress(ownerAddressId);
      return res
        .status(HttpStatus.NO_CONTENT)
        .send(new ResponseClass({}, null));
    } catch (error) {
      console.log(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error));
    }
  }
}
