import react, { createContext, useState } from 'react'


export const DialogueMoreContext = createContext();

export const DialogueMoreContextProvider = (props) => {
    const [dialogueMore, setDialogueMore] = useState({"data": {}})

    return (
        <DialogueMoreContext.Provider value = {[dialogueMore, setDialogueMore]}>
            {props.children}
        </DialogueMoreContext.Provider>
    );
}
