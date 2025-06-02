import react, { useState, createContext } from 'react'


export const OperatorsContext = createContext();

export const OperatorsContextProvider = (props) => {
    const [operators, setOperators] = useState({"data": []})

    return (
        <OperatorsContext.Provider value = {[operators, setOperators]}>
            {props.children}
        </OperatorsContext.Provider>
    );
}
