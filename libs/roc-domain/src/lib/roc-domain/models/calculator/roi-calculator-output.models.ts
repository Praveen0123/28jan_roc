export interface RoiCalculatorOutput
{
  yearsInCollege: number;
  yearsToRoiBreakEven25: number;
  yearsToRoiBreakEven50: number;
  yearsToRoiBreakEven75: number;
  earningCumulativeProb25: number[];
  earningCumulativeProb50: number[];
  earningCumulativeProb75: number[];
  monthlySalary25: number[];
  monthlySalary50: number[];
  monthlySalary75: number[];
  monthlyLoanPayment25: number[];
  monthlyLoanPayment50: number[];
  monthlyLoanPayment75: number[];
  roi25: number[];
  roi50: number[];
  roi75: number[];
  lifeAnnualizedRoi25: number;
  lifeAnnualizedRoi50: number;
  lifeAnnualizedRoi75: number;
  lifeRevenue25: number;
  lifeRevenue50: number;
  lifeRevenue75: number;
  investment25: number;
  investment50: number;
  investment75: number;
  outOfPocket25: number[];
  outOfPocket50: number[];
  outOfPocket75: number[];
  federalLoanAveraged: number[];
  privateLoanAveraged: number[];
  time: number[];
};


export interface RocCalculatorOutputModel
{
  goalState: RoiCalculatorOutput;
  currentState: RoiCalculatorOutput;
}
