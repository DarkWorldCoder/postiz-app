import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';

export interface UpsertCommentData {
  integrationId: string;
  postReleaseId: string;
  externalCommentId: string;
  parentCommentId?: string;
  authorId: string;
  authorName: string;
  authorPicture?: string;
  content: string;
  likeCount?: number;
  isHidden?: boolean;
  sentiment?: string;
  platformCreatedAt: Date;
}

@Injectable()
export class SocialCommentsRepository {
  constructor(
    private _comment: PrismaRepository<'socialComment'>,
    private _rule: PrismaRepository<'commentModerationRule'>,
    private _integration: PrismaRepository<'integration'>,
    private _post: PrismaRepository<'post'>
  ) {}

  async upsertComment(data: UpsertCommentData) {
    return this._comment.model.socialComment.upsert({
      where: {
        integrationId_externalCommentId: {
          integrationId: data.integrationId,
          externalCommentId: data.externalCommentId,
        },
      },
      create: {
        integrationId: data.integrationId,
        postReleaseId: data.postReleaseId,
        externalCommentId: data.externalCommentId,
        parentCommentId: data.parentCommentId,
        authorId: data.authorId,
        authorName: data.authorName,
        authorPicture: data.authorPicture,
        content: data.content,
        likeCount: data.likeCount || 0,
        isHidden: data.isHidden || false,
        sentiment: data.sentiment,
        platformCreatedAt: data.platformCreatedAt,
      },
      update: {
        content: data.content,
        likeCount: data.likeCount || 0,
        isHidden: data.isHidden || false,
        sentiment: data.sentiment,
        authorName: data.authorName,
        authorPicture: data.authorPicture,
        syncedAt: new Date(),
      },
    });
  }

  async getCommentsByPost(integrationId: string, postReleaseId: string) {
    return this._comment.model.socialComment.findMany({
      where: {
        integrationId,
        postReleaseId,
        deletedAt: null,
        parentCommentId: null, // top-level comments only
      },
      include: {
        replies: {
          where: { deletedAt: null },
          orderBy: { platformCreatedAt: 'asc' },
        },
      },
      orderBy: { platformCreatedAt: 'desc' },
    });
  }

  async getCommentsByIntegration(
    orgId: string,
    integrationId?: string,
    page = 1,
    limit = 50
  ) {
    const where: any = {
      deletedAt: null,
      parentCommentId: null,
      integration: { organizationId: orgId, deletedAt: null },
    };
    if (integrationId) {
      where.integrationId = integrationId;
    }

    const [comments, total] = await Promise.all([
      this._comment.model.socialComment.findMany({
        where,
        include: {
          replies: {
            where: { deletedAt: null },
            orderBy: { platformCreatedAt: 'asc' },
          },
          integration: {
            select: {
              id: true,
              name: true,
              providerIdentifier: true,
              picture: true,
            },
          },
        },
        orderBy: { platformCreatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this._comment.model.socialComment.count({ where }),
    ]);

    return { comments, total, page, limit };
  }

  async updateCommentHidden(
    integrationId: string,
    externalCommentId: string,
    isHidden: boolean
  ) {
    return this._comment.model.socialComment.update({
      where: {
        integrationId_externalCommentId: {
          integrationId,
          externalCommentId,
        },
      },
      data: { isHidden },
    });
  }

  async softDeleteComment(
    integrationId: string,
    externalCommentId: string
  ) {
    return this._comment.model.socialComment.update({
      where: {
        integrationId_externalCommentId: {
          integrationId,
          externalCommentId,
        },
      },
      data: { deletedAt: new Date() },
    });
  }

  async getCommentById(id: string) {
    return this._comment.model.socialComment.findUnique({
      where: { id },
      include: {
        integration: true,
        replies: {
          where: { deletedAt: null },
          orderBy: { platformCreatedAt: 'asc' },
        },
      },
    });
  }

  async getIntegrationById(orgId: string, integrationId: string) {
    return this._integration.model.integration.findFirst({
      where: {
        id: integrationId,
        organizationId: orgId,
        deletedAt: null,
      },
    });
  }

  async getPublishedPostsByIntegration(orgId: string, integrationId: string) {
    return this._post.model.post.findMany({
      where: {
        organizationId: orgId,
        integrationId,
        state: 'PUBLISHED',
        releaseId: { not: null },
        deletedAt: null,
      },
      orderBy: { publishDate: 'desc' },
      take: 50,
      select: {
        id: true,
        releaseId: true,
        releaseURL: true,
        content: true,
        publishDate: true,
        image: true,
      },
    });
  }

  // Moderation Rules
  async getModerationRules(orgId: string) {
    return this._rule.model.commentModerationRule.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createModerationRule(data: {
    organizationId: string;
    name: string;
    action: any;
    keywords: string;
    replyTemplate?: string;
  }) {
    return this._rule.model.commentModerationRule.create({ data });
  }

  async updateModerationRule(
    orgId: string,
    ruleId: string,
    data: {
      name?: string;
      action?: any;
      keywords?: string;
      replyTemplate?: string;
      isActive?: boolean;
    }
  ) {
    return this._rule.model.commentModerationRule.update({
      where: { id: ruleId, organizationId: orgId },
      data,
    });
  }

  async deleteModerationRule(orgId: string, ruleId: string) {
    return this._rule.model.commentModerationRule.update({
      where: { id: ruleId, organizationId: orgId },
      data: { deletedAt: new Date() },
    });
  }
}
