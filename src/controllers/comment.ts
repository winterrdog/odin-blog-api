import { Request, Response } from "express";
import * as _ from "lodash";
import { isValidObjectId } from "mongoose";
import { matchedData } from "express-validator";
import { CommentModel } from "../models/comment";
import {
  CommentReqBody,
  CommentUpdateReqBody,
} from "../request-bodies/comment";
import { JwtPayload } from "../middleware/interfaces";
import {
  commentBodyValidator,
  commentUpdateReqBodyValidators,
  idSanitizers,
  postIdSanitizer,
} from "../validators/comments";
import Utility from "../utilities";
import { startLogger } from "../logging";

const logger = startLogger(__filename);
const commentController = {
  getCommentById: [
    ...idSanitizers,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const sanitizedData = matchedData(req);
        const { postId, id: commentId } = sanitizedData;
        logger.info(
          `fetching the comment with id, ${commentId}, for post with id, ${postId}...`
        );
        if (!isValidObjectId(postId)) {
          logger.error("invalid or malformed post id");
          return res.status(400).json({
            message: `Post id, ${postId}, is invalid or malformed.`,
          });
        }
        if (!isValidObjectId(commentId)) {
          logger.error("invalid or malformed comment id");
          return res.status(400).json({
            message: `Comment id, ${commentId}, is invalid or malformed.`,
          });
        }

        const storedComment = await CommentModel.findOne({
          _id: commentId,
          post: postId,
        });
        if (!storedComment) {
          logger.error(
            `comment with id, ${commentId}, and post id, ${postId}, was not found.`
          );
          return res.status(404).json({
            message: `comment with id, ${commentId}, and post id, ${postId}, was not found.`,
          });
        }

        logger.info("comment retrieved successfully!");
        return res.status(200).json({
          message: "comment retrieved successfully",
          comment: storedComment,
        });
      } catch (e) {
        logger.error(e, "Error fetching comment by id");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  getComments: [
    postIdSanitizer,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const sanitizedData = matchedData(req);
        const { postId } = sanitizedData;
        logger.info(`fetching comments for post with id, ${postId}...`);
        if (!isValidObjectId(postId)) {
          logger.error("invalid or malformed post id");
          return res.status(400).json({
            message: `Post id, ${postId}, is invalid or malformed.`,
          });
        }

        const storedComments = await CommentModel.find({
          post: postId,
        });
        if (storedComments.length === 0) {
          logger.error(`No comments available for post with id, ${postId}.`);
          return res.status(200).json({
            message: `No comments available for post with id, ${postId}.`,
          });
        }

        logger.info("comments fetched successfully!");
        return res.status(200).json({
          message: "post comments fetched successfully",
          comments: storedComments,
        });
      } catch (e) {
        logger.error(e, "error fetching comments");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  createComment: [
    postIdSanitizer,
    ...commentBodyValidator,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const sanitizedData = matchedData(req);
        const { postId } = sanitizedData;
        logger.info(`creating a comment for post with id, ${postId}...`);
        if (!isValidObjectId(postId)) {
          logger.error("invalid or malformed post id");
          return res.status(400).json({
            message: `Post id, ${postId}, is invalid or malformed.`,
          });
        }

        const { data } = (req.user! as any).data as JwtPayload;
        const { sub } = data;
        logger.info(`creating a comment for user with id, ${sub}...`);
        const reqBody: CommentReqBody = {
          user: sub,
          post: postId,
          ...req.body,
        } as const;
        const createdComment = await CommentModel.create({
          ...reqBody,
        });

        logger.info(
          `comment with id, ${createdComment.id}, created successfully!`
        );
        return res.status(201).json({
          message: "comment created successfully",
          comment: createdComment,
        });
      } catch (e) {
        logger.error(e, "error creating comment");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  updateComment: [
    ...idSanitizers,
    ...commentUpdateReqBodyValidators,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const sanitizedData = matchedData(req);
        const { postId, id: commentId } = sanitizedData;
        logger.info(
          `updating comment with id, ${commentId}, for post with id, ${postId}...`
        );
        if (!isValidObjectId(postId)) {
          logger.error("invalid or malformed post id");
          return res.status(400).json({
            message: `Post id, ${postId}, is invalid or malformed.`,
          });
        }
        if (!isValidObjectId(commentId)) {
          logger.error("invalid or malformed comment id");
          return res.status(400).json({
            message: `Comment id, ${commentId}, is invalid or malformed.`,
          });
        }

        let storedComment = await CommentModel.findOne({
          _id: commentId,
          post: postId,
        });
        if (!storedComment) {
          logger.error(
            `comment with id, ${commentId}, and post id, ${postId}, was not found.`
          );
          return res.status(404).json({
            message: `comment with id, ${commentId}, and post id, ${postId}, was not found.`,
          });
        }

        // check author
        const { data } = (req.user! as any).data as JwtPayload;
        const { sub } = data;
        logger.info(
          `checking if user with id, ${sub}, is the author of the comment...`
        );
        if (sub !== storedComment.user._id.toHexString()) {
          logger.error("user is not the author of the comment");
          return res.status(403).json({
            message:
              "you are not the author of this post so you will not update it",
          });
        }

        storedComment = _.merge(
          storedComment,
          req.body as CommentUpdateReqBody
        );
        await storedComment!.save();
        logger.info(
          `comment with id, ${storedComment.id}, updated successfully!`
        );
        return res.status(200).json({
          message: "post comment updated successfully",
          comment: storedComment,
        });
      } catch (e) {
        logger.error(e, "error updating a comment");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  deleteComment: [
    ...idSanitizers,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const sanitizedData = matchedData(req);
        const { postId, id: commentId } = sanitizedData;
        logger.info(
          `deleting comment with id, ${commentId}, for post with id, ${postId}...`
        );
        if (!isValidObjectId(postId)) {
          logger.error("invalid or malformed post id");
          return res.status(400).json({
            message: `Post id, ${postId}, is invalid or malformed.`,
          });
        }
        if (!isValidObjectId(commentId)) {
          logger.error("invalid or malformed comment id");
          return res.status(400).json({
            message: `Comment id, ${commentId}, is invalid or malformed.`,
          });
        }

        const storedComment = await CommentModel.findOne({
          _id: commentId,
          post: postId,
        });
        if (!storedComment) {
          logger.error(
            `comment with id, ${commentId}, and post id, ${postId}, was not found.`
          );
          return res.status(404).json({
            message: `comment with id, ${commentId}, and post id, ${postId}, was not found.`,
          });
        }

        // check author
        const { data } = (req.user! as any).data as JwtPayload;
        const { sub } = data;
        logger.info(
          `checking if user with id, ${sub}, is the author of the comment...`
        );
        if (sub !== storedComment.user._id.toHexString()) {
          logger.error("user is not the author of the comment");
          return res.status(403).json({
            message:
              "you are not the author of this post so you will not delete it",
          });
        }

        await storedComment.deleteOne();
        logger.info(
          `comment with id, ${storedComment.id}, deleted successfully!`
        );
        return res.status(204).end();
      } catch (e) {
        logger.error(e, "error deleting a comment");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  findReplies: [
    postIdSanitizer,
    commentIdSanitizer,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const parentComment = await findParentComment(req, res);
        if (!parentComment) {
          return;
        }

        // populate child comments
        logger.info(`populating comment's( ${parentComment.id} ) replies...`);
        await parentComment.populate("childComments");
        const replies = parentComment.childComments;
        if (replies.length === 0) {
          return res.status(404).json({
            message: `no replies added for comment, ${parentComment.id}`,
          });
        }

        return res.status(200).json({
          message: "replies retrieved successfully",
          replies,
        });
      } catch (e) {
        logger.error(e, "error finding replies to comment");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  createReply: [
    postIdSanitizer,
    commentIdSanitizer,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        // find the parent comment first
        const sanitizedData = matchedData(req);
        const { postId, id: commentId } = sanitizedData;
        logger.info(
          `fetching the comment with id, ${commentId}, for post with id, ${postId}...`
        );
        if (!isValidObjectId(postId)) {
          logger.error("invalid or malformed post id");
          return res.status(400).json({
            message: `Post id, ${postId}, is invalid or malformed.`,
          });
        }
        if (!isValidObjectId(commentId)) {
          logger.error("invalid or malformed comment id");
          return res.status(400).json({
            message: `Comment id, ${commentId}, is invalid or malformed.`,
          });
        }

        const storedComment = await CommentModel.findOne({
          _id: commentId,
          post: postId,
        });
        if (!storedComment) {
          logger.error(
            `comment with id, ${commentId}, and post id, ${postId}, was not found.`
          );
          return res.status(404).json({
            message: `comment with id, ${commentId}, and post id, ${postId}, was not found.`,
          });
        }

        // make sub comment / reply
        const { data } = (req.user! as any).data as JwtPayload;
        const { sub } = data;
        logger.info(
          `creating a sub-comment for comment,${commentId}, by user with id, ${sub}...`
        );
        const replyCommentData: CommentReqBody = {
          user: sub,
          post: postId,
          parentComment: commentId, // attach parent to child/reply
          ...req.body,
        } as const;
        const newReplyComment = await CommentModel.create({
          ...replyCommentData,
        });

        // attach child/reply to parent
        storedComment.childComments.push(newReplyComment._id);
        await storedComment.save();

        return res.status(201).json({
          message: "reply created successfully",
          reply: newReplyComment,
        });
      } catch (e) {
        logger.error(e, "error creating reply to comment");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
async function findParentComment(req: Request, res: Response) {
  try {
    const sanitizedData = matchedData(req);
    const { postId, id: parentCommentId } = sanitizedData;
    logger.info(
      `fetching the comment with id, ${parentCommentId}, for post with id, ${postId}...`
    );
    if (!isValidObjectId(postId)) {
      logger.error("invalid or malformed post id");
      res.status(400).json({
        message: `Post id, ${postId}, is invalid or malformed.`,
      });

      return null;
    }
    if (!isValidObjectId(parentCommentId)) {
      logger.error("invalid or malformed comment id");
      res.status(400).json({
        message: `Comment id, ${parentCommentId}, is invalid or malformed.`,
      });

      return null;
    }

    const parentComment = await CommentModel.findOne({
      _id: parentCommentId,
      post: postId,
    });
    if (!parentComment) {
      logger.error(
        `comment with id, ${parentCommentId}, and post id, ${postId}, was not found.`
      );
      res.status(404).json({
        message: `comment with id, ${parentCommentId}, and post id, ${postId}, was not found.`,
      });

      return null;
    }

    return parentComment;
  } catch (e) {
    throw e;
  }
}
export default commentController;
