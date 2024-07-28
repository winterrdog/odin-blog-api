import { createBrowserRouter } from "react-router-dom";
import Homepage from "./homepage";
import About from "./about";
import ErrorElement from "./errorElement";

const routes = createBrowserRouter([
    {
      path: '/',
      errorElement: <ErrorElement />,
      element: <Homepage />,
    },
    {
      path: '/about',
      errorElement: <ErrorElement />,
      element: <About />,
    }
  ], 
  {
    basename: '/odin-blog-api',
  }
);

export default routes;