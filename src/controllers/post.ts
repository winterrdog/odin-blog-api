import { Request, Response } from "express";
import * as _ from "lodash";
import { Types, isValidObjectId } from "mongoose";
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
  getPostById: [
    postIdSanitizer,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const { id } = req.params;
        logger.info(`fetching post by id: ${id}...`);
        if (isValidObjectId(id) === false) {
          logger.error("invalid or malformed post id");
          return res.status(400).json({ message: "Invalid post id" });
        }

        // check if post exists
        const post = await PostModel.findById(id);
        if (!post) {
          logger.error(`post with id ${id} not found`);
          return res
            .status(404)
            .json({ message: `Post with id ${id} not found` });
        }

        // track the number of viewers
        {
          const jwtData = (req.user! as any).data as JwtPayload;
          const { sub } = jwtData.data;
          logger.info(`getting user id for view tracking: ${sub}...`);
          if (!isValidObjectId(sub)) {
            logger.error("invalid or malformed user id");
            return res.status(400).json({ message: "Invalid user id" });
          }

          const postViewersSet: Set<string> = Utility.arrayToSet(post.views);
          if (!postViewersSet.has(sub)) {
            post.views.push(sub);
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
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  getPosts: async function (_req: Request, res: Response) {
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
      return res.status(500).json({
        message:
          process.env.NODE_ENV === "production"
            ? "Internal server error occurred. Please try again later."
            : (e as Error).message,
      });
    }
  },
  createPost: [
    ...postReqBodyValidators,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        // grab user id from jwt
        const jwtData = (req.user! as any).data as JwtPayload;
        const { sub } = jwtData.data;
        logger.info(`creating post for user with id: ${sub}...`);
        if (isValidObjectId(sub) === false) {
          logger.error("invalid or malformed user id");
          return res.status(400).json({ message: "Invalid user id" });
        }

        // create post
        const post = await PostModel.create({
          author: sub,
          ...req.body,
        });

        logger.info(`post created successfully! post: ${post}`);
        return res.status(201).json({
          message: "Post created successfully",
          post,
        });
      } catch (e) {
        logger.error(e, "error occurred during creating post");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  updatePost: [
    postIdSanitizer,
    ...postUpdateReqBodyValidators,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        // grab post id from sanitized request params
        const sanitizedData = matchedData(req);
        const { id } = sanitizedData;
        logger.info(`updating post with id: ${id}...`);
        if (isValidObjectId(id) === false) {
          logger.error("invalid or malformed post id");
          return res.status(400).json({ message: "Invalid post id" });
        }

        let post = await PostModel.findById(id);
        if (!post) {
          logger.error(`post with id ${id} not found`);
          return res
            .status(404)
            .json({ message: `Post with id ${id} not found` });
        }

        // check if user is the author of the post
        const jwtData = (req.user! as any).data as JwtPayload;
        if (!isAuthorSame(post.author._id, jwtData)) {
          logger.error(
            `user with id ${jwtData.data.sub} is not the author of post with id ${id} hence cannot update it`
          );
          return res.status(403).json({
            message: "You are not authorized to update this post",
          });
        }

        // merge data to update
        post = _.merge(post, req.body as PostUpdateReqBody);
        await post!.save();

        logger.info(`post updated successfully! post: ${post.toJSON()}`);
        return res.status(200).json({
          message: "Post updated",
          post,
        });
      } catch (e) {
        logger.error(e, "error occurred during updating post");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  deletePost: [
    postIdSanitizer,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const sanitizedData = matchedData(req);
        const { id } = sanitizedData;
        logger.info(`deleting post with id: ${id}...`);
        if (isValidObjectId(id) === false) {
          logger.error("invalid or malformed post id");
          return res.status(400).json({ message: "Invalid post id" });
        }

        // check if post exists
        const post = await PostModel.findById(id);
        if (!post) {
          logger.error(`post with id ${id} not found`);
          return res
            .status(404)
            .json({ message: `Post with id ${id} not found` });
        }

        // check if user is the author of the post
        const jwtData = (req.user! as any).data as JwtPayload;
        if (!isAuthorSame(post.author._id, jwtData)) {
          logger.error(
            `user with id ${jwtData.data.sub} is not the author of post with id ${id} hence cannot delete it`
          );
          return res.status(403).json({
            message: "You are not authorized to update this post",
          });
        }

        // delete post
        await post.deleteOne();
        logger.info(`post with id: ${id} deleted successfully!`);
        return res.status(204).end();
      } catch (e) {
        logger.error(e, "error occurred during deleting post");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  updateLikes: [
    postIdSanitizer,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const { id } = req.params;
        logger.info(`fetching post by id: ${id}...`);
        if (isValidObjectId(id) === false) {
          logger.error("invalid or malformed post id");
          return res.status(400).json({ message: "Invalid post id" });
        }

        // check if post exists
        const post = await PostModel.findById(id);
        if (!post) {
          logger.error(`post with id ${id} not found`);
          return res
            .status(404)
            .json({ message: `Post with id ${id} not found` });
        }

        // update likes
        logger.info(`updating user likes...`);
        const updateOnLikes = updateUniqueSets(req, res, post.likes);
        if (!updateOnLikes) {
          logger.info(
            "the currently like was already updated or user provided malformed user ID!"
          );
          return res.status(204).end();
        }

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
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  updateDislikes: [
    postIdSanitizer,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const { id } = req.params;
        logger.info(`fetching post by id: ${id}...`);
        if (isValidObjectId(id) === false) {
          logger.error("invalid or malformed post id");
          return res.status(400).json({ message: "Invalid post id" });
        }

        // check if post exists
        const post = await PostModel.findById(id);
        if (!post) {
          logger.error(`post with id ${id} not found`);
          return res
            .status(404)
            .json({ message: `Post with id ${id} not found` });
        }

        // update dislikes
        logger.info(`updating user dislikes...`);
        const updateOnDislikes = updateUniqueSets(req, res, post.dislikes);
        if (!updateOnDislikes) {
          logger.info(
            "the dislike was already updated or user provided malformed user ID!"
          );
          return res.status(204).end();
        }

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
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  removeLike: [
    postIdSanitizer,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const { id } = req.params;
        logger.info(`fetching post by id: ${id}...`);
        if (isValidObjectId(id) === false) {
          logger.error("invalid or malformed post id");
          return res.status(400).json({ message: "Invalid post id" });
        }

        // check if post exists
        const post = await PostModel.findById(id);
        if (!post) {
          logger.error(`post with id ${id} not found`);
          return res
            .status(404)
            .json({ message: `Post with id ${id} not found` });
        }

        // update likes
        logger.info(`removing user like...`);
        if (post.likes.length > 0) {
          const likesSet = Utility.arrayToSet(post.likes);
          const userId: string = ((<any>req.user!).data as JwtPayload).data.sub;

          if (!likesSet.has(userId)) {
            logger.info("user already unliked post");
            return res.status(204).json({
              message: "user already unliked post",
            });
          }

          likesSet.delete(userId); // remove user from likes
          post.likes = likesSet.size > 0 ? Array.from(likesSet) : [];
        } else {
          logger.info("no likes to remove from");
          return res.status(204).json({ message: "there are no likes yet" });
        }

        await post.save();
        logger.info("like removed successfully!");

        return res.status(204).end();
      } catch (e) {
        logger.error(e, "Error occurred during removing like");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
  removeDislike: [
    postIdSanitizer,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const { id } = req.params;
        logger.info(`fetching post by id: ${id}...`);
        if (isValidObjectId(id) === false) {
          logger.error("invalid or malformed post id");
          return res.status(400).json({ message: "Invalid post id" });
        }

        // check if post exists
        const post = await PostModel.findById(id);
        if (!post) {
          logger.error(`post with id ${id} not found`);
          return res
            .status(404)
            .json({ message: `Post with id ${id} not found` });
        }

        // update dislikes
        logger.info(`removing user dislike...`);
        if (post.dislikes.length > 0) {
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
        } else {
          logger.info("no dislikes to remove from");
          return res.status(204).json({ message: "there are no dislikes yet" });
        }

        await post.save();
        logger.info("dislike removed successfully!");

        return res.status(204).end();
      } catch (e) {
        logger.error(e, "Error occurred during removing dislike");
        return res.status(500).json({
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error occurred. Please try again later."
              : (e as Error).message,
        });
      }
    },
  ],
};

function isAuthorSame(tgtAuthor: Types.ObjectId, reqAuthor: JwtPayload) {
  return tgtAuthor.toHexString() === reqAuthor.data.sub;
}

function updateUniqueSets(
  req: Request,
  res: Response,
  arr: Array<string>
): boolean {
  if (!req.user) {
    throw new Error("user's not authenticated thus user object is missing");
  }

  const jwtData = (req.user as any).data as JwtPayload;
  const { sub } = jwtData.data;
  if (!isValidObjectId(sub)) {
    logger.error("invalid or malformed user id");
    res.status(400).json({ message: "Invalid user id" });
    return false;
  }

  const tgtSet: Set<string> = Utility.arrayToSet(arr);
  if (!tgtSet.has(sub)) {
    arr.push(sub);
    return true;
  }

  return false;
}

export default postController;
