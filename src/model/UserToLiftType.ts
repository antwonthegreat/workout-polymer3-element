import LiftType from './LiftType';
import User from './User';

export default interface UserToLiftType {
  Id: number;

  LiftType: LiftType;
  LiftTypeId: number;

  User: User;
  UserId: number;
}