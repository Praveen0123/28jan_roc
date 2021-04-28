import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'roc-lib-feedback-form',
  templateUrl: './dialog-feedback-form.component.html',
  styleUrls: ['./dialog-feedback-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DialogFeedbackFormComponent implements OnInit
{


  suggestionForm: FormGroup;
  applicationDefectForm: FormGroup;
  complimentForm: FormGroup;
  generalQuestionForm: FormGroup;


  feedbackSelectedValue: any;

  //  DROPDOWN SELECTION ARRAY FOR FEEDBACK FORM
  feedbackFormAbout = [
    'Application defect',
    'Suggestion',
    'Compliment',
    'General Question',

  ];


  constructor(public dialogRef: MatDialogRef<DialogFeedbackFormComponent>, private fb: FormBuilder,
  )
  {
    this.createsapplicationDefectForm();
    this.createSuggestionForm();
    this.createComplimentForm();
    this.createGeneralQuestionForm();
  }

  // FIRST : APPLICATION DEFECT FORM
  createsapplicationDefectForm()
  {
    this.applicationDefectForm = this.fb.group({

      applicationDefectYourName: new FormControl('', [Validators.required]),

      applicationDefectemail: new FormControl('', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),

      applicationDefectdescription: new FormControl('', [Validators.required]),
      applicationDefectErrorCode: new FormControl('', [Validators.required]),

    });
  }

  // SECOND : SUGGESTION FORM
  createSuggestionForm()
  {
    this.suggestionForm = this.fb.group({

      suggestionYourName: new FormControl('', [Validators.required]),
      suggestionEmail: new FormControl('', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      suggestion: new FormControl('', [Validators.required]),

    });

  }

  // THIRD : COMPLIMENT FORM
  createComplimentForm()
  {
    this.complimentForm = this.fb.group({

      complimentYourName: new FormControl('', [Validators.required]),
      complimentEmail: new FormControl('', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      positiveExperience: new FormControl('', [Validators.required]),

    });

  }

  // FOURTH : GENERAL QUESTION FORM
  createGeneralQuestionForm()
  {
    this.generalQuestionForm = this.fb.group({

      generalQuestionyourName: new FormControl('', [Validators.required]),
      generalQuestionGmail: new FormControl('', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      provideYouQuestion: new FormControl('', [Validators.required]),

    });

  }

  ngOnInit(): void
  {
  }


  // Feedback about selected value
  feedbackSelected(selectedValue: MatSelectChange): void
  {
    console.log(selectedValue, "selected");
    this.feedbackSelectedValue = selectedValue;
  }



  // SUBMITTION OF FORMS
  applicationFormSubmit()
  {

    if (this.feedbackSelectedValue === 'Application defect')
    {

      this.defectFormSubmit();

    }
    else if (this.feedbackSelectedValue === 'Suggestion')
    {

      this.suggestionFormSubmit();
    }

    else if (this.feedbackSelectedValue === 'Compliment')
    {

      this.complimentFormSubmit();
    }

    else if (this.feedbackSelectedValue === 'General Question')
    {

      console.log("question", this.feedbackSelectedValue);
      this.generalQuestionFormSubmit();
    }
    else
    {
      this.dialogRef.close(null);
    }
  }

  defectFormSubmit()
  {
    const submitFormData1 = {
      name: this.applicationDefectForm.controls.applicationDefectYourName.value,
      email: this.applicationDefectForm.controls.applicationDefectemail.value,
      comment: this.applicationDefectForm.controls.applicationDefectdescription.value,
      error: this.applicationDefectForm.controls.applicationDefectErrorCode.value,
      submission: this.feedbackSelectedValue
    };
    this.dialogRef.close(submitFormData1);
  }
  suggestionFormSubmit()
  {
    const submitFormData2 = {
      name: this.suggestionForm.controls.suggestionYourName.value,
      email: this.suggestionForm.controls.suggestionEmail.value,
      comment: this.suggestionForm.controls.suggestion.value,
      submission: this.feedbackSelectedValue
    };
    this.dialogRef.close(submitFormData2);
  }

  complimentFormSubmit()
  {
    const submitFormData3 = {
      name: this.complimentForm.controls.complimentYourName.value,
      email: this.complimentForm.controls.complimentEmail.value,
      comment: this.complimentForm.controls.positiveExperience.value,
      submission: this.feedbackSelectedValue
    };
    this.dialogRef.close(submitFormData3);
  }

  generalQuestionFormSubmit()
  {
    const submitFormData4 = {
      name: this.generalQuestionForm.controls.generalQuestionyourName.value,
      email: this.generalQuestionForm.controls.generalQuestionGmail.value,
      comment: this.generalQuestionForm.controls.provideYouQuestion.value,
      submission: this.feedbackSelectedValue
    };
    this.dialogRef.close(submitFormData4);
  }
}
