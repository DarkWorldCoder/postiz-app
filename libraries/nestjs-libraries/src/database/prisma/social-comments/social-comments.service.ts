import { Injectable } from '@nestjs/common';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { SocialCommentsRepository } from '@gitroom/nestjs-libraries/database/prisma/social-comments/social-comments.repository';

type ModerationAction = 'HIDE' | 'AUTO_REPLY' | 'FLAG' | 'DELETE';

export interface PlatformComment {
  externalCommentId: string;
  parentCommentId?: string;
  authorId: string;
  authorName: string;
  authorPicture?: string;
  content: string;
  likeCount?: number;
  isHidden?: boolean;
  createdAt: string; // ISO date string
  replies?: PlatformComment[];
}

@Injectable()
export class SocialCommentsService {
  constructor(
    private _commentsRepository: SocialCommentsRepository,
    private _integrationManager: IntegrationManager
  ) {}

  /**
   * Fetch comments from the platform and sync them to our database
   */
  async syncComments(orgId: string, integrationId: string, postReleaseId: string) {
    const integration = await this._commentsRepository.getIntegrationById(
      orgId,
      integrationId
    );
    if (!integration) {
      throw new Error('Integration not found');
    }

    const provider: any = this._integrationManager.getSocialIntegration(
      integration.providerIdentifier
    );

    if (!provider.fetchComments) {
      throw new Error(
        `${integration.providerIdentifier} does not support comment fetching`
      );
    }

    const platformComments: PlatformComment[] = await provider.fetchComments(
      integration.internalId,
      integration.token,
      postReleaseId
    );

    // Get moderation rules for this org
    const moderationRules =
      await this._commentsRepository.getModerationRules(orgId);
    const activeRules = moderationRules.filter((r: any) => r.isActive);

    // Upsert each comment and its replies
    for (const comment of platformComments) {
      const upserted = await this._commentsRepository.upsertComment({
        integrationId,
        postReleaseId,
        externalCommentId: comment.externalCommentId,
        authorId: comment.authorId,
        authorName: comment.authorName,
        authorPicture: comment.authorPicture,
        content: comment.content,
        likeCount: comment.likeCount,
        isHidden: comment.isHidden,
        platformCreatedAt: new Date(comment.createdAt),
      });

      // Apply moderation rules to new comments
      await this.applyModerationRules(
        activeRules,
        comment,
        integration,
        provider
      );

      // Sync replies
      if (comment.replies?.length) {
        for (const reply of comment.replies) {
          await this._commentsRepository.upsertComment({
            integrationId,
            postReleaseId,
            externalCommentId: reply.externalCommentId,
            parentCommentId: upserted.id,
            authorId: reply.authorId,
            authorName: reply.authorName,
            authorPicture: reply.authorPicture,
            content: reply.content,
            likeCount: reply.likeCount,
            isHidden: reply.isHidden,
            platformCreatedAt: new Date(reply.createdAt),
          });
        }
      }
    }

    return this._commentsRepository.getCommentsByPost(
      integrationId,
      postReleaseId
    );
  }

  /**
   * Get comments for a specific post from the database
   */
  async getComments(orgId: string, integrationId: string, postReleaseId: string) {
    // Verify the integration belongs to this org
    const integration = await this._commentsRepository.getIntegrationById(
      orgId,
      integrationId
    );
    if (!integration) {
      throw new Error('Integration not found');
    }

    return this._commentsRepository.getCommentsByPost(
      integrationId,
      postReleaseId
    );
  }

  /**
   * Get all comments across integrations for an organization
   */
  async getAllComments(
    orgId: string,
    integrationId?: string,
    page = 1,
    limit = 50
  ) {
    return this._commentsRepository.getCommentsByIntegration(
      orgId,
      integrationId,
      page,
      limit
    );
  }

  /**
   * Reply to a comment on the platform
   */
  async replyToComment(
    orgId: string,
    commentId: string,
    message: string
  ) {
    const comment = await this._commentsRepository.getCommentById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    const integration = comment.integration;
    if (integration.organizationId !== orgId) {
      throw new Error('Unauthorized');
    }

    const provider: any = this._integrationManager.getSocialIntegration(
      integration.providerIdentifier
    );

    if (!provider.replyToExternalComment) {
      throw new Error(
        `${integration.providerIdentifier} does not support replying to comments`
      );
    }

    const result = await provider.replyToExternalComment(
      integration.internalId,
      integration.token,
      comment.externalCommentId,
      message
    );

    // Save the reply locally too
    if (result?.commentId) {
      await this._commentsRepository.upsertComment({
        integrationId: integration.id,
        postReleaseId: comment.postReleaseId,
        externalCommentId: result.commentId,
        parentCommentId: comment.id,
        authorId: integration.internalId,
        authorName: integration.name,
        authorPicture: integration.picture || undefined,
        content: message,
        platformCreatedAt: new Date(),
      });
    }

    return { success: true, ...result };
  }

  /**
   * Hide or unhide a comment on the platform (Facebook)
   */
  async hideComment(orgId: string, commentId: string, hide: boolean) {
    const comment = await this._commentsRepository.getCommentById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    const integration = comment.integration;
    if (integration.organizationId !== orgId) {
      throw new Error('Unauthorized');
    }

    const provider: any = this._integrationManager.getSocialIntegration(
      integration.providerIdentifier
    );

    if (!provider.hideExternalComment) {
      throw new Error(
        `${integration.providerIdentifier} does not support hiding comments`
      );
    }

    await provider.hideExternalComment(
      integration.internalId,
      integration.token,
      comment.externalCommentId,
      hide
    );

    await this._commentsRepository.updateCommentHidden(
      integration.id,
      comment.externalCommentId,
      hide
    );

    return { success: true, isHidden: hide };
  }

  /**
   * Delete a comment on the platform (Instagram — own comments only)
   */
  async deleteComment(orgId: string, commentId: string) {
    const comment = await this._commentsRepository.getCommentById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    const integration = comment.integration;
    if (integration.organizationId !== orgId) {
      throw new Error('Unauthorized');
    }

    const provider: any = this._integrationManager.getSocialIntegration(
      integration.providerIdentifier
    );

    if (!provider.deleteExternalComment) {
      throw new Error(
        `${integration.providerIdentifier} does not support deleting comments`
      );
    }

    await provider.deleteExternalComment(
      integration.internalId,
      integration.token,
      comment.externalCommentId
    );

    await this._commentsRepository.softDeleteComment(
      integration.id,
      comment.externalCommentId
    );

    return { success: true };
  }

  async likeComment(orgId: string, commentId: string, like = true) {
    const comment = await this._commentsRepository.getCommentById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    const integration = comment.integration;
    if (integration.organizationId !== orgId) {
      throw new Error('Unauthorized');
    }

    const provider: any = this._integrationManager.getSocialIntegration(
      integration.providerIdentifier
    );

    if (!provider.likeExternalComment) {
      throw new Error(
        `${integration.providerIdentifier} does not support liking comments`
      );
    }

    return provider.likeExternalComment(
      integration.internalId,
      integration.token,
      comment.externalCommentId,
      like
    );
  }

  /**
   * Get published posts that can have comments fetched
   */
  async getPostsWithComments(orgId: string, integrationId: string) {
    return this._commentsRepository.getPublishedPostsByIntegration(
      orgId,
      integrationId
    );
  }

  // ── Moderation Rules ──────────────────────────

  async getModerationRules(orgId: string) {
    return this._commentsRepository.getModerationRules(orgId);
  }

  async createModerationRule(
    orgId: string,
    data: {
      name: string;
      action: ModerationAction;
      keywords: string[];
      replyTemplate?: string;
    }
  ) {
    return this._commentsRepository.createModerationRule({
      organizationId: orgId,
      name: data.name,
      action: data.action,
      keywords: JSON.stringify(data.keywords),
      replyTemplate: data.replyTemplate,
    });
  }

  async updateModerationRule(
    orgId: string,
    ruleId: string,
    data: {
      name?: string;
      action?: ModerationAction;
      keywords?: string[];
      replyTemplate?: string;
      isActive?: boolean;
    }
  ) {
    const updateData: any = { ...data };
    if (data.keywords) {
      updateData.keywords = JSON.stringify(data.keywords);
    }
    return this._commentsRepository.updateModerationRule(
      orgId,
      ruleId,
      updateData
    );
  }

  async deleteModerationRule(orgId: string, ruleId: string) {
    return this._commentsRepository.deleteModerationRule(orgId, ruleId);
  }

  // ── Private Helpers ───────────────────────────

  private async applyModerationRules(
    rules: any[],
    comment: PlatformComment,
    integration: any,
    provider: any
  ) {
    for (const rule of rules) {
      const keywords: string[] = JSON.parse(rule.keywords);
      const contentLower = comment.content.toLowerCase();
      const matches = keywords.some((kw) =>
        contentLower.includes(kw.toLowerCase())
      );

      if (!matches) continue;

      try {
        switch (rule.action as ModerationAction) {
          case 'HIDE':
            if (provider.hideExternalComment) {
              await provider.hideExternalComment(
                integration.internalId,
                integration.token,
                comment.externalCommentId,
                true
              );
            }
            break;

          case 'AUTO_REPLY':
            if (rule.replyTemplate && provider.replyToExternalComment) {
              await provider.replyToExternalComment(
                integration.internalId,
                integration.token,
                comment.externalCommentId,
                rule.replyTemplate
              );
            }
            break;

          case 'DELETE':
            if (provider.deleteExternalComment) {
              await provider.deleteExternalComment(
                integration.internalId,
                integration.token,
                comment.externalCommentId
              );
            }
            break;

          case 'FLAG':
            // Just mark sentiment as flagged — no platform action
            break;
        }
      } catch (err) {
        console.error(
          `Moderation rule "${rule.name}" failed for comment ${comment.externalCommentId}:`,
          err
        );
      }
    }
  }
}
