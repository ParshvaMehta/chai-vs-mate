import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	updateProfile,
	signOut,
	Auth,
	onAuthStateChanged,
	UserCredential,
	User,
} from "firebase/auth";

import { FIREBASE_AUTH } from "../constants/FireBaseConfig";

import { createContext, useEffect, useState, ReactNode } from "react";

interface AuthContextProps {
	createUser: (email: string, password: string) => Promise<UserCredential>;
	user: User | null;
	loginUser: (email: string, password: string) => Promise<UserCredential>;
	logOut: () => Promise<void>;
	updateUser: (displayName: string) => Promise<void | UserCredential>;
	loading: boolean;
}

export const AuthContext = createContext<AuthContextProps | any>({});

interface AuthProviderProps {
	children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const auth: Auth = FIREBASE_AUTH;

	const createUser = async (email: string, password: string) => {
		setLoading(true);
		return createUserWithEmailAndPassword(auth, email, password);
	};

	const loginUser = (email: string, password: string) => {
		setLoading(true);
		console.log(email, password);
		return signInWithEmailAndPassword(auth, email, password);
	};

	const logOut = () => {
		setLoading(true);
		return signOut(auth);
	};

	const updateUser = async (displayName: string) => {
		setLoading(true);
		try {
			const user = auth?.currentUser;
			if (user) {
				await updateProfile(auth?.currentUser, {
					displayName,
				});
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setLoading(false);
		});

		return () => {
			unsubscribe();
		};
	}, [auth]);

	const authValue: AuthContextProps = {
		createUser,
		user,
		loginUser,
		logOut,
		updateUser,
		loading,
	};

	return (
		<AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
	);
};

export default AuthProvider;
