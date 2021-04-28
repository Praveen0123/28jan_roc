import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackFormService } from '@app/core/services/feedback/feedback-form.service';
import { NotificationService } from '@app/core/services/notification/notification.service';
import { DialogAboutDataComponent, DialogAboutToolComponent, DialogGlossaryOfTermsComponent, DialogReleaseScheduleComponent } from '@returnon-college/roc-dialogs';

import { DialogFeedbackFormComponent } from 'libs/roc-dialogs/src/lib/dialogs/dialog-feedback-form/dialog-feedback-form.component';

// import { UseCaseError } from '@vantage-point/ddd-core';

@Component({
  selector: 'roc-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit
{

  constructor
    (
      private dialog: MatDialog, private _feedbackForm: FeedbackFormService, private notificationService: NotificationService
    ) { }

  ngOnInit(): void
  {
  }

  openAboutDataDialog()
  {
    this.dialog.open(DialogAboutDataComponent);
  }

  openAboutToolDialog()
  {
    this.dialog.open(DialogAboutToolComponent);
  }

  openGlossaryOfTermsDialog()
  {
    this.dialog.open(DialogGlossaryOfTermsComponent);
  }

  openReleaseScheduleDialog()
  {
    this.dialog.open(DialogReleaseScheduleComponent);
  }


  openDialogFeedbackForm()
  {
    this.dialog.open(DialogFeedbackFormComponent).afterClosed().subscribe((result) =>
    {
      console.log('check praveen', result);

      // application defect
      if (result.submission === 'Application defect')
      {
        delete result.submission;


        this._feedbackForm.postFeedBackForApplicationdefect(result).subscribe((data) =>
        {
          if (data)
          {
            this.notificationService.success("Thank you, Issue has been logged and you will receive an email when it has been resolved..");
            console.log("i'm from service defect.........", data, result);
          }
          else
            this.notificationService.error;
          return data;
        });
      }

      // Suggestion
      else if (result.submission === 'Suggestion')
      {
        delete result.submission;

        this._feedbackForm.postFeedBackForSuggestion(result).subscribe((data) =>
        {

          if (data)
          {
            this.notificationService.success("Thank you, Suggestion has been logged. ");
            console.log("i'm from service suggestion.........", data, result);
          }
          else
            this.notificationService.error;
          return data;
        });
      }

      //  Compliment
      else if (result.submission === 'Compliment')
      {
        delete result['submission'];
        this._feedbackForm.postFeedBackForCompliment(result).subscribe((data) =>
        {
          if (data)
          {
            this.notificationService.success("Thank you, Compliment has been logged. ");
            console.log("i'm from service compliment.........", data, result);
          }
          else
            this.notificationService.error;
          return data;
        });
      }

      // Question
      else if (result.submission === 'General Question')
      {
        delete result.submission;
        this._feedbackForm.postFeedBackForQuestion(result).subscribe((data) =>
        {
          if (data)
          {
            this.notificationService.success("Thank you, Question has been logged and will be responded to within 1 business day. ");
            console.log("i'm from service Question.........", data, result);
          }
          else
            this.notificationService.error;
          return data;
        });
      }

    });
  }
}
