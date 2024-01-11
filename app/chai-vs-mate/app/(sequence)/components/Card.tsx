import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MIcon from "react-native-vector-icons/MaterialIcons";
import Coin from "./Coin";
import { CoinEnum, Rank, Suit } from "../helpers/types";
import { Theme } from "../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
interface CardProps {
	suit: Suit;
	rank: string | number;
	coin?: string;
	canDiscard?: boolean;
	onPress?: (
		suit: string,
		rank: string | number,
		coin?: string,
		row?: number,
		col?: number,
		disable?: boolean
	) => void | Promise<void>;
	onDiscardPress?: (
		suit: string,
		rank: string | number,
		coin?: string,
		row?: number,
		col?: number,
		disable?: boolean
	) => void;
	row?: number;
	col?: number;
	disable?: boolean;
	isSelected?: boolean;
	animateCoin?: boolean;
}

const DEFAULT_FONT_SIZE = 24;
const DEFAULT_ICON_SIZE = DEFAULT_FONT_SIZE + 4;
const suitIcon = {
	S: "cards-spade",
	H: "cards-heart",
	C: "cards-club",
	D: "cards-diamond",
	J: "cards-outline",
	ONE_EYE: "exposure-neg-1",
	TWO_EYE: "exposure-plus-1",
};
const textColor = {
	S: "#181818",
	H: Theme.color.danger[650],
	C: "#181818",
	D: Theme.color.danger[650],
	J: Theme.color.primary.DEFAULT,
	ONE_EYE: Theme.color["color-4"][750],
	TWO_EYE: Theme.color.success[800],
	SELECTED: Theme.color.primary[500],
};

const Card: React.FC<CardProps> = ({
	suit,
	rank,
	coin,
	row,
	col,
	disable,
	canDiscard = false,
	isSelected = false,
	onPress,
	onDiscardPress,
	animateCoin,
}) => {
	const animatedValue = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (animateCoin) {
			Animated.timing(animatedValue, {
				toValue: 1,
				duration: 1000, // You can adjust the duration
				useNativeDriver: false,
			}).start();
		} else {
			animatedValue.setValue(0);
		}
	}, [animateCoin]);

	const rotateY = animatedValue.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: ["0deg", "180deg", "360deg"],
	});

	const rankStyle = useMemo(() => {
		let color = textColor[suit] || "#000";
		if (rank === Rank.Jack) {
			if (suit === Suit.Club || suit === Suit.Diamond) {
				color = textColor.TWO_EYE;
			}
			if (suit === Suit.Heart || suit === Suit.Spade) {
				color = textColor.ONE_EYE;
			}
		}
		if (isSelected) {
			color = textColor.SELECTED;
		}

		return {
			...styles.rank,
			color,
		};
	}, [suit, rank, isSelected]);
	const suitSymbol = useMemo(() => {
		let icon = suitIcon[suit];
		let color = textColor[suit];
		if (rank === Rank.Jack) {
			if (suit === Suit.Club || suit === Suit.Diamond) {
				icon = suitIcon.TWO_EYE;
				color = textColor.TWO_EYE;
			}
			if (suit === Suit.Heart || suit === Suit.Spade) {
				icon = suitIcon.ONE_EYE;
				color = textColor.ONE_EYE;
			}
			if (isSelected) {
				color = textColor.SELECTED;
			}
			return <MIcon name={icon} color={color} size={DEFAULT_ICON_SIZE} />;
		}
		if (isSelected) {
			color = textColor.SELECTED;
		}
		return (
			<Icon
				name={icon}
				color={color}
				size={suit === Suit.Joker ? 32 : DEFAULT_ICON_SIZE}
			/>
		);
	}, [suit, rank, isSelected]);
	const getCardStyle = () => {
		let style = styles.card;
		if (isSelected) {
			style = {
				...style,
				backgroundColor: Theme.color.primary[250],
			};
		}
		if (canDiscard) {
			style = {
				...style,
				backgroundColor: Theme.color.warning[200],
			};
		}
		if (disable && suit !== Suit.Joker && !canDiscard) {
			let backgroundColor = style.backgroundColor;
			if (coin === CoinEnum.BLUE) {
				backgroundColor = Theme.color.info[200];
			}
			if (coin === CoinEnum.GREEN) {
				backgroundColor = Theme.color.success[150];
			}
			if (coin === CoinEnum.RED) {
				backgroundColor = Theme.color.danger[150];
			}
			style = {
				...style,
				backgroundColor,
			};
		}
		return style;
	};
	return (
		<View
			style={getCardStyle()}
			onTouchEnd={() =>
				!canDiscard && onPress?.(suit, rank, coin, row, col, disable)
			}
		>
			{rank && rank.toString() !== "0" && <Text style={rankStyle}>{rank}</Text>}
			<View style={{ marginBottom: 5 }}>{suitSymbol}</View>

			<View style={styles.coin}>
				<Animated.View style={{ transform: [{ rotateY }] }}>
					{coin && coin !== "W" && (
						<Coin team={coin} size={DEFAULT_ICON_SIZE} />
					)}
				</Animated.View>
			</View>

			<View style={styles.discardContainer}>
				{!coin && canDiscard && (
					<Ionicons
						onTouchEnd={() =>
							canDiscard &&
							onDiscardPress?.(suit, rank, coin, row, col, disable)
						}
						name="trash-bin"
						size={DEFAULT_ICON_SIZE}
						color={Theme.color.warning[750]}
					/>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		width: "100%",
		height: DEFAULT_FONT_SIZE * 2 + 12,
		borderWidth: 1,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Theme.color.info[100],
		elevation: 2,
	},
	rank: {
		marginTop: 5,
		alignItems: "center",
		fontWeight: "400",
		fontSize: DEFAULT_FONT_SIZE,
		fontFamily: "Wellfleet_400Regular",
	},
	discardContainer: {
		position: "absolute",
		alignContent: "center",
	},
	coin: {
		position: "absolute",
		elevation: 4,
	},
});

export default Card;
