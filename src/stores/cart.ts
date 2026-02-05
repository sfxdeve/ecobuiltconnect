import { Store } from "@tanstack/react-store";

export interface CartItem {
	productId: string;
	quantity: number;
	vendor: {
		id: string;
		name: string;
	};
}

export interface CartState {
	isOpen: boolean;
	items: CartItem[];
	vendor?: {
		id: string;
		name: string;
	};
}

export interface AddCartItemConflictResult {
	status: "conflict";
	currVendorName: string;
	newVendorName: string;
}

export interface AddCartItemSuccessResult {
	status: "added";
}

export type AddCartItemResult =
	| AddCartItemConflictResult
	| AddCartItemSuccessResult;

export const cartStore = new Store<CartState>({
	isOpen: false,
	items: [],
	vendor: undefined,
});

export const cartActions = {
	setCartIsOpen(isOpen: boolean) {
		cartStore.setState((state) => ({ ...state, isOpen }));
	},

	toggleIsOpen() {
		cartStore.setState((state) => ({ ...state, isOpen: !state.isOpen }));
	},

	clearCart() {
		cartStore.setState((state) => ({
			...state,
			items: [],
			vendor: undefined,
		}));
	},

	addItem(newItem: CartItem): AddCartItemResult {
		let result: AddCartItemResult = { status: "added" };

		cartStore.setState((state) => {
			const currentVendor = state.vendor ?? state.items[0]?.vendor;

			if (
				currentVendor.id !== undefined &&
				currentVendor.id !== newItem.vendor.id
			) {
				result = {
					status: "conflict",
					currVendorName: currentVendor.name ?? "another vendor",
					newVendorName: newItem.vendor.name,
				};

				return state;
			}

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
					vendor: {
						id: existing.vendor.id,
						name: existing.vendor.name,
					},
				};
			}

			return {
				...state,
				items: [...state.items, newItem],
				vendor: {
					id: newItem.vendor.id,
					name: newItem.vendor.name,
				},
			};
		});

		return result;
	},

	replaceWithItem(newItem: CartItem) {
		cartStore.setState((state) => ({
			...state,
			items: [newItem],
			vendor: {
				id: newItem.vendor.id,
				name: newItem.vendor.name,
			},
		}));
	},

	removeItem(productId: string) {
		cartStore.setState((state) => {
			const items = state.items.filter((item) => item.productId !== productId);
			const vendor = items[0]?.vendor;

			return {
				...state,
				items,
				vendor,
			};
		});
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
			cartActions.removeItem(productId);

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
