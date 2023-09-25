import * as React from "react";
import * as Ariakit from "@ariakit/react";
import type * as Polymorphic from "./polymorphic";
import {
	isBooleanish,
	isFunction,
	toBoolean,
	useComposedEventHandlers,
	useComposedRefs,
} from "./utils";

type CompobobxItemType = Exclude<
	Ariakit.ComboboxStoreProps["items"],
	undefined
>[number];

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);
ComboboxContext.displayName = "ComboboxContext";

function useComboboxContext() {
	const ctx = React.useContext(ComboboxContext);
	if (!ctx) {
		throw Error("ComboboxContext can only be accessed in a Combobox component");
	}
	return ctx;
}

function useComboboxStoreContext() {
	const store = Ariakit.useComboboxContext();
	if (!store) {
		throw Error(
			"Ariakit.useComboboxContext can only be accessed in a Combobox component",
		);
	}
	return store;
}

interface ComboboxContextValue {
	openOnFocus: boolean;
	onSelect: undefined | ((value: string) => void);
	comboboxId: string;
	activeId: string | null | undefined;
	open: boolean;
	items: CompobobxItemType[];
}

type ComboboxProps = {
	openOnFocus?: boolean;
	onSelect?: (value: string) => void;
	children?:
		| React.ReactNode
		| ((props: {
				id: string;
				isExpanded: boolean;
				navigationValue: string | undefined;
		  }) => React.ReactNode);
};

export const Combobox = React.forwardRef(function Combobox(
	{ children, openOnFocus = false, onSelect, id: idProp, ...props },
	ref,
) {
	const generatedId = React.useId();
	const id = idProp ?? generatedId;
	const [activeId, setActiveId] = React.useState<string | null | undefined>();
	const [open, setOpen] = React.useState(false);
	const [items, setItems] = React.useState<CompobobxItemType[]>([]);
	const store = Ariakit.useComboboxStore({
		virtualFocus: true,
		activeId,
		setActiveId,
		open,
		setOpen,
		items,
		setItems,
	});

	const activeItem = items.find((item) => item.id === activeId);

	const isExpanded = open;
	return (
		<div
			{...props}
			id={id}
			data-reach-combobox=""
			data-state={getDataState("TODO")}
			data-expanded={isExpanded || undefined}
			ref={ref}
		>
			<Ariakit.ComboboxProvider store={store}>
				<ComboboxContext.Provider
					value={{
						comboboxId: id,
						openOnFocus,
						onSelect,
						activeId,
						open,
						items,
					}}
				>
					{isFunction(children)
						? children({
								id,
								isExpanded,
								navigationValue: activeItem?.value,
						  })
						: children}
				</ComboboxContext.Provider>
			</Ariakit.ComboboxProvider>
		</div>
	);
}) as Polymorphic.ForwardRefComponent<"div", ComboboxProps>;

type ComboboxInputProps = {
	autoComplete?: boolean;
	selectOnClick?: boolean;
};

export const ComboboxInput = React.forwardRef(function ComboboxInput(
	{
		selectOnClick,
		onFocus,
		onClick,
		autoComplete: autoCompleteProp,
		// back-compatible prop
		// @ts-expect-error
		autocomplete,
		...props
	},
	forwardedRef,
) {
	const { openOnFocus } = useComboboxContext();
	const store = useComboboxStoreContext();
	const { setActiveId, getState, setOpen } = store;

	let autoComplete = isBooleanish(autoCompleteProp)
		? toBoolean(autoCompleteProp)
		: true;
	if (isBooleanish(autocomplete) && autoCompleteProp === undefined) {
		autoComplete = toBoolean(autocomplete);
	}

	const handleFocus = useComposedEventHandlers(
		onFocus,
		React.useCallback(() => {
			const state = getState();
			if (openOnFocus) {
				if (!state.open) {
					setOpen(true);
					setActiveId(null);
				}
			}
		}, [getState, openOnFocus, setActiveId, setOpen]),
	);

	const handleClick = useComposedEventHandlers(
		onClick,
		React.useCallback(
			(event: React.MouseEvent<HTMLInputElement>) => {
				if (selectOnClick && isFunction(event.currentTarget.select)) {
					event.currentTarget.select();
				}
			},
			[selectOnClick],
		),
	);

	return (
		<Ariakit.Combobox
			data-reach-combobox-input=""
			data-state={getDataState("TODO")}
			ref={forwardedRef}
			onFocus={handleFocus}
			onClick={handleClick}
			autoComplete={autoComplete ? "inline" : "none"}
			showOnMouseDown={false}
			{...props}
		></Ariakit.Combobox>
	);
}) as Polymorphic.ForwardRefComponent<"input", ComboboxInputProps>;

type ComboboxPopoverProps = {
	portal?: boolean;
};

export const ComboboxPopover = React.forwardRef(function ComboboxPopover(
	{ portal, children, ...props },
	forwardedRef,
) {
	const { open: isExpanded } = useComboboxContext();
	const store = useComboboxStoreContext();
	const baseElement = store.useState("baseElement");

	return (
		<Ariakit.PopoverProvider store={store}>
			<Ariakit.Popover
				{...props}
				data-reach-combobox-popover=""
				data-state={getDataState("TODO")}
				data-expanded={isExpanded || undefined}
				ref={forwardedRef}
				finalFocus={baseElement}
				portal={portal}
				modal={false}
				autoFocusOnShow={false}
				autoFocusOnHide={false}
				hideOnInteractOutside
			>
				{children}
			</Ariakit.Popover>
		</Ariakit.PopoverProvider>
	);
}) as Polymorphic.ForwardRefComponent<"div", ComboboxPopoverProps>;

type ComboboxListProps = {
	persistSelection?: boolean;
};

export const ComboboxList = React.forwardRef(function ComboboxList(
	{
		children,
		// TODO: Unsure of the ariakit equivalent here
		persistSelection,
		...props
	},
	forwardedRef,
) {
	return (
		<Ariakit.ComboboxList
			data-reach-combobox-list=""
			{...props}
			ref={forwardedRef}
		>
			{children}
		</Ariakit.ComboboxList>
	);
}) as Polymorphic.ForwardRefComponent<"div", ComboboxListProps>;

type ComboboxOptionProps = {
	value: string;
	children?:
		| React.ReactNode
		| ((props: { value: string; index: number }) => React.ReactNode);
};

interface ComboboxOptionContextValue {
	ref: React.RefObject<HTMLElement>;
}
const ComboboxOptionContext =
	React.createContext<ComboboxOptionContextValue | null>(null);
ComboboxOptionContext.displayName = "ComboboxOptionContext";

export const ComboboxOption = React.forwardRef(function ComboboxOption(
	{ value, onClick, children, id: idProp, ...props },
	forwardedRef,
) {
	const ownRef = React.useRef<HTMLElement>(null);
	const ref = useComposedRefs(forwardedRef, ownRef);
	const { onSelect, activeId, items } = useComboboxContext();
	const currentOptionIndex = items.findIndex((item) => item.value === value);
	const generatedId = React.useId();
	const id = idProp ?? generatedId;
	const isActive = activeId === id;
	const handleClick = useComposedEventHandlers(
		onClick,
		React.useCallback(() => {
			onSelect?.(value);
		}, [value, onSelect]),
	);
	return (
		<Ariakit.ComboboxItem
			{...props}
			aria-selected={isActive}
			role="option"
			data-reach-combobox-option=""
			data-highlighted={activeId === id ? "" : undefined}
			id={id}
			value={value}
			onClick={handleClick}
			ref={ref as any}
		>
			<ComboboxOptionContext.Provider value={{ ref: ownRef }}>
				{children ? (
					isFunction(children) ? (
						children({ value, index: currentOptionIndex })
					) : (
						children
					)
				) : (
					<ComboboxOptionText />
				)}
			</ComboboxOptionContext.Provider>
		</Ariakit.ComboboxItem>
	);
}) as Polymorphic.ForwardRefComponent<"div", ComboboxOptionProps>;

type ComboboxOptionTextProps = {};

export const ComboboxOptionText = React.forwardRef(
	function ComboboxOptionText(props, forwardedRef) {
		const { ref: rootRef } = React.useContext(ComboboxOptionContext)!;
		const ownRef = React.useRef<HTMLSpanElement>(null);
		const ref = useComposedRefs(forwardedRef, ownRef);
		React.useEffect(() => {
			const rootElement = rootRef.current;
			if (!rootElement) {
				return;
			}
			const descendants = getAllElementDescendats(rootElement);
			const observer = new MutationObserver(() => {
				const ariakitDataKey = "autocompleteValue";
				const reachAttribute = "data-suggested-value";
				for (const child of descendants) {
					if (child.dataset?.[ariakitDataKey] != null) {
						child.setAttribute(reachAttribute, child.dataset[ariakitDataKey]);
					} else if (child.hasAttribute(reachAttribute)) {
						child.removeAttribute(reachAttribute);
					}
				}
			});
			observer.observe(rootElement, {
				childList: true,
			});
			return () => {
				observer.disconnect();
			};
		}, [rootRef]);
		return <Ariakit.ComboboxItemValue {...props} ref={ref} />;
	},
) as Polymorphic.ForwardRefComponent<"span", ComboboxOptionTextProps>;

function getDataState(_: any) {
	return "TODO".toLowerCase();
}

function getAllElementDescendats(element: HTMLElement) {
	const elements: HTMLElement[] = [];
	for (const child of Array.from(element.children).flat()) {
		if (child instanceof HTMLElement) {
			elements.push(child);
			elements.push(...getAllElementDescendats(child));
		}
	}
	return elements;
}
