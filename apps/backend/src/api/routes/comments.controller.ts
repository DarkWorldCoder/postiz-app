import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { SocialCommentsService } from '@gitroom/nestjs-libraries/database/prisma/social-comments/social-comments.service';

@ApiTags('Comments')
@Controller('/comments')
export class CommentsController {
  constructor(private _commentsService: SocialCommentsService) {}

  /**
   * Get all comments across the organization, optionally filtered by integration
   */
  @Get('/')
  getAllComments(
    @GetOrgFromRequest() org: Organization,
    @Query('integrationId') integrationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this._commentsService.getAllComments(
      org.id,
      integrationId,
      page ? +page : 1,
      limit ? +limit : 50
    );
  }

  /**
   * Get published posts for an integration (to select which post to view comments for)
   */
  @Get('/posts/:integrationId')
  getPostsWithComments(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string
  ) {
    return this._commentsService.getPostsWithComments(org.id, integrationId);
  }

  /**
   * Get comments for a specific post (from local DB)
   */
  @Get('/:integrationId/:postReleaseId')
  getComments(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string,
    @Param('postReleaseId') postReleaseId: string
  ) {
    return this._commentsService.getComments(org.id, integrationId, postReleaseId);
  }

  /**
   * Sync comments from the platform for a specific post
   */
  @Post('/sync/:integrationId/:postReleaseId')
  syncComments(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string,
    @Param('postReleaseId') postReleaseId: string
  ) {
    return this._commentsService.syncComments(
      org.id,
      integrationId,
      postReleaseId
    );
  }

  /**
   * Reply to a comment
   */
  @Post('/:commentId/reply')
  replyToComment(
    @GetOrgFromRequest() org: Organization,
    @Param('commentId') commentId: string,
    @Body() body: { message: string }
  ) {
    return this._commentsService.replyToComment(
      org.id,
      commentId,
      body.message
    );
  }

  /**
   * Hide or unhide a comment (Facebook)
   */
  @Post('/:commentId/hide')
  hideComment(
    @GetOrgFromRequest() org: Organization,
    @Param('commentId') commentId: string,
    @Body() body: { hide: boolean }
  ) {
    return this._commentsService.hideComment(org.id, commentId, body.hide);
  }

  /**
   * Delete a comment (Instagram — own comments only)
   */
  @Delete('/:commentId')
  deleteComment(
    @GetOrgFromRequest() org: Organization,
    @Param('commentId') commentId: string
  ) {
    return this._commentsService.deleteComment(org.id, commentId);
  }

  /**
   * Like or unlike a comment where supported by the platform
   */
  @Post('/:commentId/like')
  likeComment(
    @GetOrgFromRequest() org: Organization,
    @Param('commentId') commentId: string,
    @Body() body: { like?: boolean }
  ) {
    return this._commentsService.likeComment(
      org.id,
      commentId,
      body.like !== false
    );
  }

  // ── Moderation Rules ──────────────────────────

  /**
   * Get all moderation rules
   */
  @Get('/moderation/rules')
  getModerationRules(@GetOrgFromRequest() org: Organization) {
    return this._commentsService.getModerationRules(org.id);
  }

  /**
   * Create a moderation rule
   */
  @Post('/moderation/rules')
  createModerationRule(
    @GetOrgFromRequest() org: Organization,
    @Body()
    body: {
      name: string;
      action: 'HIDE' | 'AUTO_REPLY' | 'FLAG' | 'DELETE';
      keywords: string[];
      replyTemplate?: string;
    }
  ) {
    return this._commentsService.createModerationRule(org.id, body as any);
  }

  /**
   * Update a moderation rule
   */
  @Put('/moderation/rules/:ruleId')
  updateModerationRule(
    @GetOrgFromRequest() org: Organization,
    @Param('ruleId') ruleId: string,
    @Body()
    body: {
      name?: string;
      action?: 'HIDE' | 'AUTO_REPLY' | 'FLAG' | 'DELETE';
      keywords?: string[];
      replyTemplate?: string;
      isActive?: boolean;
    }
  ) {
    return this._commentsService.updateModerationRule(
      org.id,
      ruleId,
      body as any
    );
  }

  /**
   * Delete a moderation rule
   */
  @Delete('/moderation/rules/:ruleId')
  deleteModerationRule(
    @GetOrgFromRequest() org: Organization,
    @Param('ruleId') ruleId: string
  ) {
    return this._commentsService.deleteModerationRule(org.id, ruleId);
  }
}
