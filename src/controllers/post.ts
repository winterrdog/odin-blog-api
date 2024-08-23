import { Request, Response } from "express";
import * as _ from "lodash";
import { matchedData } from "express-validator";
import { PostDocument, PostModel } from "../models/post";
import { JwtPayload } from "../middleware/interfaces";
import { postIdSanitizer } from "../validators/post";
import Utility, { TransactionCallback } from "../utilities";
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
  getUserPosts: getUserPostsHandler(),
  getLikedPosts: getUserLikedPostsHandler(),
  getRecentlyViewedPosts: getRecentlyViewedPostsHandler(),
  createPost: createPostHandler(),
  updatePost: updatePostHandler(),
  deletePost: deletePostHandler(),
  updateLikes: updateLikesHandler(),
  updateDislikes: updateDislikesHandler(),
  removeLike: removeLikeHandler(),
  removeDislike: removeDislikeHandler(),
};

function getUserPostsHandler() {
  const fetchUserPosts = async (req: Request, res: Response): Promise<any> => {
    try {
      logger.info("fetching a user's posts...");

      const currUserId = Utility.extractUserIdFromToken(req);
      const cb: TransactionCallback<PostDocument[]> = async (session) => {
        const posts = await PostModel.find({ author: currUserId }, null, {
          session,
        }).sort({ lastModified: -1 });

        return posts as unknown as PostDocument[];
      };

      const posts = await Utility.runOperationInTransaction(cb);
      if (posts.length <= 0) {
        logger.error("No posts found for user");
        return res.status(404).json({
          message: "No posts found for user",
        });
      }

      return res.status(200).json({
        message: "User's posts retrieved successfully",
        posts,
      });
    } catch (e) {
      logger.error(e, "error occurred during fetching user posts");
      Utility.handle500Status(res, <Error>e);
    }
  };

  return fetchUserPosts;
}

function getUserLikedPostsHandler() {
  const fetchUserLikedPosts = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const currUserId = Utility.extractUserIdFromToken(req);
      const cb: TransactionCallback<PostDocument[]> = async (session) => {
        const posts = await PostModel.find(
          { likes: { $in: [currUserId] } },
          null
        )
          .sort({ lastModified: -1 })
          .session(session);

        return posts as unknown as PostDocument[];
      };

      const posts = await Utility.runOperationInTransaction(cb);
      if (posts.length <= 0) {
        logger.error("No liked posts found for user");
        return res.status(404).json({
          message: "no liked posts found for user",
        });
      }

      return res.status(200).json({
        message: "user's liked posts retrieved successfully",
        posts,
      });
    } catch (e) {
      logger.error(e, "error occurred during fetching user liked posts");
      Utility.handle500Status(res, <Error>e);
    }
  };

  return fetchUserLikedPosts;
}

function getRecentlyViewedPostsHandler() {
  const fetchRecentlyViewedPosts = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      // get the user's most recently viewed 5 posts
      const currUserId = Utility.extractUserIdFromToken(req);
      const cb: TransactionCallback<PostDocument[]> = async (session) => {
        const posts = await PostModel.find({ views: { $in: [currUserId] } })
          .sort({ lastModified: -1 })
          .limit(5)
          .session(session);

        return posts as unknown as PostDocument[];
      };

      const posts = await Utility.runOperationInTransaction(cb);
      if (posts.length <= 0) {
        logger.error("No recently viewed posts found for user");
        return res.status(404).json({
          message: "no recently viewed posts found for user",
        });
      }

      return res.status(200).json({
        message: "user's recently viewed posts retrieved successfully",
        posts,
      });
    } catch (e) {
      logger.error(e, "error occurred during fetching recently viewed posts");
      Utility.handle500Status(res, <Error>e);
    }
  };

  return fetchRecentlyViewedPosts;
}

function getPostByIdHandler() {
  const retrievePostById = async function (
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const id = extractPostIdFromReq(req, res);
      if (!id) return;

      logger.info(`fetching post by id: ${id}...`);

      const cb: TransactionCallback<PostDocument | null> = async (session) => {
        return await PostModel.findById(id, null, { session });
      };

      const post = await Utility.runOperationInTransaction(cb);
      if (!post) return;

      // track the number of viewers
      {
        const currUserId = Utility.extractUserIdFromToken(req);
        logger.info(`getting user id for view tracking: ${currUserId}...`);

        const postViewersSet: Set<string> = Utility.arrayToSet(post.views!);
        if (!postViewersSet.has(currUserId)) {
          post.views!.push(currUserId);

          const cb: TransactionCallback<void> = async (session) => {
            await post.save({ session });
          };
          await Utility.runOperationInTransaction(cb);
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
    res: Response
  ): Promise<any> {
    try {
      logger.info("fetching all posts...");

      const cb: TransactionCallback<PostDocument[]> = async (session) => {
        const posts = await PostModel.find({})
          .sort({ lastModified: -1 })
          .session(session);

        return posts as unknown as PostDocument[];
      };

      const posts = await Utility.runOperationInTransaction(cb);
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
    res: Response
  ): Promise<any> {
    try {
      // grab user id from jwt
      const currUserId = Utility.extractUserIdFromToken(req);
      logger.info(`creating post for user with id: ${currUserId}...`);

      // create post
      const cb: TransactionCallback<PostDocument> = async (session) => {
        const post = await PostModel.create(
          [{ author: currUserId, ...req.body }],
          { session }
        );

        return post[0] as unknown as PostDocument;
      };

      const post = await Utility.runOperationInTransaction(cb);
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
    res: Response
  ): Promise<any> {
    try {
      const id = extractPostIdFromReq(req, res);
      if (!id) return;

      logger.info(`updating post with id: ${id}...`);

      const cb: TransactionCallback<PostDocument | null> = async (session) => {
        const post = await PostModel.findById(id, null, { session });
        if (!post) {
          logger.error(`post with id: ${id} not found`);
          res.status(404).json({ message: `Post with id ${id} not found` });

          return null;
        }

        await post.populate({
          path: "author",
          select: "name id",
          options: { session },
        });

        return post as unknown as PostDocument;
      };

      let post = await Utility.runOperationInTransaction(cb);
      if (!post) return;

      // check if user is the author of the post
      if (
        Utility.isCurrUserSameAsCreator(req, res, (<any>post.author).id) ===
        false
      ) {
        return;
      }

      // update post's body
      const newBody = req.body.body;
      if (newBody) {
        post.body = newBody;
        delete req.body.body;
      }

      const newData: PostUpdateReqBody = req.body;
      newData["lastModified"] = new Date();
      post = (await Utility.updateDoc(post, newData)) as PostDocument;

      logger.info(`post updated successfully! post: ${JSON.stringify(post)}`);

      return res.status(200).json({ message: "Post updated", post });
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
    res: Response
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
        Utility.isCurrUserSameAsCreator(req, res, (<any>post.author).id) ===
        false
      ) {
        return;
      }

      const cb: TransactionCallback<void> = async (session) => {
        await post.deleteOne({ session });
      };

      await Utility.runOperationInTransaction(cb);
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
    res: Response
  ): Promise<any> {
    try {
      const id = extractPostIdFromReq(req, res);
      if (!id) return;

      logger.info(`fetching post by id: ${id}...`);

      const cb: TransactionCallback<PostDocument | null> = async (session) => {
        return await PostModel.findById(id, null, { session });
      };
      const post = await Utility.runOperationInTransaction(cb);
      if (!post) return;

      // update likes
      logger.info(`updating user likes...`);
      const updateOnLikes = Utility.updateUserReactions(req, res, post.likes!);
      if (!updateOnLikes) return;

      // if the user disliked the post, "remove" them from dislikes
      if (post.dislikes!.length > 0) {
        const dislikeSet = Utility.arrayToSet(post.dislikes!);
        const userId: string = ((<any>req.user!).data as JwtPayload).data.sub;

        if (dislikeSet.has(userId)) {
          dislikeSet.delete(userId); // remove user
          post.dislikes = dislikeSet.size > 0 ? Array.from(dislikeSet) : [];
        }
      }

      const postSaveCb: TransactionCallback<void> = async (session) => {
        await post.save({ session });
      };

      await Utility.runOperationInTransaction(postSaveCb);
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
    res: Response
  ): Promise<any> {
    try {
      const id = extractPostIdFromReq(req, res);
      if (!id) return;
      logger.info(`fetching post by id: ${id}...`);

      const cb: TransactionCallback<PostDocument | null> = async (session) => {
        return await PostModel.findById(id, null, { session });
      };
      const post = await Utility.runOperationInTransaction(cb);
      if (!post) return;

      // update dislikes
      logger.info(`updating user dislikes...`);
      const updateOnDislikes = Utility.updateUserReactions(
        req,
        res,
        post.dislikes!
      );
      if (!updateOnDislikes) return;

      // if the user liked the post, "remove" them from likes
      if (post.likes!.length > 0) {
        const likesSet = Utility.arrayToSet(post.likes!);
        const userId: string = ((<any>req.user!).data as JwtPayload).data.sub;
        if (likesSet.has(userId)) {
          likesSet.delete(userId); // remove user from likes
          post.likes = likesSet.size > 0 ? Array.from(likesSet) : [];
        }
      }

      const postSaveCb: TransactionCallback<void> = async (session) => {
        await post.save({ session });
      };

      await Utility.runOperationInTransaction(postSaveCb);
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
    res: Response
  ): Promise<any> {
    try {
      const id = extractPostIdFromReq(req, res);
      if (!id) return;
      logger.info(`fetching post by id: ${id}...`);

      // check if post exists
      const cb: TransactionCallback<PostDocument | null> = async (session) => {
        return await PostModel.findById(id, null, { session });
      };

      const post = await Utility.runOperationInTransaction(cb);
      if (!post) return;

      if (post.likes!.length <= 0) {
        logger.info("no likes to remove from");
        return res.status(400).json({ message: "there are no likes yet" });
      }

      logger.info(`removing user like...`);

      const likesSet = Utility.arrayToSet(post.likes!);
      const userId: string = ((<any>req.user!).data as JwtPayload).data.sub;
      if (!likesSet.has(userId)) {
        logger.info("user already unliked post");
        return res.status(400).json({
          message: "user already unliked post",
        });
      }

      likesSet.delete(userId); // remove user from likes
      post.likes = likesSet.size > 0 ? Array.from(likesSet) : [];

      const postSaveCb: TransactionCallback<void> = async (session) => {
        await post.save({ session });
      };

      await Utility.runOperationInTransaction(postSaveCb);
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
    res: Response
  ): Promise<any> {
    try {
      const id = extractPostIdFromReq(req, res);
      if (!id) return;

      logger.info(`fetching post by id: ${id}...`);

      // check if post exists
      const cb: TransactionCallback<PostDocument | null> = async (session) => {
        return await PostModel.findById(id, null, { session });
      };

      const post = await Utility.runOperationInTransaction(cb);
      if (!post) return;

      // update dislikes
      if (post.dislikes!.length <= 0) {
        logger.info("no dislikes to remove from");
        return res.status(400).json({ message: "there are no dislikes yet" });
      }

      logger.info(`removing user dislike...`);

      const dislikesSet = Utility.arrayToSet(post.dislikes!);
      const userId: string = ((<any>req.user!).data as JwtPayload).data.sub;
      if (!dislikesSet.has(userId)) {
        logger.info("user already removed their dislike from post");
        return res.status(204).json({
          message: "user already removed their dislike from post",
        });
      }

      dislikesSet.delete(userId); // remove user from dislikes
      post.dislikes = dislikesSet.size > 0 ? Array.from(dislikesSet) : [];

      const postSaveCb: TransactionCallback<void> = async (session) => {
        await post.save({ session });
      };

      await Utility.runOperationInTransaction(postSaveCb);
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
    const cb: TransactionCallback<PostDocument | null> = async (session) => {
      const post = await PostModel.findById(id, null, { session });
      if (!post) {
        logger.error(`post with id ${id} not found`);
        res.status(404).json({ message: `Post with id ${id} not found` });
        return null;
      }

      await post.populate({
        path: "author",
        select: "name id",
        options: { session },
      });

      return post as unknown as PostDocument;
    };

    const post = await Utility.runOperationInTransaction(cb);
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
