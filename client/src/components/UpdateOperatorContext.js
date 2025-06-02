import react, { createContext, useState } from 'react'


export const UpdateOperatorContext = createContext();

export const UpdateOperatorContextProvider = (props) => {
    const [updateOperatorInfo, setUpdateOperatorInfo] = useState({
        OperatorID: "",
        CompID: "",
        Name: "",
        Role: ""
    })

    return (
        <UpdateOperatorContext.Provider value = {[updateOperatorInfo, setUpdateOperatorInfo]}>
            {props.children}
        </UpdateOperatorContext.Provider>
    )
}