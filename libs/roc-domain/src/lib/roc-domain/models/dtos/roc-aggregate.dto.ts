import { RocModelDto } from './roc-model.dto';
import { UserModelDto } from './user-model.dto';


export interface RocAggregateDto
{
  rocAggregateId: string;
  name: string;
  userModelDto: UserModelDto;
  activeRocModelId: string;
  rocModelList: RocModelDto[];
  lastUpdated: Date;
}

export interface RocAndUserModelsDto
{
  rocModelDto: RocModelDto;
  userModelDto: UserModelDto;
}
