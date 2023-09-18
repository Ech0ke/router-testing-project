import { render } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { routes } from "../src/routes";

export function renderRoute(route = "/") {
  return render(
    <RouterProvider
      router={createMemoryRouter(routes, {
        initialEntries: [{ pathname: route }],
      })}
    ></RouterProvider>
  );
}
