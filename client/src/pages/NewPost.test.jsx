import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderRoute } from "../../test-setup/renderRoute";
import { addMockApiRouteHandler } from "../../test-setup/mockServer";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";

describe("NewPost page", () => {
  it("should create new post with valid form values", async () => {
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

    const newPostApiHandler = vi.fn((req, res, ctx) => {
      const bodyJSON = req.body;

      const title = bodyJSON.title;
      const userId = bodyJSON.userId;
      const body = bodyJSON.body;
      const id = 1;

      addMockApiRouteHandler("get", `/posts/${id}`, () => {
        return res(
          ctx.status(200),
          ctx.json({
            id,
            title,
            body,
            userId,
          })
        );
      });
      addMockApiRouteHandler("get", `/users/${userId}`, () => {
        return res(
          ctx.status(200),
          ctx.json({
            id,
            name: "second user",
          })
        );
      });
      addMockApiRouteHandler("get", `/posts/${id}/comments`, () => {
        return res(ctx.status(200), ctx.json([]));
      });

      return res(
        ctx.status(200),
        ctx.json({
          id,
          title,
          body,
          userId,
        })
      );
    });

    addMockApiRouteHandler("post", "/posts", newPostApiHandler);

    renderRoute("/posts/new");

    const user = userEvent.setup();

    const titleInput = await screen.findByLabelText("Title");
    const authorInput = screen.getByLabelText("Author");
    const bodyInput = screen.getByLabelText("Body");
    const saveBtn = screen.getByText("Save");

    const title = "third post";
    const selectedAuthor = "second user";
    const body = "third post body";

    await user.type(titleInput, title);
    await user.selectOptions(authorInput, selectedAuthor);
    await user.type(bodyInput, body);

    await user.click(saveBtn);

    expect(newPostApiHandler).toHaveBeenCalledOnce();
    expect(screen.getByText("third post")).toBeInTheDocument();
    expect(screen.getByText("second user")).toBeInTheDocument();
    expect(screen.getByText("third post body")).toBeInTheDocument();
    screen.debug();
  });
});
