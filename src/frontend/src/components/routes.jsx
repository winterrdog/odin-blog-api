import { createBrowserRouter } from "react-router-dom";
import Homepage from "./homepage";
import ErrorElement from "./errorElement";
import Write from "./write";
import Post from "./post";

const routes = createBrowserRouter([
    {
      path: '/',
      errorElement: <ErrorElement />,
      element: <Homepage />,
    },
    {
      path: '/write',
      element: <Write />
    },
    {
      path: '/post',
      element: <Post />
    },
  ], 
  {
    basename: '/odin-blog-api',
  }
);

export default routes;