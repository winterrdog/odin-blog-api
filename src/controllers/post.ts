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

function isAuthorSame(tgtAuthor: Types.ObjectId, reqAuthor: JwtPayload) {
  return tgtAuthor.toHexString() === reqAuthor.data.sub;
}

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
        if (!isAuthorSame(post.author, jwtData)) {
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
        if (!isAuthorSame(post.author, jwtData)) {
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
        return res.status(204).json({
          message: "Post deleted successfully",
        });
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
};
export default postController;
