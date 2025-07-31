import { ValueTransformer } from 'typeorm';
import { applyIfDefined } from './apply-if-defined';

export const dateTransformer: ValueTransformer = {
  to: (value: Date) => value,
  from: (value: string | null) => applyIfDefined(value, (val) => new Date(val)),
};
