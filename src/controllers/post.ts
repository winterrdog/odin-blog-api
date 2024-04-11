import { Request, Response } from "express";
import _ from "lodash";
import { Types, isValidObjectId } from "mongoose";
import { matchedData } from "express-validator";
import { PostModel } from "../models/post";
import { JwtPayload } from "../middleware/interfaces";
import { postIdSanitizer } from "../validators/comments";
import Utility from "../utilities";
import {
  postReqBodyValidators,
  postUpdateReqBodyValidators,
} from "../validators/post";
import { PostUpdateReqBody } from "../request-bodies/post";

function isAuthorSame(tgtAuthor: Types.ObjectId, reqAuthor: JwtPayload) {
  return tgtAuthor.toHexString() === reqAuthor.data.sub;
}

const postController = {
  getPostById: [
    postIdSanitizer,
    Utility.validateRequest,
    async function (req: Request, res: Response) {
      try {
        const { id } = req.params;
        if (isValidObjectId(id) === false) {
          return res.status(400).json({ message: "Invalid post id" });
        }

        // check if post exists
        const post = await PostModel.findById(id);
        if (!post) {
          return res
            .status(404)
            .json({ message: `Post with id ${id} not found` });
        }
        return res.status(200).json({
          message: "Post retrieved successfully",
          post,
        });
      } catch (e) {
        console.error(`Error occurred during fetching post by id: ${e}`);
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
      const posts = await PostModel.find({});
      if (posts.length <= 0) {
        return res.status(404).json({
          message: "No posts found",
        });
      }
      return res.status(200).json({
        message: "Posts retrieved successfully",
        posts,
      });
    } catch (e) {
      console.error(`Error occurred during fetching posts: ${e}`);
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

        // create post
        const post = await PostModel.create({
          author: sub,
          ...req.body,
        });

        return res.status(201).json({
          message: "Post created successfully",
          post,
        });
      } catch (e) {
        console.error(`Error occurred during creating post: ${e}`);
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
        if (isValidObjectId(id) === false) {
          return res.status(400).json({ message: "Invalid post id" });
        }

        let post = await PostModel.findById(id);
        if (!post) {
          return res
            .status(404)
            .json({ message: `Post with id ${id} not found` });
        }

        // check if user is the author of the post
        const jwtData = (req.user! as any).data as JwtPayload;
        if (!isAuthorSame(post.author, jwtData)) {
          return res.status(403).json({
            message: "You are not authorized to update this post",
          });
        }

        // merge data to update
        post = _.merge(post, req.body as PostUpdateReqBody);
        await post!.save();

        return res.status(200).json({
          message: "Post updated",
          post,
        });
      } catch (e) {
        console.error(`Error occurred during updating post: ${e}`);
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
        if (isValidObjectId(id) === false) {
          return res.status(400).json({ message: "Invalid post id" });
        }

        // check if post exists
        const post = await PostModel.findById(id);
        if (!post) {
          return res
            .status(404)
            .json({ message: `Post with id ${id} not found` });
        }

        // check if user is the author of the post
        const jwtData = (req.user! as any).data as JwtPayload;
        if (!isAuthorSame(post.author, jwtData)) {
          return res.status(403).json({
            message: "You are not authorized to update this post",
          });
        }

        // delete post
        await post.deleteOne();

        return res.status(204).json({
          message: "Post deleted successfully",
        });
      } catch (e) {
        console.error(`Error occurred during deleting post: ${e}`);
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
