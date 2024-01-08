import { CoinEnum, Player, Rank, SequenceCard, Suit, Team } from './types';

export const getNumberOfCardForPlayer = (number_of_players: number): number => {
    let number_of_cards_to_each_player;
    switch (number_of_players) {
        case 2:
            number_of_cards_to_each_player = 7;
            break;
        case 3:
        case 4:
            number_of_cards_to_each_player = 6;
            break;
        case 6:
            number_of_cards_to_each_player = 5;
            break;
        case 8:
        case 9:
            number_of_cards_to_each_player = 4;
            break;
        case 10:
        case 12:
            number_of_cards_to_each_player = 3;
            break;
        default:
            number_of_cards_to_each_player = 0;
    }
    return number_of_cards_to_each_player;
};

export const getNumberOfWinningSequence = (
    number_of_players: number
): number => {
    let number_of_winning_sequence = 2;
    if (number_of_players % 3 === 0) {
        number_of_winning_sequence = 1;
    }
    return number_of_winning_sequence;
};

const Ranks: Rank[] = [
    Rank.Ace,
    Rank.Two,
    Rank.Three,
    Rank.Four,
    Rank.Five,
    Rank.Six,
    Rank.Seven,
    Rank.Eight,
    Rank.Nine,
    Rank.Ten,
    Rank.Jack,
    Rank.Queen,
    Rank.King
];
const Suits: Suit[] = [Suit.Club, Suit.Diamond, Suit.Heart, Suit.Spade];

export const getDeck = (number_of_decks = 1) => {
    const deck_of_card: string[] = [];
    const cards = [].concat.apply([], Array(number_of_decks).fill(Ranks));
    Promise.all(
        cards.map(async (rank) => {
            Promise.all(
                Suits.map(async (suit) => {
                    await deck_of_card.push(`${rank}-${suit}`);
                })
            );
        })
    );
    const deck = shuffle(deck_of_card, 25);
    return deck;
};

const shuffle = (deck, numberOfShuffle = 1) => {
    if (numberOfShuffle === 1) {
        return [...deck].sort(() => Math.random() - 0.5);
    }
    return shuffle(deck, numberOfShuffle - 1);
};

export const getCardsForPlayers = (
    number_of_decks: number,
    number_of_cards_per_player: number,
    number_of_players: number
) => {
    const cards: any = [];
    const deck = getDeck(number_of_decks);
    Array.from(Array(number_of_cards_per_player).keys()).map(() => {
        Array.from(Array(number_of_players).keys()).map((__key, index) => {
            if (!cards[index]) {
                cards[index] = [];
            }
            const newCard = deck.pop();
            cards[index].push(newCard);
        });
    });
    return {
        deck,
        cards
    };
};

export const getTeam = async (
    players: Player[],
    number_of_players: number,
    cards: any
): Promise<any[]> => {
    const newPlayers: Player[] = [];
    await Promise.all(
        players.map((player: Player, index: number) => {
            let team: Team = Team.BLUE;
            if (!player) {
                return;
            }
            if (number_of_players % 2 === 0 && index % 2 === 0) {
                team = Team.GREEN;
            }
            if (number_of_players % 3 === 0) {
                if (index % 3 === 0) {
                    team = Team.GREEN;
                }
                if (index % 3 === 1) {
                    team = Team.RED;
                }
            }
            newPlayers.push({
                ...player,
                team,
                my_cards: cards[index]
            });
        })
    );
    return newPlayers;
};

function getSequence(
    type: 'VERTICAL' | 'HORIZONTAL' | 'F_DIAGONAL' | 'B_DIAGONAL',
    board: SequenceCard[][],
    col: number,
    row: number,
    team: CoinEnum
) {
    let coinConsecutive: any = [];
    let disableCoinCount: number = 0;
    let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    if (type === 'F_DIAGONAL' || type === 'B_DIAGONAL') {
        arr = [
            9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9
        ];
    }
    arr.map((idx) => {
        let newRow = row,
            newCol = col;
        if (type === 'VERTICAL') {
            newRow = idx;
        }
        if (type === 'HORIZONTAL') {
            newCol = idx;
        }
        if (type === 'B_DIAGONAL' || type === 'F_DIAGONAL') {
            newRow = row - idx;
            newCol = type === 'F_DIAGONAL' ? col + idx : col - idx;
            if (newRow < 0 || newCol < 0 || newRow > 9 || newCol > 9) {
                return;
            }
        }

        const { coin, row: nRow, col: nCol, disable } = board[newRow][newCol];
        if (coin === team || coin === CoinEnum.WILD) {
            if (disable && coin !== CoinEnum.WILD) {
                disableCoinCount++;
            }
            // only one coin can be overlap
            if (disableCoinCount > 1) {
                coinConsecutive = [];
                disableCoinCount = 0;
                return;
            }
            coinConsecutive.push(`${nRow}-${nCol}`);
            return;
        }
        if (coinConsecutive.length < 5) {
            coinConsecutive = [];
        }
    });
    if (coinConsecutive.length >= 5) {
        return coinConsecutive.splice(0, 5);
    }
    return [];
}

export async function hasSequence(
    board: SequenceCard[][],
    row,
    col,
    team: CoinEnum
): Promise<{ sequences: number; board: SequenceCard[][] }> {
    let newSequence = 0;
    const newBoard: SequenceCard[][] = [];
    Object.assign(newBoard, board);

    // Check vertical Sequence
    // const hasVertical = verticalSequence(newBoard, col, team);
    const hasVertical = getSequence('VERTICAL', newBoard, col, row, team);
    if (hasVertical.length > 0) {
        newSequence++;
        console.info('team %s has Vertical Sequence', team, hasVertical);
        Promise.all(
            hasVertical.map((v: string) => {
                const uuid = v?.split('-');
                const verticalRow = parseInt(uuid[0]);
                const verticalCol = parseInt(uuid[1]);
                newBoard[verticalRow][verticalCol].disable = true;
                return v;
            })
        );
    }

    // const hasHorizontal = horizontalSequence(newBoard, row, team);
    const hasHorizontal = getSequence('HORIZONTAL', newBoard, col, row, team);
    if (hasHorizontal.length > 0) {
        newSequence++;
        console.info('team %s has Horizontal Sequence', team, hasHorizontal);
        Promise.all(
            hasHorizontal.map((h: string) => {
                const uuid = h?.split('-');
                const verticalRow = parseInt(uuid[0]);
                const verticalCol = parseInt(uuid[1]);
                newBoard[verticalRow][verticalCol].disable = true;
                return h;
            })
        );
    }

    // const backSlash = backSlashSequence(newBoard, row, col, team);
    const backSlash = getSequence('B_DIAGONAL', newBoard, col, row, team);
    if (backSlash.length > 0) {
        newSequence++;
        console.info('team %s has BackSlash Sequence', team, backSlash);
        Promise.all(
            backSlash.map((b: string) => {
                const uuid = b?.split('-');
                const verticalRow = parseInt(uuid[0]);
                const verticalCol = parseInt(uuid[1]);
                newBoard[verticalRow][verticalCol].disable = true;
                return b;
            })
        );
    }

    // const forwardSlash = forwardSlashSequence(newBoard, row, col, team);
    const forwardSlash = getSequence('F_DIAGONAL', newBoard, col, row, team);
    if (forwardSlash.length > 0) {
        newSequence++;
        console.info('team %s has Forward Slash Sequence', team, forwardSlash);
        Promise.all(
            forwardSlash.map((f: string) => {
                const uuid = f?.split('-');
                const verticalRow = parseInt(uuid[0]);
                const verticalCol = parseInt(uuid[1]);
                newBoard[verticalRow][verticalCol].disable = true;
                return f;
            })
        );
    }
    return { sequences: newSequence, board: newBoard };
}

export const rawBoard = [
    [
        {
            card: '0-J',
            row: 0,
            col: 0,
            coin: 'W',
            disable: true
        },
        {
            card: '6-D',
            row: 0,
            col: 1
        },
        {
            card: '7-D',
            row: 0,
            col: 2
        },
        {
            card: '8-D',
            row: 0,
            col: 3
        },
        {
            card: '9-D',
            row: 0,
            col: 4
        },
        {
            card: '10-D',
            row: 0,
            col: 5
        },
        {
            card: 'Q-D',
            row: 0,
            col: 6
        },
        {
            card: 'K-D',
            row: 0,
            col: 7
        },
        {
            card: 'A-D',
            row: 0,
            col: 8
        },
        {
            card: '0-J',
            row: 0,
            col: 9,
            coin: 'W',
            disable: true
        }
    ],
    [
        {
            card: '5-D',
            row: 1,
            col: 0
        },
        {
            card: '3-H',
            row: 1,
            col: 1
        },
        {
            card: '2-H',
            row: 1,
            col: 2
        },
        {
            card: '2-S',
            row: 1,
            col: 3
        },
        {
            card: '3-S',
            row: 1,
            col: 4
        },
        {
            card: '4-S',
            row: 1,
            col: 5
        },
        {
            card: '5-S',
            row: 1,
            col: 6
        },
        {
            card: '6-S',
            row: 1,
            col: 7
        },
        {
            card: '7-S',
            row: 1,
            col: 8
        },
        {
            card: 'A-C',
            row: 1,
            col: 9
        }
    ],
    [
        {
            card: '4-D',
            row: 2,
            col: 0
        },
        {
            card: '4-H',
            row: 2,
            col: 1
        },
        {
            card: 'K-D',
            row: 2,
            col: 2
        },
        {
            card: 'A-D',
            row: 2,
            col: 3
        },
        {
            card: 'A-C',
            row: 2,
            col: 4
        },
        {
            card: 'K-C',
            row: 2,
            col: 5
        },
        {
            card: 'Q-C',
            row: 2,
            col: 6
        },
        {
            card: '10-C',
            row: 2,
            col: 7
        },
        {
            card: '8-S',
            row: 2,
            col: 8
        },
        {
            card: 'K-C',
            row: 2,
            col: 9
        }
    ],
    [
        {
            card: '3-D',
            row: 3,
            col: 0
        },
        {
            card: '5-H',
            row: 3,
            col: 1
        },
        {
            card: 'Q-D',
            row: 3,
            col: 2
        },
        {
            card: 'Q-H',
            row: 3,
            col: 3
        },
        {
            card: '10-H',
            row: 3,
            col: 4
        },
        {
            card: '9-H',
            row: 3,
            col: 5
        },
        {
            card: '8-H',
            row: 3,
            col: 6
        },
        {
            card: '9-C',
            row: 3,
            col: 7
        },
        {
            card: '9-S',
            row: 3,
            col: 8
        },
        {
            card: 'Q-C',
            row: 3,
            col: 9
        }
    ],
    [
        {
            card: '2-D',
            row: 4,
            col: 0
        },
        {
            card: '6-H',
            row: 4,
            col: 1
        },
        {
            card: '10-D',
            row: 4,
            col: 2
        },
        {
            card: 'K-H',
            row: 4,
            col: 3
        },
        {
            card: '3-H',
            row: 4,
            col: 4
        },
        {
            card: '2-H',
            row: 4,
            col: 5
        },
        {
            card: '7-H',
            row: 4,
            col: 6
        },
        {
            card: '8-C',
            row: 4,
            col: 7
        },
        {
            card: '10-S',
            row: 4,
            col: 8
        },
        {
            card: '10-C',
            row: 4,
            col: 9
        }
    ],
    [
        {
            card: 'A-S',
            row: 5,
            col: 0
        },
        {
            card: '7-H',
            row: 5,
            col: 1
        },
        {
            card: '9-D',
            row: 5,
            col: 2
        },
        {
            card: 'A-H',
            row: 5,
            col: 3
        },
        {
            card: '4-H',
            row: 5,
            col: 4
        },
        {
            card: '5-H',
            row: 5,
            col: 5
        },
        {
            card: '6-H',
            row: 5,
            col: 6
        },
        {
            card: '7-C',
            row: 5,
            col: 7
        },
        {
            card: 'Q-S',
            row: 5,
            col: 8
        },
        {
            card: '9-C',
            row: 5,
            col: 9
        }
    ],
    [
        {
            card: 'K-S',
            row: 6,
            col: 0
        },
        {
            card: '8-H',
            row: 6,
            col: 1
        },
        {
            card: '8-D',
            row: 6,
            col: 2
        },
        {
            card: '2-C',
            row: 6,
            col: 3
        },
        {
            card: '3-C',
            row: 6,
            col: 4
        },
        {
            card: '4-C',
            row: 6,
            col: 5
        },
        {
            card: '5-C',
            row: 6,
            col: 6
        },
        {
            card: '6-C',
            row: 6,
            col: 7
        },
        {
            card: 'K-S',
            row: 6,
            col: 8
        },
        {
            card: '8-C',
            row: 6,
            col: 9
        }
    ],
    [
        {
            card: 'Q-S',
            row: 7,
            col: 0
        },
        {
            card: '9-H',
            row: 7,
            col: 1
        },
        {
            card: '7-D',
            row: 7,
            col: 2
        },
        {
            card: '6-D',
            row: 7,
            col: 3
        },
        {
            card: '5-D',
            row: 7,
            col: 4
        },
        {
            card: '4-D',
            row: 7,
            col: 5
        },
        {
            card: '3-D',
            row: 7,
            col: 6
        },
        {
            card: '2-D',
            row: 7,
            col: 7
        },
        {
            card: 'A-S',
            row: 7,
            col: 8
        },
        {
            card: '7-C',
            row: 7,
            col: 9
        }
    ],
    [
        {
            card: '10-S',
            row: 8,
            col: 0
        },
        {
            card: '10-H',
            row: 8,
            col: 1
        },
        {
            card: 'Q-H',
            row: 8,
            col: 2
        },
        {
            card: 'K-H',
            row: 8,
            col: 3
        },
        {
            card: 'A-H',
            row: 8,
            col: 4
        },
        {
            card: '2-C',
            row: 8,
            col: 5
        },
        {
            card: '3-C',
            row: 8,
            col: 6
        },
        {
            card: '4-C',
            row: 8,
            col: 7
        },
        {
            card: '5-C',
            row: 8,
            col: 8
        },
        {
            card: '6-C',
            row: 8,
            col: 9
        }
    ],
    [
        {
            card: '0-J',
            row: 9,
            col: 0,
            coin: 'W',
            disable: true
        },
        {
            card: '9-S',
            row: 9,
            col: 1
        },
        {
            card: '8-S',
            row: 9,
            col: 2
        },
        {
            card: '7-S',
            row: 9,
            col: 3
        },
        {
            card: '6-S',
            row: 9,
            col: 4
        },
        {
            card: '5-S',
            row: 9,
            col: 5
        },
        {
            card: '4-S',
            row: 9,
            col: 6
        },
        {
            card: '3-S',
            row: 9,
            col: 7
        },
        {
            card: '2-S',
            row: 9,
            col: 8
        },
        {
            card: '0-J',
            row: 9,
            col: 9,
            coin: 'W',
            disable: true
        }
    ]
];
