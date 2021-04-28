
export enum ReleaseScheduleItemStatusEnum
{
  COMPLETED = 'Completed',
  IN_PROGRESS = 'In Progress',
  PLANNED = 'Planned'
}

export interface ReleaseScheduleModel
{
  versionName: string;
  versionDescription: string[],
  versionStatus: string,
  versionDate: string;
}
