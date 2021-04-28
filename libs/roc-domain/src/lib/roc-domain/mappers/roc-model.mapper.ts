import { Result } from '@vantage-point/ddd-core';
import hash from 'object-hash';

import { EducationFinancingModel, InstitutionModel, InstructionalProgramModel, LocationModel, OccupationModel, RocAggregate, RocModel, RocModelId, RocModelService, UserModel } from '../domain';
import { LoanLimitsModel, RocCalculatorInput, RocCalculatorOutputModel, RocModelDto } from '../models';
import { EducationFinancingModelMapper } from './education-financing-model.mapper';
import { InstitutionModelMapper } from './institution-model.mapper';
import { InstructionalProgramModelMapper } from './instructional-program-model.mapper';
import { LocationModelMapper } from './location-model.mapper';
import { OccupationModelMapper } from './occupation-model.mapper';

const got = require('got');


export class RocModelMapper
{
  private constructor()
  {
  }

  public static create(): RocModelMapper
  {
    return new RocModelMapper();
  }

  async toDTO(input: RocAggregate): Promise<RocModelDto>
  {
    const rocModelDto: RocModelDto = await this.toRocModelDto(input.activeModel, input.userModel);

    return rocModelDto;
  }

  async toDTOList(input: RocAggregate): Promise<RocModelDto[]>
  {
    const list: RocModelDto[] = [];

    input.rocModelList.map(async (item: RocModel) =>
    {
      const rocModelDto: RocModelDto = await this.toRocModelDto(item, input.userModel);

      list.push(rocModelDto);
    });

    return list;
  }

  toDomain(input: RocModelDto): Result<RocModel>
  {
    const locationModelOrFailure: Result<LocationModel> = LocationModelMapper.create().toDomain(input.locationModel);
    const occupationModelOrFailure: Result<OccupationModel> = OccupationModelMapper.create().toDomain(input.occupationModel);
    const instructionalProgramModelOrFailure: Result<InstructionalProgramModel> = InstructionalProgramModelMapper.create().toDomain(input.degreeProgram);
    const institutionModelOrFailure: Result<InstitutionModel> = InstitutionModelMapper.create().toDomain(input.institutionModel);
    const educationFinancingModelOrFailure: Result<EducationFinancingModel> = EducationFinancingModelMapper.create().toDomain(input.educationFinancingModel);

    const locationModel: LocationModel = (locationModelOrFailure.isSuccess) ? locationModelOrFailure.getValue() : UserModel.defaultProps.locationModel;
    const occupationModel: OccupationModel = (occupationModelOrFailure.isSuccess) ? occupationModelOrFailure.getValue() : UserModel.defaultProps.occupationModel;
    const instructionalProgramModel: InstructionalProgramModel = (instructionalProgramModelOrFailure.isSuccess) ? instructionalProgramModelOrFailure.getValue() : RocModel.defaultProps.degreeProgram;
    const institutionModel: InstitutionModel = (institutionModelOrFailure.isSuccess) ? institutionModelOrFailure.getValue() : RocModel.defaultProps.institutionModel;
    const educationFinancingModel: EducationFinancingModel = (educationFinancingModelOrFailure.isSuccess) ? educationFinancingModelOrFailure.getValue() : RocModel.defaultProps.educationFinancingModel;

    return RocModel.create
      (
        {
          name: input?.name ?? RocModel.defaultProps.name,

          locationModel: locationModel,
          occupationModel: occupationModel,
          degreeLevel: input?.degreeLevel ?? RocModel.defaultProps.degreeLevel,
          degreeProgram: instructionalProgramModel,
          retirementAge: input?.retirementAge ?? RocModel.defaultProps.retirementAge,

          institutionModel: institutionModel,
          startYear: input?.startYear ?? RocModel.defaultProps.startYear,
          isFulltime: input?.isFulltime ?? RocModel.defaultProps.isFulltime,
          yearsToCompleteDegree: input?.yearsToCompleteDegree ?? RocModel.defaultProps.yearsToCompleteDegree,

          residencyType: input?.residencyType ?? RocModel.defaultProps.residencyType,
          livingConditionTypeEnum: input?.livingConditionTypeEnum ?? RocModel.defaultProps.livingConditionTypeEnum,
          grantsModel: input?.grantsModel ?? RocModel.defaultProps.grantsModel,

          educationFinancingModel: educationFinancingModel,

          radiusInMiles: input?.radiusInMiles ?? RocModel.defaultProps.radiusInMiles
        },
        RocModelId.create(input.rocModelId)
      );
  }

  async runRocCalculator(rocCalculatorInput: RocCalculatorInput): Promise<Result<RocCalculatorOutputModel>>
  {
    try
    {
      const url: string = `https://api-roc-calculator.returnon.college/roi-calculator-outputs`;

      const { body } = await got.post(url,
        {
          json: rocCalculatorInput,
          responseType: 'json'
        });


      console.log('WHO DAT', body);

      if (body && body.length > 0)
      {
        return Result.success<RocCalculatorOutputModel>(body[0].user_id);
      }

      throw (`ERROR | ROI CALCULATOR OUTPUT`);
    }
    catch (err)
    {
      return Result.failure<RocCalculatorOutputModel>(err);
    }
  }



  private async toRocModelDto(rocModel: RocModel, userModel: UserModel): Promise<RocModelDto>
  {
    const rocCalculatorInput: RocCalculatorInput = await RocModelService.generateRocCalculatorInput(rocModel, userModel);
    // const rocCalculatorOutputOrFailure: Result<RocCalculatorOutputModel> = await this.runRocCalculator(rocCalculatorInput);
    const costOfAttendanceByYear: number[] = RocModelService.getCostOfAttendanceByYear(rocModel);
    const grantsByYear: number[] = RocModelService.getGrantsByYear(rocModel, userModel);
    const netPriceByYear: number[] = RocModelService.getNetPriceByYear(rocModel, userModel);
    const loanLimitsModel: LoanLimitsModel = RocModelService.getLoanLimitsInfo(rocModel);
    const outOfPocketExpensesByYear: number[] = RocModelService.getOutOfPocketExpensesByYear(rocModel, userModel);


    const dto: RocModelDto =
    {
      rocModelId: rocModel.roiModelId.id.toString(),
      name: rocModel.name,

      locationModel: LocationModelMapper.create().toDTO(rocModel.locationModel),
      occupationModel: OccupationModelMapper.create().toDTO(rocModel.occupationModel),
      degreeLevel: rocModel.degreeLevel,
      degreeProgram: rocModel.degreeProgram,
      retirementAge: rocModel.retirementAge,

      institutionModel: InstitutionModelMapper.create().toDTO(rocModel.institutionModel),
      startYear: rocModel.startYear,
      isFulltime: rocModel.isFulltime,
      yearsToCompleteDegree: rocModel.yearsToCompleteDegree,

      residencyType: rocModel.residencyType,
      livingConditionTypeEnum: rocModel.livingConditionTypeEnum,
      grantsModel: rocModel.grantsModel,

      educationFinancingModel: EducationFinancingModelMapper.create().toDTO(rocModel.educationFinancingModel),

      radiusInMiles: rocModel.startYear,

      rocCalculatorInput: rocCalculatorInput,
      rocCalculatorOutput: null,
      // rocCalculatorOutput: rocCalculatorOutputOrFailure.isSuccess ? rocCalculatorOutputOrFailure.getValue() : null,

      costOfAttendanceByYear: costOfAttendanceByYear,
      grantsByYear: grantsByYear,
      netPriceByYear: netPriceByYear,
      federalSubsidizedLoanLimitByYear: loanLimitsModel.federalSubsidizedLoanByYear,
      federalUnsubsidizedLoanLimitByYear: loanLimitsModel.federalUnsubsidizedLoanByYear,
      outOfPocketExpensesByYear: outOfPocketExpensesByYear,

      modelHash: null
    };

    const modelHash: string = hash(dto);

    dto.modelHash = modelHash;

    return dto;
  }
}
