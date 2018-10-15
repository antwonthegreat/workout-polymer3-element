import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';
// import LiftType from './LiftType';
// import User from './User';

export default interface UserToLiftType extends ODataDto {
  Id: number;

  //LiftType: LiftType;
  LiftTypeId: number;

  //User: User;
  UserId: number;
}