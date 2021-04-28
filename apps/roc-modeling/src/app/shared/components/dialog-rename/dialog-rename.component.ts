import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'roc-dialog-rename',
  templateUrl: './dialog-rename.component.html',
  styleUrls: ['./dialog-rename.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogRenameComponent implements OnInit
{
  formGroup: FormGroup;

  constructor
    (
      private formBuilder: FormBuilder,
      private dialogRef: MatDialogRef<DialogRenameComponent>,
      @Inject(MAT_DIALOG_DATA) public data: string
    ) { }

  ngOnInit(): void
  {
    this.buildForm();
  }

  clearNameValue()
  {
    this.formGroup.controls.name.patchValue('');
  }

  onCancelClick(): void
  {
    this.dialogRef.close();
  }

  onSaveClick(): void
  {
    if (this.formGroup.valid)
    {
      this.dialogRef.close(this.formGroup.controls.name.value);
    }
  }


  private buildForm()
  {
    this.formGroup = this.formBuilder.group
      ({
        name: new FormControl(this.data, [Validators.required])
      });
  }
}
