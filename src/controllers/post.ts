import { Request, Response } from "express";
import * as _ from "lodash";
import { matchedData } from "express-validator";
import { PostModel } from "../models/post";
import { JwtPayload } from "../middleware/interfaces";
import { postIdSanitizer } from "../validators/post";
import Utility from "../utilities";
import {
  postReqBodyValidators,
  postUpdateReqBodyValidators,
} from "../validators/post";
import { PostUpdateReqBody } from "../request-bodies/post";
import { startLogger } from "../logging";

const logger = startLogger(__filename);

const postController = {
  getPostById: getPostByIdHandler(),
  getPosts: getPostsHandler(),
  createPost: createPostHandler(),
  updatePost: updatePostHandler(),
  deletePost: deletePostHandler(),
  updateLikes: updateLikesHandler(),
  updateDislikes: updateDislikesHandler(),
  removeLike: removeLikeHandler(),
  removeDislike: removeDislikeHandler(),
};

function getPostByIdHandler() {
  const retrievePostById = async function (
    req: Request,
    res: Response,
  ): Promise<any> {
    try {
      const id = extractPostIdFromReq(req, res);
      if (!id) return;
      logger.info(`fetching post by id: ${id}...`);
      const post = await findPostById(id, res);
      if (!post) return;

      // track the number of viewers
      {
        const currUserId = Utility.extractUserIdFromToken(req);
        logger.info(`getting user id for view tracking: ${currUserId}...`);
        const postViewersSet: Set<string> = Utility.arrayToSet(post.views);
        if (!postViewersSet.has(currUserId)) {
          post.views.push(currUserId);
          await post.save();
        }
      }

      logger.info("post retrieved successfully!");
      return res.status(200).json({
        message: "Post retrieved successfully",
        post,
      });
    } catch (e) {
      logger.error(e, "Error occurred during fetching post by id");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [postIdSanitizer, Utility.validateRequest, retrievePostById];

  return handlers;
}

function getPostsHandler() {
  const fetchPosts = async function (
    _req: Request,
    res: Response,
  ): Promise<any> {
    try {
      logger.info("fetching all posts...");
      const posts = await PostModel.find({});
      if (posts.length <= 0) {
        logger.error("No posts have ever been created");
        return res.status(404).json({
          message: "No posts found",
        });
      }
      logger.info("all posts retrieved successfully!");
      return res.status(200).json({
        message: "Posts retrieved successfully",
        posts,
      });
    } catch (e) {
      logger.error(e, "error occurred during fetching posts");
      Utility.handle500Status(res, <Error>e);
    }
  };

  return fetchPosts;
}

function createPostHandler() {
  const createPost = async function (
    req: Request,
    res: Response,
  ): Promise<any> {
    try {
      // grab user id from jwt
      const currUserId = Utility.extractUserIdFromToken(req);
      logger.info(`creating post for user with id: ${currUserId}...`);

      // create post
      const post = await PostModel.create({
        author: currUserId,
        ...req.body,
      });
      logger.info(`post created successfully! post: ${post}`);
      return res.status(201).json({
        message: "Post created successfully",
        post,
      });
    } catch (e) {
      logger.error(e, "error occurred during creating post");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    ...postReqBodyValidators,
    Utility.validateRequest,
    createPost,
  ];

  return handlers;
}

function updatePostHandler() {
  const updatePost = async function (
    req: Request,
    res: Response,
  ): Promise<any> {
    try {
      const id = extractPostIdFromReq(req, res);
      if (!id) return;
      logger.info(`updating post with id: ${id}...`);
      const post = await findPostById(id, res);
      if (!post) return;

      // check if user is the author of the post
      if (
        Utility.isCurrUserSameAsCreator(
          req,
          res,
          post.author._id.toHexString(),
        ) === false
      ) {
        return;
      }
      await Utility.updateDoc(post, req.body as PostUpdateReqBody);
      logger.info(`post updated successfully! post: ${post.toJSON()}`);
      return res.status(200).json({
        message: "Post updated",
        post,
      });
    } catch (e) {
      logger.error(e, "error occurred during updating post");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    postIdSanitizer,
    ...postUpdateReqBodyValidators,
    Utility.validateRequest,
    updatePost,
  ];

  return handlers;
}

function deletePostHandler() {
  const deletePost = async function (
    req: Request,
    res: Response,
  ): Promise<any> {
    try {
      const id = extractPostIdFromReq(req, res);
      if (!id) return;
      logger.info(`deleting post with id: ${id}...`);

      // check if post exists
      const post = await findPostById(id, res);
      if (!post) return;

      // check if user is the author of the post
      if (
        Utility.isCurrUserSameAsCreator(
          req,
          res,
          post.author._id.toHexString(),
        ) === false
      ) {
        return;
      }
      await post.deleteOne();
      logger.info(`post with id: ${id} deleted successfully!`);
      return res.status(204).end();
    } catch (e) {
      logger.error(e, "error occurred during deleting post");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [postIdSanitizer, Utility.validateRequest, deletePost];

  return handlers;
}

function updateLikesHandler() {
  const updatePostLikes = async function (
    req: Request,
    res: Response,
  ): Promise<any> {
    try {
      const id = extractPostIdFromReq(req, res);
      if (!id) return;
      logger.info(`fetching post by id: ${id}...`);
      const post = await findPostById(id, res);
      if (!post) return;

      // update likes
      logger.info(`updating user likes...`);
      const updateOnLikes = Utility.updateUserReactions(req, res, post.likes);
      if (!updateOnLikes) return;

      // if the user disliked the post, "remove" them from dislikes
      if (post.dislikes.length > 0) {
        const dislikeSet = Utility.arrayToSet(post.dislikes);
        const userId: string = ((<any>req.user!).data as JwtPayload).data.sub;
        if (dislikeSet.has(userId)) {
          dislikeSet.delete(userId); // remove user
          post.dislikes = dislikeSet.size > 0 ? Array.from(dislikeSet) : [];
        }
      }
      await post.save();
      logger.info("likes updated successfully!");
      return res.status(200).json({
        message: "likes updated successfully",
        post,
      });
    } catch (e) {
      logger.error(e, "Error occurred during updating likes");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [postIdSanitizer, Utility.validateRequest, updatePostLikes];

  return handlers;
}

function updateDislikesHandler() {
  const updatePostDislikes = async function (
    req: Request,
    res: Response,
  ): Promise<any> {
    try {
      const id = extractPostIdFromReq(req, res);
      if (!id) return;
      logger.info(`fetching post by id: ${id}...`);
      const post = await findPostById(id, res);
      if (!post) return;

      // update dislikes
      logger.info(`updating user dislikes...`);
      const updateOnDislikes = Utility.updateUserReactions(
        req,
        res,
        post.dislikes,
      );
      if (!updateOnDislikes) return;

      // if the user liked the post, "remove" them from likes
      if (post.likes.length > 0) {
        const likesSet = Utility.arrayToSet(post.likes);
        const userId: string = ((<any>req.user!).data as JwtPayload).data.sub;
        if (likesSet.has(userId)) {
          likesSet.delete(userId); // remove user from likes
          post.likes = likesSet.size > 0 ? Array.from(likesSet) : [];
        }
      }
      await post.save();
      logger.info("dislikes updated successfully!");
      return res.status(200).json({
        message: "dislikes updated successfully",
        post,
      });
    } catch (e) {
      logger.error(e, "Error occurred during updating dislikes");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    postIdSanitizer,
    Utility.validateRequest,
    updatePostDislikes,
  ];

  return handlers;
}

function removeLikeHandler() {
  const removeLikeFromPost = async function (
    req: Request,
    res: Response,
  ): Promise<any> {
    try {
      const id = extractPostIdFromReq(req, res);
      if (!id) return;
      logger.info(`fetching post by id: ${id}...`);

      // check if post exists
      const post = await findPostById(id, res);
      if (!post) return;

      if (post.likes.length <= 0) {
        logger.info("no likes to remove from");
        return res.status(400).json({ message: "there are no likes yet" });
      }
      logger.info(`removing user like...`);
      const likesSet = Utility.arrayToSet(post.likes);
      const userId: string = ((<any>req.user!).data as JwtPayload).data.sub;
      if (!likesSet.has(userId)) {
        logger.info("user already unliked post");
        return res.status(400).json({
          message: "user already unliked post",
        });
      }
      likesSet.delete(userId); // remove user from likes
      post.likes = likesSet.size > 0 ? Array.from(likesSet) : [];
      await post.save();
      logger.info("like removed successfully!");
      return res.status(200).json({
        message: "post like removed successfully!",
        post,
      });
    } catch (e) {
      logger.error(e, "Error occurred during removing like");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [
    postIdSanitizer,
    Utility.validateRequest,
    removeLikeFromPost,
  ];

  return handlers;
}

function removeDislikeHandler() {
  const removeDislike = async function (
    req: Request,
    res: Response,
  ): Promise<any> {
    try {
      const id = extractPostIdFromReq(req, res);
      if (!id) return;
      logger.info(`fetching post by id: ${id}...`);

      // check if post exists
      const post = await findPostById(id, res);
      if (!post) return;

      // update dislikes
      if (post.dislikes.length <= 0) {
        logger.info("no dislikes to remove from");
        return res.status(400).json({ message: "there are no dislikes yet" });
      }

      logger.info(`removing user dislike...`);
      const dislikesSet = Utility.arrayToSet(post.dislikes);
      const userId: string = ((<any>req.user!).data as JwtPayload).data.sub;
      if (!dislikesSet.has(userId)) {
        logger.info("user already removed their dislike from post");
        return res.status(204).json({
          message: "user already removed their dislike from post",
        });
      }
      dislikesSet.delete(userId); // remove user from dislikes
      post.dislikes = dislikesSet.size > 0 ? Array.from(dislikesSet) : [];
      await post.save();
      logger.info("dislike removed successfully!");
      return res.status(204).end();
    } catch (e) {
      logger.error(e, "Error occurred during removing dislike");
      Utility.handle500Status(res, <Error>e);
    }
  };

  const handlers = [postIdSanitizer, Utility.validateRequest, removeDislike];

  return handlers;
}

async function findPostById(id: string, res: Response) {
  try {
    const post = await PostModel.findById(id);
    if (!post) {
      logger.error(`post with id ${id} not found`);
      res.status(404).json({ message: `Post with id ${id} not found` });
      return null;
    }
    return post;
  } catch (e) {
    throw e;
  }
}

function extractPostIdFromReq(req: Request, res: Response): string {
  const sanitizedData = matchedData(req);
  const { id } = sanitizedData;
  return Utility.validateObjectId(id, res) ? id : "";
}

export default postController;
