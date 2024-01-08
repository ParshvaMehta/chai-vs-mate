import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../../constants/Colors";
interface CoinProps {
	team: string;
	size?: number;
}

const Coin: React.FC<CoinProps> = ({ team, size = 36 }) => {
	const coinColor = {
		// R: '#7F1917',
		// G: '#006f3c',
		// B: '#264b96',
		G: Theme.color.success[750],
		B: Theme.color.info[650],
		R: Theme.color.danger[700],
	};
	if (team === "W") {
		return;
	}
	return (
		<Ionicons name="disc" size={size} color={coinColor[team] || "black"} />
	);
};

export default Coin;
