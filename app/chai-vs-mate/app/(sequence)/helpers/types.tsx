import { User } from "firebase/auth";

export enum GameStatus {
	"CREATED",
	"INPROGRESS",
	"COMPLETED",
}

export enum Team {
	"BLUE" = "B",
	"GREEN" = "G",
	"RED" = "R",
	"BLANK" = "",
	WILD = "W",
}

export interface PlayingCards {
	rank: Rank | "";
	suit: Suit;
}

export interface Player extends Partial<User> {
	team?: Team | "";
	my_cards?: string[];
}

export interface SequenceGame {
	created_at: string;
	game_status: GameStatus;
	host: Player;
	players: Player[];
	turn_idx?: number;
	next_turn_idx?: number;
	winning_sequence?: number;
	board?: Array<SequenceCard[]>;
	deck?: string[];
	completed_sequence?: object;
	winner?: Team | "";
	last_card?: SequenceCard;
}

export interface SequenceCard {
	card: string;
	row?: number;
	col?: number;
	coin?: CoinEnum | "";
	disable?: boolean;
}

export enum CoinEnum {
	WILD = "W",
	RED = "R",
	GREEN = "G",
	BLUE = "B",
}

export enum Suit {
	Spade = "S",
	Heart = "H",
	Diamond = "D",
	Club = "C",
	Joker = "J",
}

export enum Rank {
	Ace = "A",
	Two = "2",
	Three = "3",
	Four = "4",
	Five = "5",
	Six = "6",
	Seven = "7",
	Eight = "8",
	Nine = "9",
	Ten = "10",
	Jack = "J",
	Queen = "Q",
	King = "K",
}
