import { createBrowserRouter } from "react-router-dom";

import Homepage from "./homepage";
import ErrorElement from "./errorElement";
import Write from "./write";
import Post from "./post";
import App from "./App";
import About from "./about";
import Posts from "./posts";
import MyAccount from "./myaccount";

const routes = createBrowserRouter([
    {
      path: '/',
      errorElement: <ErrorElement />,
      element: <App />,
      children: [
        {
          index: true,
          path: '',
          element: <Homepage />
        },        
        {
          path: 'post',
          element: <Post />
        },
        {
          path: 'posts',
          element: <Posts />
        },
        {
          path: 'my-account',
          element: <MyAccount />
        }
      ]
    },
    {
      path: '/write',
      element: <Write />
    },
    {
      path: '/about',
      element: <About />,
    },
  ], 
  {
    basename: '/odin-blog-api',
  }
);

export default routes;