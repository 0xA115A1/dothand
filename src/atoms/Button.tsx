import type { JSX } from "solid-js/jsx-runtime";
import classes from "./Button.module.css";
import { splitProps } from "solid-js";

export type ButtonProps = {
    children: JSX.Element,
    selected?: boolean,
    onClick?: () => void,
    theme?: "settings" | "default",
    disabled?: (() => boolean) | boolean,
    className?:string
} & Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled'>;

export default function Button(props: ButtonProps) {
    const [stuff, rest]=splitProps(props,['selected'])
    return (<button
        class={[
            classes.button,
            props.selected ? classes.selected : undefined,
            props.theme === "settings" ? classes.settings : undefined,
            props.className
        ].filter((x): x is string => !!x).join(" ")}
        onClick={props.onClick}
        disabled={typeof props.disabled === "function" ? props.disabled() : props.disabled}
        {...props}
    >
        {props.children}
    </button>);
}
