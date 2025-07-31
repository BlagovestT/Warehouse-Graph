export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  companyId: string;
}

export interface RegisterOwnerData {
  companyName: string;
  username: string;
  email: string;
  password: string;
}
