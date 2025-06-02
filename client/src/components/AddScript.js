import react, { useState } from 'react'
import { Form, Button, Card } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

const AddScript = () => {

    const [scriptInfo, setScriptInfo] = useState(
        {
            ScriptName: "",
            Role: "",
            ScriptText: ""            
        }
    )

    const updateForm = (e) => {
        setScriptInfo(
            {...scriptInfo, [e.target.name] : e.target.value}
        )
    }

    const postData = async (e) => {
        e.preventDefault();
        console.log(scriptInfo)
        
        const url = "http://localhost:8000/script"

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
                    "name": scriptInfo['ScriptName'],
                    "role": scriptInfo['Role'],
                    "script_text": scriptInfo['ScriptText'],
                }) 
            });
        response.json().then(response => {
            if (response.status === 'ok') {
                alert("Скрипт успешно создан")
            } else {
                alert("Не удалось создать скрипт")
            }
        });
        setScriptInfo({
            ScriptName: "",
            Role: "",
            ScriptText: ""    
        });
    }
    
    let history = useHistory()
    const handleBack = () => {
        history.push("/scripts")
        document.location.reload()
    }

    return (
        <div className="d-flex justify-content-center mt-4">
            <Card style={{ width: '80vw' }}> 
                <h5 className="card-title mt-4 mb-4 text-center">Новый скрипт</h5>
                <Card.Body>
                    <Form onSubmit={postData}>

                        <Form.Group controlId='ScriptName'>
                            <Form.Label>Название</Form.Label>
                            <Form.Control
                                type='text'
                                name='ScriptName'
                                value={scriptInfo.ScriptName}
                                onChange={updateForm}
                                placeholder='Название'
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId='Role' className="mt-2">
                            <Form.Label>Роль</Form.Label>
                            <Form.Control
                                type='text'
                                name='Role'
                                value={scriptInfo.Role}
                                onChange={updateForm}
                                placeholder='Роль'
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId='ScriptText' className="mt-2">
                            <Form.Label>Текст скрипта</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name='ScriptText'
                                value={scriptInfo.ScriptText}
                                onChange={updateForm}
                                placeholder='Текст скрипта'
                                required
                            />
                        </Form.Group>

                        <div className="d-md-flex justify-content-md-end d-grid gap-2">
                            <Button onClick={()=>handleBack()} className="btn btn-danger mt-4 col-3">Назад</Button>
                            <Button className="mt-4 col-3" variant='success' type="submit">Создать</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default AddScript;
