import { defineMcp } from "@lovable.dev/mcp-js";
import listEvents from "./tools/list-events";
import getEvent from "./tools/get-event";
import listPosts from "./tools/list-posts";
import getPost from "./tools/get-post";
import listAlbums from "./tools/list-albums";

export default defineMcp({
  name: "tickethub-bh-mcp",
  title: "TicketHub BH",
  version: "0.1.0",
  instructions:
    "Public data from TicketHub BH — events/tickets, blog posts, and photo albums. Use list_events / get_event to discover upcoming shows in Belo Horizonte, list_blog_posts / get_blog_post for editorial content, and list_photo_albums for past-event galleries.",
  tools: [listEvents, getEvent, listPosts, getPost, listAlbums],
});
