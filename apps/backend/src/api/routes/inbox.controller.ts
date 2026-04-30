import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { SocialInboxService } from '@gitroom/nestjs-libraries/database/prisma/social-inbox/social-inbox.service';
import { Request, Response } from 'express';

@ApiTags('Inbox')
@Controller('/inbox')
export class InboxController {
  constructor(private _socialInboxService: SocialInboxService) {}

  @Get('/integrations')
  getIntegrations(@GetOrgFromRequest() org: Organization) {
    return this._socialInboxService.getInboxIntegrations(org.id);
  }

  @Post('/sync/:integrationId')
  syncIntegration(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string
  ) {
    return this._socialInboxService.syncIntegration(org.id, integrationId);
  }

  @Get('/conversations')
  getConversations(
    @GetOrgFromRequest() org: Organization,
    @Query('integrationId') integrationId?: string
  ) {
    return this._socialInboxService.getConversations(org.id, integrationId);
  }

  @Get('/conversations/:conversationId/messages')
  getMessages(
    @GetOrgFromRequest() org: Organization,
    @Param('conversationId') conversationId: string
  ) {
    return this._socialInboxService.getMessages(org.id, conversationId);
  }

  @Post('/conversations/:conversationId/reply')
  reply(
    @GetOrgFromRequest() org: Organization,
    @Param('conversationId') conversationId: string,
    @Body() body: { message: string }
  ) {
    return this._socialInboxService.reply(org.id, conversationId, body.message);
  }
}

@ApiTags('Inbox')
@Controller('/integrations/facebook-inbox/webhook')
export class FacebookInboxWebhookController {
  constructor(private _socialInboxService: SocialInboxService) {}

  @Get('/')
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response
  ) {
    const response = this._socialInboxService.verifyFacebookWebhook(
      mode,
      verifyToken,
      challenge
    );
    return res.status(200).send(response);
  }

  @Post('/')
  async ingest(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-hub-signature-256') signature: string,
    @Body() body: any,
    @Res() res: Response
  ) {
    await this._socialInboxService.ingestFacebookWebhook(
      body,
      req.rawBody,
      signature
    );
    return res.status(200).send({ received: true });
  }
}
