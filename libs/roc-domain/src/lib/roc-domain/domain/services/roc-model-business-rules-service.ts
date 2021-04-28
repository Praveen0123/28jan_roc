import { RocModel } from '../roc-model';


export class RocModelBusinessRulesService
{



  // SEED NUMBER OF YEARS TO COMPLETE DEGREE BASED ON DESIRED EDUCATION LEVEL
  businessRules_Update_YearsToCompleteDegree(_rocModel: RocModel): void
  {
    // TODO: This continually sets the years to complete degree, not allowing the user to change the years to complete
    // console.log('🚀 ~ file: model.ts ~ rocModel.degreeLevel', rocModel.degreeLevel);
    // let yearsToCompleteDegree: number;

    // const yearsOfCollegeFunc: Map<number, Function> = new Map();
    // yearsOfCollegeFunc.set(EducationLevelEnum.NinthGradeStudent.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_HIGH_SCHOOL);
    // yearsOfCollegeFunc.set(EducationLevelEnum.TenthGradeStudent.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_HIGH_SCHOOL);
    // yearsOfCollegeFunc.set(EducationLevelEnum.EleventhGradeStudent.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_HIGH_SCHOOL);
    // yearsOfCollegeFunc.set(EducationLevelEnum.TwelfthDegreeStudent.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_HIGH_SCHOOL);
    // yearsOfCollegeFunc.set(EducationLevelEnum.HighSchoolGraduate.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_HIGH_SCHOOL);
    // yearsOfCollegeFunc.set(EducationLevelEnum.AssociatesDegree.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_ASSOCIATES_DEGREE);
    // yearsOfCollegeFunc.set(EducationLevelEnum.BachelorsDegree.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_BACHELORS_DEGREE);
    // yearsOfCollegeFunc.set(EducationLevelEnum.MastersDegree.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_MASTERS_DEGREE);
    // yearsOfCollegeFunc.set(EducationLevelEnum.DoctorateDegree.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_DOCTORATE_DEGREE);


    // console.log('🚀 ~ file: model.ts ~ yearsOfCollegeFunc', yearsOfCollegeFunc);
    // console.log('🚀 ~ file: model.ts ~ yearsOfCollegeFunc.get(rocModel.degreeLevel)', yearsOfCollegeFunc.get(rocModel.degreeLevel.value));
    // if (rocModel.degreeLevel)
    // {
    //   yearsToCompleteDegree = (yearsOfCollegeFunc.get(rocModel.degreeLevel.value) || yearsOfCollegeFunc.get(EducationLevelEnum.HighSchoolGraduate.value))();
    // }
    // else
    // {
    //   yearsToCompleteDegree = (yearsOfCollegeFunc.get(EducationLevelEnum.HighSchoolGraduate.value))();
    // }

    // console.log('🚀 ~ file: model.ts ~ rocModel.yearsToCompleteDegree', rocModel.yearsToCompleteDegree);
    // console.log('🚀 ~ file: model.ts ~ line 774 ~ yearsToCompleteDegree', yearsToCompleteDegree);
    // rocModel.yearsToCompleteDegree = yearsToCompleteDegree;
  }

}
