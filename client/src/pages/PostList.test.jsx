import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderRoute } from "../../test-setup/renderRoute";
import { addMockApiRouteHandler } from "../../test-setup/mockServer";
import userEvent from "@testing-library/user-event";
describe("PostList page", () => {
  it("should filter post list based on selected filters", async () => {
    const posts = [
      {
        id: 1,
        title: "first post",
        body: "first post body",
        userId: 1,
      },
      {
        id: 2,
        title: "second post",
        body: "second post body",
        userId: 2,
      },
    ];
    addMockApiRouteHandler("get", "/posts", (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          posts.filter((post) => {
            const searchParams = new URL(req.url).searchParams;
            const title = searchParams.get("q") || "";
            const userId = parseInt(searchParams.get("userId"));
            return (
              post.title.includes(title) &&
              (isNaN(userId) || post.userId === userId)
            );
          })
        )
      );
    });

    addMockApiRouteHandler("get", "/users", (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          {
            id: 1,
            name: "first user",
          },
          {
            id: 2,
            name: "second user",
          },
        ])
      );
    });

    renderRoute("/posts");

    expect(await screen.findByText("first post")).toBeInTheDocument();
    expect(screen.getByText("second post")).toBeInTheDocument();

    const user = userEvent.setup();

    const queryInput = screen.getByLabelText("Query");
    const filterBtn = screen.getByText("Filter");

    await user.type(queryInput, "third");
    await user.click(filterBtn);

    expect(screen.queryByText("first post")).not.toBeInTheDocument();
    expect(screen.queryByText("second post")).not.toBeInTheDocument();
    expect(queryInput).toHaveValue("third");

    const authorInput = screen.getByLabelText("Author");

    await user.selectOptions(authorInput, "second user");
    await user.clear(queryInput);
    await user.click(filterBtn);
    expect(screen.queryByText("first post")).not.toBeInTheDocument();
    expect(screen.getByText("second post")).toBeInTheDocument();
    expect(authorInput).toHaveValue("2");
  });
});
