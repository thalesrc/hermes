import { SendingService } from "./sending-service.interface";

export function messageSenderFactory(service: SendingService): () => ClassDecorator {
	return function() {
		return function(Constructor) {
			// TODO: fill
		} as any;
	}
}
