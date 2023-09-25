import { useCallback } from "react";

/**
 * Passes or assigns a value to multiple refs (typically a DOM node). Useful for
 * dealing with components that need an explicit ref for DOM calculations but
 * also forwards refs assigned by an app.
 */
export function useComposedRefs<RefValueType = unknown>(
	...refs: (AssignableRef<RefValueType> | null | undefined)[]
) {
	return useCallback((node: RefValueType) => {
		for (const ref of refs) {
			assignRef(ref, node);
		}
		// IMPORTANT: We always expect refs to persist between renders so we can
		// ignore the lint rule in this case. Never ever pass anything other than an
		// actual React ref as an argument to useComposedRefs
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, refs);
}

/**
 * React.Ref uses the readonly type `React.RefObject` instead of
 * `React.MutableRefObject`, We pretty much always assume ref objects are
 * mutable, so this type is a workaround so some of the weird mechanics of using
 * refs with TS.
 */
type AssignableRef<ValueType> =
	| {
			bivarianceHack(instance: ValueType | null): void;
	  }["bivarianceHack"]
	| React.MutableRefObject<ValueType | null>;

/**
 * Passes or assigns an arbitrary value to a ref function or object.
 */
function assignRef<RefValueType = unknown>(
	ref: React.Ref<RefValueType> | null | undefined,
	value: RefValueType,
) {
	if (ref == null) {
		return;
	}
	if (typeof ref === "function") {
		ref(value);
	} else {
		try {
			(ref as React.MutableRefObject<RefValueType>).current = value;
		} catch {
			console.warn(
				`Cannot assign value "${value}" to ref "${ref}". This is likely a bug. Make sure refs are passed as stable callback functions or mutable ref objects. String refs are not supported.`,
			);
		}
	}
}

export function useComposedEventHandlers<
	T extends { defaultPrevented: boolean },
>(...handlers: Array<GenericEventHandler<T> | null | undefined>) {
	return useCallback(
		(event: T) => {
			let previousHandler: GenericEventHandler<T> | null | undefined;
			for (const handler of handlers) {
				previousHandler?.(event);
				if (!event.defaultPrevented) {
					handler?.(event);
				}
				previousHandler = handler;
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[...handlers],
	);
}

type GenericEventHandler<T extends { defaultPrevented: boolean }> = (
	event: T,
) => void;

export function isBoolean(value: unknown): value is boolean {
	return typeof value === "boolean";
}

export function isBooleanish(value: unknown): value is Booleanish {
	return isBoolean(value) || value === "true" || value === "false";
}

export function toBoolean(value: Booleanish): boolean {
	if (isBoolean(value)) {
		return value;
	}
	if (value === "true") {
		return false;
	}
	return false;
}

export function isFunction(value: unknown): value is Function {
	return typeof value === "function";
}

type Booleanish = boolean | "true" | "false";
