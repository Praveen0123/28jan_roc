import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { otherFeedbackForm } from '@app/core/models/feedback-form/feedback-form';
import { applicationDefectForm } from '@app/core/models/feedback-form/feedback-form';

@Injectable({
  providedIn: 'root'
})
export class FeedbackFormService
{
  apiKey = 'qrSTy1k90xg2Ay7a';

  // api urls
  apiUrlForDefect: string = "https://vantagepointinc.secure.force.com/vpapi/services/apexrest/roc/feedback-form?type=defect";
  apiUrlForSuggestion: string = "https://vantagepointinc.secure.force.com/vpapi/services/apexrest/roc/feedback-form?type=suggestion";

  apiUrlForCompliment: string = "https://vantagepointinc.secure.force.com/vpapi/services/apexrest/roc/feedback-form?type=compliment";
  apiUrlForQuestion: string = "https://vantagepointinc.secure.force.com/vpapi/services/apexrest/roc/feedback-form?type=question";


  constructor(private http: HttpClient) { }


  // Defect
  postFeedBackForApplicationdefect(myFormData: applicationDefectForm)
  {
    let headers = new HttpHeaders({ 'AuthorizationToken': this.apiKey });

    headers.append('Content-Type', 'application/json');
    return this.http.post(this.apiUrlForDefect, myFormData, { headers: headers });
  }

  // Suggestion
  postFeedBackForSuggestion(myFormData: otherFeedbackForm)
  {
    let headers = new HttpHeaders({ 'AuthorizationToken': this.apiKey });

    headers.append('Content-Type', 'application/json');
    return this.http.post(this.apiUrlForSuggestion, myFormData, { headers: headers });
  }

  // Compliment

  postFeedBackForCompliment(myFormData: otherFeedbackForm)
  {
    let headers = new HttpHeaders({ 'AuthorizationToken': this.apiKey });

    headers.append('Content-Type', 'application/json');
    return this.http.post(this.apiUrlForCompliment, myFormData, { headers: headers });
  }

  // Question

  postFeedBackForQuestion(myFormData: otherFeedbackForm)
  {
    let headers = new HttpHeaders({ 'AuthorizationToken': this.apiKey });

    headers.append('Content-Type', 'application/json');
    return this.http.post(this.apiUrlForQuestion, myFormData, { headers: headers });
  }
}
