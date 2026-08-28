import { createSignal, createContext, useContext, Accessor, Setter, ParentProps } from "solid-js";
import { EditorOperation } from "../components/Editor/types.js";

const [t, setOperation] = createSignal<EditorOperation>(EditorOperation.XOR);
const operation = [t, setOperation] as const
const OperationContext = createContext(operation);


export default function OperationProvider(props:ParentProps) {

    return (
        <OperationContext.Provider value={operation}>
            {props.children}
        </OperationContext.Provider>)
}

export function useOperation() {
    return useContext(OperationContext);
}
