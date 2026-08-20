import { createUniqueId, For } from "solid-js";
import dropdownClasses from "./Dropdown.module.css";

export type DropdownProps<Value> = {
  values: [label: string, value: Value][] | (() => [label: string, value: Value][]);
  value?: Value;
  onChange?: (value: Value) => void;
  theme?: "setting" | "default";
};

export default function Dropdown<Value>(props: DropdownProps<Value>) {
  const selectId = createUniqueId();

  const items = () => (typeof props.values === "function" ? props.values() : props.values);
  const selectedIndex = () => {
    if (props.value === undefined) return 0;
    return items().findIndex(([, v]) => v === props.value);
  };

  return (
    <span
      class={[
        dropdownClasses.dropdown,
        props.theme === "setting" ? dropdownClasses.setting : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <select
        id={selectId}
        value={selectedIndex()}
        onChange={(event) => {
          const value = items()[+event.currentTarget.value][1];
          props.onChange?.(value);
        }}
      >
        <For each={items()}>
          {([label], index) => <option value={index()}>{label}</option>}
        </For>
      </select>
      <label aria-hidden >▼</label>
    </span>
  );
}