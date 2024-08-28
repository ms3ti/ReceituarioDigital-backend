import { IGetPaginationDto } from './get.pagination.dto';

export interface IPrescriptionsOrganizedByDateDto {
  [x: string]: IGetPaginationDto[];
}
