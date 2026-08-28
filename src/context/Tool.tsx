import { createSignal, createContext, useContext, Accessor, Setter, ParentProps } from "solid-js";
import { EditorTool } from "../components/Editor/types.js";

const [t, setTool] = createSignal<EditorTool>(EditorTool.DRAW);
const tool = [t, setTool] as const
const ToolContext = createContext(tool);


export default function ToolProvider(props:ParentProps) {

    return (
        <ToolContext.Provider value={tool}>
            {props.children}
        </ToolContext.Provider>)
}

export function useTool() {
    return useContext(ToolContext);
}
