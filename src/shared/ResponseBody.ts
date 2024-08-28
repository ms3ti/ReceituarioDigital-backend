import { ApiProperty } from '@nestjs/swagger';

export interface ResponseType<T> {
  data: T;
  error: T | any | null;
}

export class ResponseClass<T> implements ResponseType<T> {
  @ApiProperty()
  public data: T;

  @ApiProperty()
  public error: T | any | null;

  constructor(data: T, error: T | any) {
    this.data = data;
    this.error = error;
  }

  json(): ResponseType<T> {
    return {
      data: this.data,
      error: this.error,
    };
  }
}
