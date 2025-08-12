import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully', required: false })
  message?: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ example: 'Error message', required: false })
  error?: string;

  constructor(success: boolean, data?: T, message?: string, error?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
  }

  static success<T>(data?: T, message?: string): ResponseDto<T> {
    return new ResponseDto(true, data, message);
  }

  static error<T>(error: string, message?: string): ResponseDto<T> {
    return new ResponseDto<T>(false, undefined, message, error);
  }
}

export class PaginatedResponseDto<T> extends ResponseDto<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  constructor(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string,
  ) {
    super(true, data, message);

    const totalPages = Math.ceil(total / limit);

    this.pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}
