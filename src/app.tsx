import * as React from "react";
import * as AriakitCombobox from "./ariakit-combobox";
import "./app.css";

const LIBRARIES = {
	ariakit: { name: "Ariakit" },
	"react-aria": { name: "React Aria" },
} as const;

type Library = keyof typeof LIBRARIES;

const COMPONENTS = {
	combobox: { name: "Combobox" },
} as const;

const LIBRARY_COMPONENT_MAP: Record<
	Component,
	Partial<Record<Library, React.ComponentType | null>>
> = {
	combobox: {
		ariakit: AriakitComboboxExamples,
	},
};

type Component = keyof typeof COMPONENTS;

export function App() {
	const [componentState, setComponentState] = React.useState<
		[Library, Component]
	>(["ariakit", "combobox"]);
	const [library, component] = componentState;

	return (
		<div className="app">
			<header className="header">
				<div className="container">
					<div style={{ display: "flex", gap: "1.5rem" }}>
						<label>
							<div>Library</div>
							<select
								value={library}
								onChange={(e) => {
									const value = e.target.value;
									setComponentState((state) => {
										if (state[0] === value) {
											return state;
										}
										return [value as Library, state[1]];
									});
								}}
							>
								{Object.entries(LIBRARIES).map(([value, { name }]) => {
									const possibilities = LIBRARY_COMPONENT_MAP[component];
									const Component = possibilities[value as Library];
									return (
										<option key={value} value={value} disabled={!Component}>
											{name}
										</option>
									);
								})}
							</select>
						</label>
						<label>
							<div>Component</div>
							<select
								value={component}
								onChange={(e) => {
									const value = e.target.value;
									setComponentState((state) => {
										if (state[1] === value) {
											return state;
										}
										return [state[0], value as Component];
									});
								}}
							>
								{Object.entries(COMPONENTS).map(([value, { name }]) => {
									const possibilities =
										LIBRARY_COMPONENT_MAP[value as Component];
									const Component = possibilities[library];
									return (
										<option key={value} value={value} disabled={!Component}>
											{name}
										</option>
									);
								})}
							</select>
						</label>
					</div>
				</div>
			</header>
			<main>
				<div className="container">
					<h1>{LIBRARIES[library].name}</h1>
					{(() => {
						const Component = LIBRARY_COMPONENT_MAP[component][library];
						if (!Component) {
							return <p>Not implemented.</p>;
						}
						return <Component />;
					})()}
				</div>
			</main>
		</div>
	);
}

function AriakitComboboxExamples() {
	return (
		<div>
			<AriakitCombobox.Combobox
				aria-labelledby="demo"
				onChange={(event) => {
					console.log("change", event);
				}}
			>
				<AriakitCombobox.ComboboxInput />
				<AriakitCombobox.ComboboxPopover>
					<AriakitCombobox.ComboboxList>
						<AriakitCombobox.ComboboxOption value="Apple" />
						<AriakitCombobox.ComboboxOption value="Banana" />
						<AriakitCombobox.ComboboxOption value="Orange" />
						<AriakitCombobox.ComboboxOption value="Pineapple" />
						<AriakitCombobox.ComboboxOption value="Kiwi" />
					</AriakitCombobox.ComboboxList>
				</AriakitCombobox.ComboboxPopover>
			</AriakitCombobox.Combobox>
		</div>
	);
}
