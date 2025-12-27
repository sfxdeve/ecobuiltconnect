import { Store } from "@tanstack/react-store";

export interface CartItem {
	productId: string;
	quantity: number;
}

export interface CartState {
	isOpen: boolean;
	items: CartItem[];
}

export const cartStore = new Store<CartState>({
	isOpen: false,
	items: [],
});

export const cartActions = {
	setCartIsOpen(isOpen: boolean) {
		cartStore.setState((state) => ({ ...state, isOpen }));
	},

	toggleIsOpen() {
		cartStore.setState((state) => ({ ...state, isOpen: !state.isOpen }));
	},

	clearCart() {
		cartStore.setState((state) => ({ ...state, items: [] }));
	},

	addItem(newItem: CartItem) {
		cartStore.setState((state) => {
			const existing = state.items.find(
				(item) => item.productId === newItem.productId,
			);

			if (existing) {
				return {
					...state,
					items: state.items.map((item) =>
						item.productId === newItem.productId
							? { ...item, quantity: item.quantity + newItem.quantity }
							: item,
					),
				};
			}

			return {
				...state,
				items: [...state.items, newItem],
			};
		});
	},

	removeItem(productId: string) {
		cartStore.setState((state) => ({
			...state,
			items: state.items.filter((item) => item.productId !== productId),
		}));
	},

	incrementQuantity(productId: string) {
		cartStore.setState((state) => {
			const existing = state.items.find((item) => item.productId === productId);

			if (existing) {
				return {
					...state,
					items: state.items.map((item) =>
						item.productId === productId
							? { ...item, quantity: item.quantity + 1 }
							: item,
					),
				};
			}

			return state;
		});
	},

	decrementQuantity(productId: string) {
		cartStore.setState((state) => {
			const existing = state.items.find((item) => item.productId === productId);

			if (existing && existing.quantity > 1) {
				return {
					...state,
					items: state.items.map((item) =>
						item.productId === productId
							? { ...item, quantity: item.quantity - 1 }
							: item,
					),
				};
			}

			return state;
		});
	},

	updateQuantity(productId: string, quantity: number) {
		if (quantity <= 0) {
			this.removeItem(productId);

			return;
		}

		cartStore.setState((state) => {
			const existing = state.items.find((item) => item.productId === productId);

			if (!existing) {
				return state;
			}

			return {
				...state,
				items: state.items.map((item) =>
					item.productId === productId ? { ...item, quantity } : item,
				),
			};
		});
	},
};
