import { SendingService } from "./sending-service.interface";
import { SENDING_SERVICE } from "./selectors";

export function messageSenderFactory(service: SendingService): () => ClassDecorator {
	return function() {
		return function(Constructor) {
			Constructor[SENDING_SERVICE] = service;

			return Constructor;
		} as any;
	}
}
