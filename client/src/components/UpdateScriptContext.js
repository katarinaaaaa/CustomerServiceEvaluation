import react, { createContext, useState } from 'react'


export const UpdateScriptContext = createContext();

export const UpdateScriptContextProvider = (props) => {
    const [updateScriptInfo, setUpdateScriptInfo] = useState({
        ScriptName: "",
        Role: "",
        ScriptText: "",
        ScriptId: 0
    })

    return (
        <UpdateScriptContext.Provider value = {[updateScriptInfo, setUpdateScriptInfo]}>
            {props.children}
        </UpdateScriptContext.Provider>
    )
}