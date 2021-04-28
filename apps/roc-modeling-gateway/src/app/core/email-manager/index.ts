import { ShareInput } from '@roc-modeling-gateway-models';
import { ClientResponse } from '@sendgrid/client/src/response';
import sgMail from '@sendgrid/mail';
import { Result } from '@vantage-point/ddd-core';

import { CONFIG } from '../../config/config';
import { TenantError } from '../../modules/tenant/errors';


export interface EmailToSendModel
{
  firstName: string;
  lastName: string;
  toEmailAddress: string;
  fromEmailAddress: string;
  sharedFrom: string;
  tenantUrl: string;
  emailTemplateId: EmailTemplateEnum;
}

export enum EmailTemplateEnum
{
  SHARE_EXISTING_USER = 'share_existing_user',
  WELCOME_MESSAGE = 'welcome_message'
}


export class EmailService
{
  private constructor()
  {
  }

  static create(): EmailService
  {
    return new EmailService();
  }

  async sendShareWithExistingUserEmailAsync(input: ShareInput): Promise<Result<[ClientResponse, {}]>>
  {
    // SEND WELCOME EMAIL:
    const emailToSendModel: EmailToSendModel =
    {
      firstName: input.firstName,
      lastName: input.lastName,
      toEmailAddress: input.emailAddress,
      fromEmailAddress: CONFIG.SEND_GRID.FROM_EMAIL_ADDRESS,
      sharedFrom: input.sharedFromUserName,
      tenantUrl: `https://${input.tenantHostName}`,
      emailTemplateId: EmailTemplateEnum.SHARE_EXISTING_USER
    };

    return this.sendEmailAsync(emailToSendModel);
  }

  async sendWelcomeEmailAsync(input: ShareInput): Promise<Result<[ClientResponse, {}]>>
  {
    // SEND WELCOME EMAIL:
    const emailToSendModel: EmailToSendModel =
    {
      firstName: input.firstName,
      lastName: input.lastName,
      toEmailAddress: input.emailAddress,
      fromEmailAddress: CONFIG.SEND_GRID.FROM_EMAIL_ADDRESS,
      sharedFrom: input.sharedFromUserName,
      tenantUrl: `https://${input.tenantHostName}`,
      emailTemplateId: EmailTemplateEnum.WELCOME_MESSAGE
    };

    return this.sendEmailAsync(emailToSendModel);
  }

  async sendEmailAsync(emailToSendModel: EmailToSendModel): Promise<Result<[ClientResponse, {}]>>
  {

    if (!CONFIG.SEND_GRID.API_KEY)
    {
      throw new Error(' ********** Please check environment configuration.   Looks like missing a SEND GRID API variable ********** ');
    }

    try
    {
      sgMail.setApiKey(CONFIG.SEND_GRID.API_KEY);

      const templates =
      {
        welcome_message: "d-498c8d6861e042199078065cb28b9db8",
        share_existing_user: "d-3aa5e8b76b484f428e2128eff9ceb6b7"
      };

      const msg =
      {
        to: emailToSendModel.toEmailAddress,
        from: emailToSendModel.fromEmailAddress,
        templateId: templates[emailToSendModel.emailTemplateId],
        dynamic_template_data:
        {
          firstName: emailToSendModel.firstName,
          lastName: emailToSendModel.lastName,
          sharedFrom: emailToSendModel.sharedFrom,
          tenantUrl: emailToSendModel.tenantUrl
        }
      };

      const result: [ClientResponse, {}] = await sgMail.send(msg);

      return Result.success<[ClientResponse, {}]>(result);
    }
    catch (error)
    {
      const tenantError: TenantError = new TenantError(error);

      return Result.failure<[ClientResponse, {}]>(tenantError);
    }

  }
}


export const emailService: EmailService = EmailService.create();
