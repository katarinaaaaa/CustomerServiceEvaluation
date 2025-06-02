import react, { useState, createContext } from 'react'


export const ScriptsContext = createContext();

export const ScriptsProvider = (props) => {
    const [scripts, setScripts] = useState({"data": []})

    return (
        <ScriptsContext.Provider value = {[scripts, setScripts]}>
            {props.children}
        </ScriptsContext.Provider>
    );
}
