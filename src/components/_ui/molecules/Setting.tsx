import Input, { InputProps, InputType } from "../atoms/Input.jsx";
import classes from "./Setting.module.css";

export type SettingProps<Type extends keyof InputType> = {
    type: Type,
    prefix: string,
    placeholder?: InputType[Type] | (() => InputType[Type]),
    description?: string,
    onChange: (value: InputType[Type], element: HTMLInputElement) => void,
} & Omit<InputProps<Type>, "onChange" | "onKeyUp" | "title" | "type" | "theme" | "children">;

export default function Setting<Type extends keyof InputType = "text">(
    props: SettingProps<Type>
) {
    function convertValue(value: string): InputType[Type] {
        if (props.type === "number") {
            return Number(value) as any;
        } else {
            return value as any;
        }
    }

    return <div class={classes.setting}>
        <span>{props.prefix}</span>
        <Input
            {...props}
            theme="setting"
            type={props.type}
            title={props.description}
            onKeyUp={(event) => {
                props.onChange(convertValue(event.currentTarget.value), event.currentTarget);
            }}
            onChange={props.onChange}
            min={props.min}
            max={props.max}
        >{typeof props.placeholder === "function" ? String(props.placeholder()) : String(props.placeholder ?? "")}</Input>
    </div>;
}
