import { Injectable } from '@angular/core';
import { CONFIG } from '@app/config/config';
import { OptimizedOutOfPocketLinearPoints, OptimizedOutOfPocketLinearPointsGQL, OptimizedOutOfPocketLinearPointsQueryVariables, RoiCalculatorOutput, RoiCalculatorOutputGQL } from '@gql';
import { StorageMap } from '@ngx-pwa/local-storage';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';

import { RoiAggregate } from '../domain';
import { PlotLayerValueSnapshot, RocChartPlotData, RocChartPlotMarker, RocChartPopoverData, RocLegendData, RocPlotsVisibility, RoiCalculatorInput, RoiCalculatorOutputModel } from '../models';

@Injectable()
export class LifetimeEarningsService
{
  private roiCalculatorInput: RoiCalculatorInput;
  private rocOutputSubject = new BehaviorSubject<RoiCalculatorOutputModel>(undefined);
  private plotDataSubject = new BehaviorSubject<RocChartPlotData>(undefined);
  private plotVisibilitySubject = new BehaviorSubject<RocPlotsVisibility>(undefined);
  private legendDataSubject = new BehaviorSubject<RocLegendData>(undefined);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  public readonly rocPlotData$ = this.plotDataSubject.asObservable();
  public readonly rocPlotVisibility$ = this.plotVisibilitySubject.asObservable();
  public readonly rocLegendData$ = this.legendDataSubject.asObservable();
  public readonly isLoading$ = this.isLoadingSubject.asObservable();


  constructor
    (
      private roiCalculatorOutputGQL: RoiCalculatorOutputGQL,
      private optimizedOutOfPocketLinearPointsGQL: OptimizedOutOfPocketLinearPointsGQL,
      private storage: StorageMap
    ) { }


  calculate(roiAggregate: RoiAggregate, roiCalculatorInput: RoiCalculatorInput): Observable<RoiCalculatorOutputModel>
  {
    // console.log('ROI CALCULATOR INPUT:', roiCalculatorInput);

    return new Observable<RoiCalculatorOutputModel>(observer =>
    {
      this.isLoadingSubject.next(true);

      this.roiCalculatorOutputGQL
        .fetch(roiCalculatorInput, CONFIG.API.SILENT_REQUEST)
        .pipe
        (
          take(1),
          tap((apolloResults: any) =>
          {
            const roiCalculatorOutput: RoiCalculatorOutputModel =
            {
              currentState: apolloResults.data.currentState,
              goalState: apolloResults.data.goalState
            };

            this.processOutput(roiAggregate, roiCalculatorInput, roiCalculatorOutput);

            observer.next(roiCalculatorOutput);
            observer.complete();
          }),
          catchError((error) =>
          {
            // console.log('CALCULATOR ERROR:', error.graphQLErrors[0]);
            observer.error(error?.graphQLErrors[0] ?? error);

            return of(error);
          }),
          finalize(() => this.isLoadingSubject.next(false))
        ).subscribe();
    });
  }

  calculatePopoverData(rocChartPlotMarker: RocChartPlotMarker): RocChartPopoverData
  {
    const rocPlotsVisibility: RocPlotsVisibility = this.plotVisibilitySubject.value;
    const roiCalculatorOutput: RoiCalculatorOutputModel = this.rocOutputSubject.value;
    const currentState: RoiCalculatorOutput = roiCalculatorOutput?.currentState;
    const goalState: RoiCalculatorOutput = roiCalculatorOutput?.goalState;

    const [mouseEvent, idx] =
      [
        rocChartPlotMarker.mouseEvent,
        rocChartPlotMarker.idx,
      ];

    const rocChartPopoverData: RocChartPopoverData = (roiCalculatorOutput)
      ?
      {
        time: currentState?.time[idx],
        mouseEvent,
        monthlySalary:
        {
          currentStateLower: currentState?.monthlySalary25?.[idx],
          currentStateMedian: currentState?.monthlySalary50?.[idx],
          currentStateUpper: currentState?.monthlySalary75?.[idx],
          goalStateLower: goalState?.monthlySalary25?.[idx],
          goalStateMedian: goalState?.monthlySalary50?.[idx],
          goalStateUpper: goalState?.monthlySalary75?.[idx],
          alumniStateValue: null, // TODO: add alumni data
        },
        // TODO: add living expenses
        monthlyLivingExpense:
        {
          currentStateMedian: null,
          currentStateCaption: this.roiCalculatorInput?.currentZipCode.toString(),
          goalStateMedian: null,
          goalStateCaption: this.roiCalculatorInput?.goalZipCode.toString(),
          alumniStateValue: null, // TODO: add alumni data
          alumniStateCaption: this.roiCalculatorInput?.goalZipCode.toString(),
        },
        monthlyLoanPayment:
        {
          currentStateMedian: null,
          currentStateCaption: null,
          goalStateMedian: goalState?.monthlyLoanPayment50?.[idx],
          goalStateCaption: null, // TODO: calculate years until loans paid
          alumniStateValue: null, // TODO: add alumni data
          alumniStateCaption: null,
        },
        monthlyDisposableIncome:
        {
          currentStateMedian: currentState?.monthlySalary50?.[idx] - 0,
          goalStateMedian:
            goalState?.monthlySalary50?.[idx] -
            goalState?.monthlyLoanPayment50?.[idx] ?? 0 - 0, // TODO: add living expenses
          alumniStateValue: null, // TODO: add alumni and living expenses data
        },
        rocPlotsVisibility,
        currentStateOccupationTitle: this.roiCalculatorInput?.currentStateOccupationTitle ?? null,
        goalStateOccupationTitle: this.roiCalculatorInput?.goalStateOccupationTitle ?? null
      }
      : null;

    return rocChartPopoverData;
  }

  clear(): void
  {
    this.storage.clear().subscribe(() => { });
    this.rocOutputSubject.next(undefined);
    this.plotDataSubject.next(undefined);
    this.plotVisibilitySubject.next(undefined);
    this.legendDataSubject.next(undefined);
    this.isLoadingSubject.next(false);
  }

  loadGraph(roiAggregate: RoiAggregate): void
  {
    if (roiAggregate.activeModel?.roiCalculatorInput && roiAggregate.activeModel?.roiCalculatorOutput)
    {
      this.processOutput(roiAggregate, roiAggregate.activeModel.roiCalculatorInput, roiAggregate.activeModel.roiCalculatorOutput);
    }
  }

  updateLegendWithModelName(modelName: string)
  {
    const rocLegendData: RocLegendData = this.legendDataSubject.value;

    const updatedLegend: RocLegendData =
    {
      ...rocLegendData,
      modelName: modelName
    };

    this.legendDataSubject.next(updatedLegend);
  }


  calculateOptimizedOutPocketLinearPoints(optimizedOutOfPocketLinearPointsInput: OptimizedOutOfPocketLinearPointsQueryVariables): Observable<OptimizedOutOfPocketLinearPoints>
  {
    return this.optimizedOutOfPocketLinearPointsGQL.fetch(optimizedOutOfPocketLinearPointsInput, CONFIG.API.SILENT_REQUEST).pipe(
      map(response =>
      {
        return response.data.optimizedOutOfPocketLinearPoints;
      }),
      catchError((error) =>
      {
        console.log('OPTIMIZED OUT OF POCKET EXPENSES ERROR:', error);
        throw new Error('OPTIMIZED OUT OF POCKET EXPENSES ERROR: ' + error);
      }),
    );
  }


  private processOutput(roiAggregate: RoiAggregate, roiCalculatorInput: RoiCalculatorInput, roiCalculatorOutput: RoiCalculatorOutputModel)
  {
    const rocPlotsVisibility: RocPlotsVisibility = this.calculateVisibility(roiCalculatorInput, roiCalculatorOutput);

    this.calculatePlotData(rocPlotsVisibility, roiCalculatorOutput);
    this.calculateLegend(roiAggregate, roiCalculatorInput, roiCalculatorOutput);

    this.rocOutputSubject.next(roiCalculatorOutput);
  }

  private calculateVisibility(roiCalculatorInput: RoiCalculatorInput, roiCalculatorOutput: RoiCalculatorOutputModel): RocPlotsVisibility
  {
    const rocPlotsVisibility: RocPlotsVisibility =
    {
      showCurrentState: roiCalculatorOutput?.currentState?.earningCumulativeProb50?.length ? true : false,
      showGoalState: roiCalculatorInput?.goalStateOnetCode?.length
        || ((roiCalculatorInput?.goalZipCode ?? roiCalculatorInput?.currentZipCode) !== roiCalculatorInput?.currentZipCode) ? true : false,
      showAlumniData: false,
      showLoanAccumulation: roiCalculatorInput?.costOfAttendanceByYear?.[0] ? true : false,
      showLoanPayoff: roiCalculatorOutput?.goalState?.outOfPocket50?.[0] ? true : false,
    };

    this.plotVisibilitySubject.next(rocPlotsVisibility);

    return rocPlotsVisibility;
  }

  private calculatePlotData(rocPlotsVisibility: RocPlotsVisibility, roiCalculatorOutput: RoiCalculatorOutputModel): void
  {
    let rocChartPlotData: RocChartPlotData = null;
    const currentState: RoiCalculatorOutput = roiCalculatorOutput?.currentState;
    const goalState: RoiCalculatorOutput = roiCalculatorOutput?.goalState;

    // console.log('roiCalculatorOutput', roiCalculatorOutput);

    // CURRENT STATE
    if (rocPlotsVisibility.showCurrentState)
    {
      rocChartPlotData =
      {
        ...rocChartPlotData,
        currentState:
        {
          primaryColor: '#0866A0',
          secondaryColor: '#E2EDF3',
          secondaryColorOpacity: 1,
          values: currentState?.time.map((t: number, i): PlotLayerValueSnapshot =>
          {
            return {
              time: t,
              earningsLower: currentState?.earningCumulativeProb25[i],
              earningsMedian: currentState?.earningCumulativeProb50[i],
              earningsUpper: currentState?.earningCumulativeProb75[i]
            };
          })
        }
      };
    }

    // GOAL STATE
    if (rocPlotsVisibility.showGoalState)
    {
      rocChartPlotData =
      {
        ...rocChartPlotData,
        goalState:
        {
          primaryColor: '#00CC08',
          secondaryColor: '#88FD8D',
          secondaryColorOpacity: 0.29, // -4A
          values: goalState?.time?.map((t: number, i): PlotLayerValueSnapshot =>
          {
            return {
              time: t,
              earningsLower: goalState?.earningCumulativeProb25[i],
              earningsMedian: goalState?.earningCumulativeProb50[i],
              earningsUpper: goalState?.earningCumulativeProb75[i]
            };
          })
        }
      };
    }

    // ALUMNI DATA (TODO)
    if (rocPlotsVisibility.showAlumniData)
    {
      // TODO: add alumni data
    }

    // TODO: only add data before graduation date
    if (rocPlotsVisibility.showLoanAccumulation)
    {
      rocChartPlotData =
      {
        ...rocChartPlotData,
        loanAccumulation:
        {
          primaryColor: '#9400A2',
          secondaryColor: '#e9d8fd',
          secondaryColorOpacity: 1,
          values: goalState?.time?.map((t: number, i): PlotLayerValueSnapshot =>
          {
            return {
              time: t,
              earningsLower: null,
              earningsMedian:
                -1 *
                (
                  // goalState?.outOfPocket50[i] +
                  goalState?.federalLoanAveraged[i] +
                  goalState?.privateLoanAveraged[i]),
              earningsUpper: null
            };
          })
        }
      };
    }

    this.plotDataSubject.next(rocChartPlotData);
  }

  private calculateLegend(roiAggregate: RoiAggregate, roiCalculatorInput: RoiCalculatorInput, roiCalculatorOutput: RoiCalculatorOutputModel): void
  {
    const currentState: RoiCalculatorOutput = roiCalculatorOutput?.currentState;
    const goalState: RoiCalculatorOutput = roiCalculatorOutput?.goalState;
    const userModel = roiAggregate.userModel;
    const activeModel = roiAggregate.activeModel;

    const rocLegendData: RocLegendData = (roiCalculatorOutput)
      ?
      {
        modelName: activeModel.name,
        currentLocation: userModel.location,
        goalLocation: activeModel.location,
        currentStateOccupationTitle: roiCalculatorInput.currentStateOccupationTitle,
        goalStateOccupationTitle: roiCalculatorInput.goalStateOccupationTitle,
        currentStateDegreeLevel: userModel?.educationLevel,
        goalStateDegreeLevel: activeModel?.degreeLevel,
        goalStateDegreeProgram: activeModel?.degreeProgram,
        currentStateLifetimeEarningLower: currentState?.earningCumulativeProb25?.[currentState?.earningCumulativeProb25?.length - 1],
        currentStateLifetimeEarningUpper: currentState?.earningCumulativeProb75?.[currentState?.earningCumulativeProb75?.length - 1],
        goalStateLifetimeEarningLower: goalState?.earningCumulativeProb25?.[goalState?.earningCumulativeProb25?.length - 1],
        goalStateLifetimeEarningUpper: goalState?.earningCumulativeProb75?.[goalState?.earningCumulativeProb75?.length - 1],
        investmentLower: goalState?.investment25,
        investmentUpper: goalState?.investment75,
        totalLoanAmount: activeModel.getTotalLoanAmount(),
        lifeRoiLower: goalState?.lifeRevenue25,
        lifeRoiUpper: goalState?.lifeRevenue75,
        lifeRoiPercentLower: goalState?.roi25?.[goalState?.roi25?.length - 1],
        lifeRoiPercentUpper: goalState?.roi75?.[goalState?.roi75?.length - 1],
        annualizedRoiPercentLower: goalState?.lifeAnnualizedRoi25,
        annualizedRoiPercentUpper: goalState?.lifeAnnualizedRoi75,
      }
      : null;

    this.legendDataSubject.next(rocLegendData);
  }
}
