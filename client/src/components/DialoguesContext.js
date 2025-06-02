import react, { useState, createContext } from 'react'

export const DialoguesContext = createContext();
export const DialoguesContextProvider = (props) => {
    const [dialogues, setDialogues] = useState({"data": []})

    return (
        <DialoguesContext.Provider value = {[dialogues, setDialogues]}>
            {props.children}
        </DialoguesContext.Provider>
    );
}
