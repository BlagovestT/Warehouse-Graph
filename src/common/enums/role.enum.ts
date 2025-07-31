import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  owner = 'owner',
  operator = 'operator',
  viewer = 'viewer',
}

registerEnumType(Role, {
  name: 'Role',
  description: 'User role permissions in the system',
});
