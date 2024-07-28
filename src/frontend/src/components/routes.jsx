import { createBrowserRouter } from "react-router-dom";
import Homepage from "./homepage";
import ErrorElement from "./errorElement";
import Write from "./write";

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
  ], 
  {
    basename: '/odin-blog-api',
  }
);

export default routes;