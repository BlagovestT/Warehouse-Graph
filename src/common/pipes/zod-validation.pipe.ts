import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    console.log('Received value:', value);
    console.log('Value type:', typeof value);
    console.log('Value stringified:', JSON.stringify(value));

    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      console.log('❌ Validation error:', error);
      throw new BadRequestException('Validation failed');
    }
  }
}
