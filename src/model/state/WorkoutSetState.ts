import {IdMap} from '../../services/action-helpers';
import WorkoutSet from '../WorkoutSet';

import {ModelState} from './ModelState';

export interface WorkoutSetState extends ModelState<WorkoutSet> {
  selectedId: number|null;
  personalBestByLiftTypeId: IdMap<WorkoutSet|null>;
}