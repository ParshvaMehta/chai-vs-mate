import React, { forwardRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../../constants/Colors";
const InputWithIcon = forwardRef((props: any, ref) => {
	return (
		<View style={styles.inputContainer}>
			{props.icon && (
				<Ionicons
					{...props.icon}
					size={20}
					color={Theme.color.primary.DEFAULT}
					style={styles.icon}
				/>
			)}
			<TextInput style={styles.input} {...props} ref={ref} />
		</View>
	);
});
const styles = StyleSheet.create({
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: Theme.color.primary.DEFAULT,
		borderRadius: 6,
		padding: 6,
		marginVertical: 10,
	},
	icon: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		height: 36,
		fontSize: 20,
		fontFamily: "Nunito_500Medium",
	},
});

export default InputWithIcon;
