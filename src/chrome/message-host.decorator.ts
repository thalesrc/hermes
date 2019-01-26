import { messageHostFactory } from "../message-host.factory";
import { ChromeHostingService } from "./hosting-service";

const defaultHostingService = new ChromeHostingService();

export const MessageHost = messageHostFactory(defaultHostingService);
