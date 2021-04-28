import { KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RoiCollectionFacadeService } from '@app/+state/roi-collection';
import { ShareRoiAggregateModel } from '@app/+state/roi-collection/state';
import { NavigationService } from '@app/core/services';
import { RoiModelDto } from '@app/domain';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'roc-share-model',
  templateUrl: './share-model.component.html',
  styleUrls: ['./share-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareModelComponent implements OnInit
{
  formGroup: FormGroup;

  shareRoiAggregateModel: ShareRoiAggregateModel;
  roiModelList$: Observable<RoiModelDto[]>;


  constructor
    (
      private formBuilder: FormBuilder,
      private roiCollectionFacadeService: RoiCollectionFacadeService,
      private navigationService: NavigationService
    ) { }

  ngOnInit()
  {
    this.buildForm();
    this.roiModelList$ = this.roiCollectionFacadeService.getRoiModelList$();

    this.roiCollectionFacadeService.getInProgressShareRoiAggregateModel$()
      .pipe
      (
        take(1),
        map((item: ShareRoiAggregateModel) => this.shareRoiAggregateModel = item)
      ).subscribe();
  }

  onSaveClick(): void
  {
    if (this.formGroup.valid)
    {
      const shareRoiAggregateModel: ShareRoiAggregateModel =
      {
        tenantId: this.shareRoiAggregateModel.tenantId,
        tenantHostName: this.shareRoiAggregateModel.tenantHostName,
        sharedFromUserId: this.shareRoiAggregateModel.sharedFromUserId,
        sharedFromUserName: this.shareRoiAggregateModel.sharedFromUserName,
        roiAggregateId: this.shareRoiAggregateModel.roiAggregateId,
        firstName: this.formGroup.controls.firstName.value,
        lastName: this.formGroup.controls.lastName.value,
        emailAddress: this.formGroup.controls.emailAddress.value,
        note: this.formGroup.controls.note.value
      };

      this.roiCollectionFacadeService.shareRoiAggregate(shareRoiAggregateModel);
    }
  }

  // Preserve original property order
  originalOrder = (_a: KeyValue<number, string>, _b: KeyValue<number, string>): number =>
  {
    return 0;
  };

  onCancelClick(): void
  {
    this.roiCollectionFacadeService.clearInProgressShareModel();
    this.navigationService.goToModelingPage();
  }



  private buildForm()
  {
    this.formGroup = this.formBuilder.group
      ({
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required]),
        emailAddress: new FormControl('', [Validators.required, Validators.email]),
        note: new FormControl('')
      });
  }

}
