import { defineMcp } from "@lovable.dev/mcp-js";
import listEvents from "./tools/list-events";
import getEvent from "./tools/get-event";

export default defineMcp({
  name: "tickethub-bh-mcp",
  title: "TicketHub BH",
  version: "0.1.0",
  instructions:
    "Public data from TicketHub BH — events/tickets. Use list_events / get_event to discover upcoming shows in Belo Horizonte.",
  tools: [listEvents, getEvent],
});
