import react, { useEffect, useState } from 'react'
import { Form, Button, Card } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import Spinner from 'react-bootstrap/Spinner';

const OperSelect = ({updateForm}) => {
    const [options, setOptions] = useState({"data": []});

    useEffect(() => {
            fetch("http://127.0.0.1:8000/operatornames")
            .then(resp => {
                return resp.json()
            }).then(result => {
                    setOptions({"data": [...result.data]});
                })
    }, [])
    
    return (
    (localStorage.getItem('rights') === 'super') ? (
            <Form.Select required name='Operator' onChange={(e)=>updateForm(e)} defaultValue="">
                <option value="" disabled hidden>Оператор</option>
                { 
                    options.data.map((opt, i) => (
                                <option value={opt['id']} key={i}>{opt['name']}</option>
                ))}
            </Form.Select>
        ) : (
            <Form.Select disabled required name='Operator' onChange={(e)=>updateForm(e)} value={localStorage.getItem('id')}>
                <option value="" disabled hidden>Оператор</option>
                { 
                    options.data.map((opt, i) => (
                                <option value={opt['id']} key={i}>{opt['name']}</option>
                ))}
            </Form.Select>
        )
    );
}

const AddDialogue = () => {
    const [loading, setLoading] = useState(false);

    const [dialogueInfo, setDialogueInfo] = useState(
        {
            Operator: "",
            DialogueText: ""            
        }
    )

    const updateForm = (e) => {
        setDialogueInfo(
            {...dialogueInfo, [e.target.name] : e.target.value}
        )
    }

    useEffect(() => {
        setDialogueInfo(
            {...dialogueInfo, ['Operator'] : localStorage.getItem('id')}
        )
    }, [])
    
    const postData = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log(dialogueInfo);
        
        const url = "http://localhost:8000/dialogue/" + dialogueInfo['Operator']

        const response = await fetch(
            url, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin', 
                headers: {
                'Content-Type': 'application/json'
                },
                redirect: 'follow',
                referrerPolicy: 'no-referrer', 
                body: JSON.stringify({
                    "text": dialogueInfo['DialogueText'],
                }) 
            });
        response.json().then(response => {
            if (response.status === 'ok') {
                alert("Разговор успешно добавлен");
                history.push("/dialogue/" + response.data)
                document.location.reload()
                setLoading(false);
            } else {
                setLoading(false);
                alert("Не удалось добавить разговор");
            }
        });
    }
    
    let history = useHistory()
    const handleBack = () => {
        history.push("/dialogues")
        document.location.reload()
    }

    return (
        <div className="d-flex justify-content-center mt-4">
            {!loading ? (
                <Card style={{ width: '80vw' }}>
                    <h5 className="card-title mt-4 mb-4 text-center">Добавить разговор</h5>
                    <Card.Body>
                        <Form onSubmit={postData}>

                            <Form.Group controlId='Operator'>
                                <Form.Label>Оператор</Form.Label>
                                <OperSelect updateForm={updateForm} value={dialogueInfo.Operator}/>
                            </Form.Group>

                            <Form.Group controlId='DialogueText' className="mt-2">
                                <Form.Label>Разговор</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={7}
                                    name='DialogueText'
                                    value={dialogueInfo.DialogueText}
                                    onChange={updateForm}
                                    placeholder='Разговор'
                                    required
                                />
                            </Form.Group>

                            <div className="d-md-flex justify-content-md-end d-grid gap-2">
                                <Button onClick={()=>handleBack()} className="btn btn-danger mt-4 col-3">Назад</Button>
                                <Button className="mt-4 col-3" variant='success' type="submit">Добавить</Button>
                            </div>
                        </Form> 
                    </Card.Body>
                </Card>
            ) : (
                <Card style={{ width: '80vw' }}>
                    <h5 className="card-title mt-4 mb-4 text-center">Анализируем разговор...</h5>
                    <Card.Body>
                        <div style={{ width: '70w', height: '62vh' }} className="d-flex justify-content-center align-items-center">
                            <Spinner className="mr-2" animation="border" role="status" size="xl">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    </Card.Body>
                </Card>
        )}
        </div>
    );
}

export default AddDialogue;
