import { Request, Response } from "express";
import * as _ from "lodash";
import { Types } from "mongoose";
import { matchedData } from "express-validator";
import {
  CommentDocument,
  CommentModel,
  CommentModelShape,
} from "../models/comment";
import {
  commentBodyValidator,
  commentIdSanitizer,
  commentUpdateReqBodyValidators,
  idSanitizers,
  postIdSanitizer,
  replyIdSanitizer,
} from "../validators/comments";
import Utility, { TransactionCallback } from "../utilities";
import { startLogger } from "../logging";
import { CommentUpdateReqBody } from "request-bodies/comment";

const logger = startLogger(__filename);

const commentController = {
  getCommentById: fetchCommentByIdHandler(),
  getComments: getCommentsForPostHandler(),
  getUserComments: getUserCommentsHandler(),
  getUserLikedComments: getUserLikedCommentsHandler(),
  createComment: createCommentHandler(),
  updateComment: modifyCommentHandler(),
  deleteComment: deleteCommentHandler(),
  findReplies: retrieveRepliesHandler(),
  createReply: createReplyToCommentHandler(),
  deleteReply: deleteReplyToCommentHandler(),
  likeComment: likeCommentHandler(),
  removeLike: removeCommentLikeHandler(),
  dislikeComment: dislikeCommentHandler(),
  removeDislike: removeDislikeFromCommentHandler(),
};

export default commentController;

// ****************************************************
//             FUNCTION IMPLEMENTATIONS
// ****************************************************

function getUserCommentsHandler() {
  const fetchUserComments = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const userId: string = Utility.extractUserIdFromToken(req);
      logger.info(`fetching comments for user with id, ${userId}...`);

      // query the database for comments made by the current user id
      const cb: TransactionCallback<CommentDocument[]> = async (session) => {
        const comments = await CommentModel.find({ user: userId }, null, {
          session,
          sort: { lastModified: -1 },
        });

        return comments as unknown as CommentDocument[];
      };

      const userComments = await Utility.runOperationInTransaction(cb);
      if (userComments.length <= 0) {
        logger.info("no comments found for the user");
        return res.status(404).json({
          message: "no comments found for the user",
        });
      }

      return res.status(200).json({
        message: "user comments fetched successfully",
        comments: userComments,
      });
    } catch (e) {
      logger.error(e, "error fetching a user's comments");
      Utility.handle500Status(res, <Error>e);
    }
  };

  return fetchUserComments;
}

function getUserLikedCommentsHandler() {
  const fetchUserLikedComments = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const userId: string = Utility.extractUserIdFromToken(req);

      const cb: TransactionCallback<CommentDocument[]> = async (session) => {
        const comments = await CommentModel.find(
          { likes: { $in: [userId] } },
          null,
          { session, sort: { lastModified: -1 } }
        );

        return comments as unknown as CommentDocument[];
      };

      const userLikedComments = await Utility.runOperationInTransaction(cb);
      if (userLikedComments.length <= 0) {
        logger.info("no comments found for the user");
        return res.status(404).json({
          message: "no comments were liked by the user",
        });
      }

      return res.status(200).json({
        message: "user liked comments fetched successfully",
        comments: userLikedComments,
      });
    } catch (e) {
      logger.error(e, "error fetching a user's liked comments");
      Utility.handle500Status(res, <Error>e);
    }
  };

  return fetchUserLikedComments;
}

function removeDislikeFromCommentHandler() {
  const removeDislikeFromComment = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      let comment = await findCommentByIdAndPostId(req, res);
      if (!comment) {
        return;
      }

      if (comment.dislikes!.length <= 0) {
        logger.info("no dislikes to remove from comment");
        return res
          .status(204)
          .json({ message: "there are no dislikes on the comment yet" });
      }

      // remove dislike
      {
        const dislikesSet = Utility.arrayToSet(comment.dislikes!);
        const userId: string = Utility.extractUserIdFromToken(req);

        if (!dislikesSet.has(userId)) {
          logger.info("user already removed dislike from comment");
          return res.status(400).json({
            message: "user already removed dislike from comment",
          });
        }

        dislikesSet.delete(userId); // remove user from dislikes
        comment.dislikes = dislikesSet.size > 0 ? Array.from(dislikesSet) : [];

        const cb: TransactionCallback<CommentDocument> = async (session) => {
          return await comment!.save({ session });
        };

        comment = await Utility.runOperationInTransaction(cb);
        logger.info("dislike removed from the comment successfully!");
      }

      return res.status(200).json({
        message: "comment dislike removed successfully!",
        comment,
      });
    } catch (e) {
      logger.error(e, "error removing a dislike a comment");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    ...idSanitizers,
    Utility.validateRequest,
    removeDislikeFromComment,
  ];

  return handlers;
}

function dislikeCommentHandler() {
  const dislikeComment = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      let comment = await findCommentByIdAndPostId(req, res);
      if (!comment) {
        return;
      }

      logger.info("updating comment dislikes...");

      const updatedCommentDislikes = Utility.updateUserReactions(
        req,
        res,
        comment.dislikes!
      );
      if (!updatedCommentDislikes) {
        return;
      }

      // if the user liked the comment, "remove" them from likes
      if (comment.likes!.length > 0) {
        const likesSet = Utility.arrayToSet(comment.likes!);
        const userId: string = Utility.extractUserIdFromToken(req);

        if (likesSet.has(userId)) {
          likesSet.delete(userId); // remove user
          comment.likes = likesSet.size > 0 ? Array.from(likesSet) : [];
        }
      }

      const cb: TransactionCallback<CommentDocument> = async (session) => {
        return await comment!.save({ session });
      };

      comment = await Utility.runOperationInTransaction(cb);
      logger.info("comment's dislikes updated successfully!");

      return res.status(200).json({
        message: "comment's dislikes updated successfully",
        comment,
      });
    } catch (e) {
      logger.error(e, "error disliking a comment");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [...idSanitizers, Utility.validateRequest, dislikeComment];

  return handlers;
}

function removeCommentLikeHandler() {
  const removeCommentLike = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      let comment = await findCommentByIdAndPostId(req, res);
      if (!comment) return;
      if (comment.likes!.length <= 0) {
        logger.info("no likes to remove from comment");
        return res.status(204).json({
          message: "there are no likes on the comment yet",
        });
      }

      // remove like
      {
        const likesSet = Utility.arrayToSet(comment.likes!);
        const userId: string = Utility.extractUserIdFromToken(req);

        if (!likesSet.has(userId)) {
          logger.info("user already removed like from comment");
          return res.status(400).json({
            message: "user already removed like from comment",
          });
        }

        likesSet.delete(userId); // remove user from likes
        comment.likes = likesSet.size > 0 ? Array.from(likesSet) : [];

        const cb: TransactionCallback<CommentDocument> = async (session) => {
          return await comment!.save({ session });
        };

        comment = await Utility.runOperationInTransaction(cb);
        logger.info("like removed from the comment successfully!");
      }

      return res.status(200).json({
        message: "comment like removed successfully!",
        comment,
      });
    } catch (e) {
      logger.error(e, "error removing a like from a comment");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    ...idSanitizers,
    Utility.validateRequest,
    removeCommentLike,
  ];

  return handlers;
}

function likeCommentHandler() {
  const likeComment = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      let comment = await findCommentByIdAndPostId(req, res);
      if (!comment) return;

      logger.info("updating comment likes...");

      const updatedCommentLikes = Utility.updateUserReactions(
        req,
        res,
        comment.likes!
      );
      if (!updatedCommentLikes) return;

      // if the user disliked the comment, "remove" them from dislikes
      if (comment.dislikes!.length >= 1) {
        const dislikeSet = Utility.arrayToSet(comment.dislikes!);
        const userId: string = Utility.extractUserIdFromToken(req);

        if (dislikeSet.has(userId)) {
          dislikeSet.delete(userId); // remove user
          comment.dislikes = dislikeSet.size > 0 ? Array.from(dislikeSet) : [];
        }
      }

      const cb: TransactionCallback<CommentDocument> = async (session) => {
        return await comment!.save({ session });
      };

      comment = await Utility.runOperationInTransaction(cb);
      logger.info("comment's likes updated successfully!");

      return res.status(200).json({
        message: "comment's likes updated successfully",
        comment,
      });
    } catch (e) {
      logger.error(e, "error liking a comment");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [...idSanitizers, Utility.validateRequest, likeComment];

  return handlers;
}

function deleteReplyToCommentHandler() {
  const deleteReplyToComment = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const parentComment = await findParentComment(req, res);
      if (!parentComment) return;

      // is the parent comment deleted?
      if (parentComment.deleted) {
        return res.status(400).json({
          message: `parent comment with id, ${parentComment.id}, is already deleted`,
        });
      }

      const sanitizedData = matchedData(req);
      const { replyId } = sanitizedData;
      const deletedReply = await findCommentByIdAndParentId(
        replyId,
        parentComment.id,
        res
      );
      if (!deletedReply) {
        return;
      }

      if (
        Utility.isCurrUserSameAsCreator(
          req,
          res,
          (<any>deletedReply.user).id
        ) === false
      ) {
        return;
      }

      // remove reply from parent's children
      {
        const objectIdToString = (currMongoId: Types.ObjectId): string => {
          return currMongoId._id.toHexString();
        };

        const hexUserIds = parentComment.childComments!.map(objectIdToString);
        const userIdSet: Set<string> = Utility.arrayToSet(hexUserIds);

        if (!userIdSet.has(replyId)) {
          return res.status(404).json({
            message: `the current reply with id, ${replyId}, was not found among the current comment's( ${parentComment.id} ) replies`,
          });
        }

        userIdSet.delete(replyId);
        parentComment.childComments =
          userIdSet.size > 0
            ? Array.from(userIdSet).map((id) => new Types.ObjectId(id))
            : [];

        const cb: TransactionCallback<void> = async (session) => {
          await parentComment.save({ session });
        };
        await Utility.runOperationInTransaction(cb);
      }

      // delete in database
      await markCommentAsDeleted(deletedReply);
      logger.info(`comment with id, ${deletedReply.id}, deleted successfully!`);

      return res.status(204).end();
    } catch (e) {
      logger.error(e, "error deleting reply to comment");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    ...idSanitizers,
    replyIdSanitizer,
    Utility.validateRequest,
    deleteReplyToComment,
  ];

  return handlers;
}

function createReplyToCommentHandler() {
  const createSubComment = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      // find the parent comment first
      const sanitizedData = matchedData(req);
      const { postId, id: parentCommentId } = sanitizedData;
      const parentComment = await findParentComment(req, res);
      if (!parentComment) {
        return;
      }

      // is the parent comment deleted?
      if (parentComment.deleted) {
        return res.status(400).json({
          message: `parent comment with id, ${parentComment.id}, is already deleted`,
        });
      }

      // make sub comment / reply
      const currUserId = Utility.extractUserIdFromToken(req);
      logger.info(
        `creating a sub-comment for comment,${parentCommentId}, by user with id, ${currUserId}...`
      );

      const replyCommentData: CommentModelShape = {
        user: new Types.ObjectId(<string>currUserId),
        post: new Types.ObjectId(<string>postId),
        parentComment: parentComment.id, // attach parent to child/reply
        ...req.body,
      } as const;

      const cb: TransactionCallback<CommentDocument> = async (session) => {
        const comment = await CommentModel.create([replyCommentData], {
          session,
        });

        return comment[0] as unknown as CommentDocument;
      };

      // attach child/reply to parent
      const newReplyComment = await Utility.runOperationInTransaction(cb);
      parentComment.childComments!.push(newReplyComment.id);

      const saveParentCommentCb: TransactionCallback<void> = async (
        session
      ) => {
        await parentComment.save({ session });
      };

      await Utility.runOperationInTransaction(saveParentCommentCb);

      return res.status(201).json({
        message: "reply created successfully",
        reply: newReplyComment,
      });
    } catch (e) {
      logger.error(e, "error creating reply to comment");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    postIdSanitizer,
    commentIdSanitizer,
    Utility.validateRequest,
    createSubComment,
  ];

  return handlers;
}

function retrieveRepliesHandler() {
  const fetchReplies = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const parentComment = await findParentComment(req, res);
      if (!parentComment) return;

      // is the parent comment deleted? if so it'll hv no children
      // but it'll have detached children
      if (parentComment.deleted) {
        const cb: TransactionCallback<void> = async (session) => {
          await parentComment.populate({
            path: "detachedchildComments",
            options: { session },
          });

          const detachedReplies = parentComment.detachedchildComments;
          if (detachedReplies!.length <= 0) {
            res.status(404).json({
              message: `no replies added for comment, ${parentComment.id}`,
            });

            return;
          }

          res.status(200).json({
            message: "replies retrieved successfully",
            replies: detachedReplies,
          });
        };

        await Utility.runOperationInTransaction(cb);
        return;
      }

      // populate child comments
      logger.info(`populating comment's( ${parentComment.id} ) replies...`);

      const cb: TransactionCallback<void> = async (session) => {
        await parentComment.populate({
          path: "childComments",
          options: { session },
        });
      };

      await Utility.runOperationInTransaction(cb);

      const replies = parentComment.childComments;
      if (replies!.length <= 0) {
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
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    postIdSanitizer,
    commentIdSanitizer,
    Utility.validateRequest,
    fetchReplies,
  ];

  return handlers;
}

function deleteCommentHandler() {
  const deleteComment = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const storedComment = await findCommentByIdAndPostId(req, res);
      if (!storedComment) {
        return;
      }

      if (
        Utility.isCurrUserSameAsCreator(
          req,
          res,
          (<any>storedComment.user).id
        ) === false
      ) {
        return;
      }

      await markCommentAsDeleted(storedComment);
      logger.info(
        `comment with id, ${storedComment.id}, deleted successfully!`
      );

      return res.status(204).end();
    } catch (e) {
      logger.error(e, "error deleting a comment");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [...idSanitizers, Utility.validateRequest, deleteComment];

  return handlers;
}

function modifyCommentHandler() {
  const handleUpdateComment = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      let storedComment = await findCommentByIdAndPostId(req, res);
      if (!storedComment) {
        return;
      }

      if (
        Utility.isCurrUserSameAsCreator(
          req,
          res,
          (<any>storedComment.user).id
        ) === false
      ) {
        return;
      }

      const newData: CommentUpdateReqBody = req.body;
      newData["lastModified"] = new Date();
      storedComment = (await Utility.updateDoc(
        storedComment,
        newData
      )) as CommentDocument;

      logger.info(
        `comment with id, ${storedComment.id}, updated successfully!`
      );

      return res.status(200).json({
        message: "post comment updated successfully",
        comment: storedComment,
      });
    } catch (e) {
      logger.error(e, "error updating a comment");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    ...idSanitizers,
    ...commentUpdateReqBodyValidators,
    Utility.validateRequest,
    handleUpdateComment,
  ];

  return handlers;
}

function createCommentHandler() {
  const createComment = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const sanitizedData = matchedData(req);
      const { postId } = sanitizedData;
      if (!Utility.validateObjectId(postId, res)) {
        return;
      }

      const currUserId = Utility.extractUserIdFromToken(req);
      const reqBody: CommentModelShape = {
        user: new Types.ObjectId(<string>currUserId),
        post: new Types.ObjectId(<string>postId),
        ...req.body,
      } as const;

      logger.info(
        `creating a comment for user with id, ${currUserId} and post id, ${postId}...`
      );

      const cb: TransactionCallback<CommentDocument> = async (session) => {
        const comment = await CommentModel.create([reqBody], { session });
        return comment[0] as unknown as CommentDocument;
      };

      const createdComment = await Utility.runOperationInTransaction(cb);
      logger.info(
        `comment with id, ${createdComment.id}, created successfully!`
      );

      return res.status(201).json({
        message: "comment created successfully",
        comment: createdComment,
      });
    } catch (e) {
      logger.error(e, "error creating comment");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    postIdSanitizer,
    ...commentBodyValidator,
    Utility.validateRequest,
    createComment,
  ];

  return handlers;
}

function getCommentsForPostHandler() {
  const fetchPostComments = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const storedComments = await findCommentsForPost(req, res);
      if (!storedComments) {
        return;
      }

      logger.info("comments fetched successfully!");

      return res.status(200).json({
        message: "post comments fetched successfully",
        comments: storedComments,
      });
    } catch (e) {
      logger.error(e, "error fetching comments");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    postIdSanitizer,
    Utility.validateRequest,
    fetchPostComments,
  ];

  return handlers;
}

function fetchCommentByIdHandler() {
  const handleCommentRetrieval = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const storedComment = await findCommentByIdAndPostId(req, res);
      if (!storedComment) {
        return;
      }

      logger.info("comment retrieved successfully!");

      return res.status(200).json({
        message: "comment retrieved successfully",
        comment: storedComment,
      });
    } catch (e) {
      logger.error(e, "Error fetching comment by id");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    ...idSanitizers,
    Utility.validateRequest,
    handleCommentRetrieval,
  ];

  return handlers;
}

/**
 * find a comment's parent comment
 * @param req Request object from express
 * @param res Response object from express
 * @returns a comment document type or null in case of an error and a response is sent to the client
 */
async function findParentComment(req: Request, res: Response) {
  try {
    const parentComment = await findCommentByIdAndPostId(req, res);
    return parentComment ? parentComment : null;
  } catch (e) {
    throw e;
  }
}

/**
 * marks a comment as deleted but it sticks around
 * @param storedComment a comment's document type
 */
async function markCommentAsDeleted(storedComment: any) {
  try {
    // NOTE: Mongoose will automatically set all children's
    // parent to null since he's gone
    storedComment.deleted = true;

    if (storedComment.childComments.length > 0) {
      storedComment.detachedchildComments = [...storedComment.childComments];
    } else {
      storedComment.detachedchildComments = [];
    }

    storedComment.childComments = [];
    storedComment.tldr = "";
    storedComment.body = "deleted comment";

    const cb: TransactionCallback<CommentDocument> = async (session) => {
      return await storedComment.save({ session });
    };

    await Utility.runOperationInTransaction(cb);
  } catch (e) {
    throw e;
  }
}

async function findCommentByIdAndParentId(
  id: string,
  parentId: string,
  res: Response
) {
  try {
    const cb: TransactionCallback<CommentDocument | null> = async (session) => {
      const comment = await CommentModel.findOne(
        { _id: id, parentComment: parentId },
        null,
        { session }
      );

      if (!comment) {
        return null;
      }

      await comment.populate({
        path: "user",
        select: "id",
        options: { session },
      });

      return comment as unknown as CommentDocument;
    };

    const storedComment = await Utility.runOperationInTransaction(cb);
    return validateCommentFromDb(storedComment, res) ? storedComment : null;
  } catch (e) {
    throw e;
  }
}

/**
 * finds a comment by its id and post id
 * @param req Request object from express
 * @param res Response object from express
 * @returns a comment document type or null in case of an error and a response is sent to the client
 */
async function findCommentByIdAndPostId(req: Request, res: Response) {
  try {
    const sanitizedData = matchedData(req);
    const { postId, id: commentId } = sanitizedData;
    logger.info(
      `searching for comment with id, ${commentId}, for post with id, ${postId}...`
    );

    if (
      !Utility.validateObjectId(postId, res) ||
      !Utility.validateObjectId(commentId, res)
    ) {
      return null;
    }

    const cb: TransactionCallback<CommentDocument | null> = async (session) => {
      const comment = await CommentModel.findOne(
        { _id: commentId, post: postId },
        null,
        { session }
      );

      if (!comment) {
        return null;
      }

      await comment.populate({
        path: "user",
        select: "id",
        options: { session },
      });

      return comment as unknown as CommentDocument;
    };

    const storedComment = await Utility.runOperationInTransaction(cb);
    return validateCommentFromDb(storedComment, res) ? storedComment : null;
  } catch (e) {
    throw e;
  }
}

async function findCommentsForPost(req: Request, res: Response) {
  try {
    const sanitizedData = matchedData(req);
    const { postId } = sanitizedData;

    logger.info(`fetching comments for post with id, ${postId}...`);
    if (!Utility.validateObjectId(postId, res)) {
      return null;
    }

    const cb: TransactionCallback<CommentDocument[] | null> = async (
      session
    ) => {
      const comments = await CommentModel.find({ post: postId }, null, {
        session,
        sort: { lastModified: -1 },
      });

      if (!comments || comments.length <= 0) {
        return null;
      }

      return comments as unknown as CommentDocument[];
    };

    const storedComments = await Utility.runOperationInTransaction(cb);
    if (!storedComments) {
      logger.error(`No comments available for post with id, ${postId}.`);
      res.status(200).json({
        message: `No comments available for post with id, ${postId}.`,
      });
      return null;
    }

    return storedComments;
  } catch (e) {
    throw e;
  }
}

/**
 * validates a comment from the database
 * @param comment a comment document type
 * @param res Response object from express
 * @returns a boolean representing the validity of the comment
 */
function validateCommentFromDb(comment: any | null, res: Response) {
  if (comment) {
    return true;
  }

  logger.error("comment not found");
  res.status(404).json({ message: "comment not found" });
  return false;
}
