import { Request } from 'express';
import { User } from '../user/entities/user.entity';

export interface RequestWithUserInterface extends Request {
  user: User;
}
