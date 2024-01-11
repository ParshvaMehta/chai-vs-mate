import { Audio } from "expo-av";

const SoundService = {
	soundObject: new Audio.Sound(),

	async loadSoundAsync(source: any) {
		try {
			await SoundService.soundObject.loadAsync(source);
		} catch (error) {
			console.error("Failed to load sound", error);
		}
	},

	async unloadSoundAsync() {
		try {
			await SoundService.soundObject.unloadAsync();
		} catch (error) {
			console.error("Failed to unload sound", error);
		}
	},
	async getSound() {
		try {
			return SoundService.soundObject;
		} catch (error) {
			console.error("Failed to unload sound", error);
		}
	},
	async playSoundAsync() {
		try {
			if (SoundService.soundObject && SoundService.soundObject._loaded) {
				await SoundService.soundObject.replayAsync();
			}
		} catch (error) {
			console.error("Failed to play sound", error);
		}
	},
};

export default SoundService;
