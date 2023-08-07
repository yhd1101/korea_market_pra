import { Provider } from '../entities/provider.enum';

export class CreateUserDto {
  name: string;
  email: string;
  password?: string;

  provider?: Provider;
  profileImg: string;
}
