import type { LinksFunction } from "react-router";
import stil from "./intern.css?url";

export const internLinks: LinksFunction = () => [{ rel: "stylesheet", href: stil }];
