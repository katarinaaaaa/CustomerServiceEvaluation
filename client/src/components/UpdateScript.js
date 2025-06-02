import react, { useContext, useState, useEffect } from 'react'
import { Form, Button, Card } from 'react-bootstrap'
import { useHistory, useParams } from 'react-router-dom'

import { UpdateScriptContext } from './UpdateScriptContext'

const UpdateScript = () => {
    const [updateScriptInfo, setUpdateScriptInfo] = useContext(UpdateScriptContext)
    let { id } = useParams()

    const postData = async (e) => {
        e.preventDefault()
        const url = "http://localhost:8000/script/" + updateScriptInfo['ScriptId']
        const response = await fetch(url, {
            method: "PUT",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: updateScriptInfo['ScriptName'],
                role: updateScriptInfo['Role'],
                script_text: updateScriptInfo['ScriptText'],
            })
        })
        response.json().then(resp => {
            if(resp.status === "ok") {
                alert("Скрипт успешно изменен");
            } else {
                alert("Не удалось изменить скрипт");
            }
        })
    } 

    useEffect(() => {
        fetch("http://127.0.0.1:8000/script/" + id)
            .then(resp => {
                return resp.json();
            }).then(results => 
                {
                    setUpdateScriptInfo({
                        ScriptName: results.data.name,
                        Role: results.data.role,
                        ScriptText: results.data.script_text,
                        ScriptId: id
                    })
                })
    }, [])

    let history = useHistory()
    const handleBack = () => {
        history.push("/scripts")
        document.location.reload()
    }

    const updateForm = (e) => {
        setUpdateScriptInfo({...updateScriptInfo, [e.target.name]: e.target.value})
    }
    
    return (
        <div className="d-flex justify-content-center mt-4 mx-5">
            <Card style={{ width: '80vw' }}> 
                {(localStorage.getItem('rights') === 'super') ? (
                    <h5 className="card-title mt-4 mb-4 text-center">Редактирование скрипта</h5>
                ) : (
                    <h5 className="card-title mt-4 mb-4 text-center">Просмотр скрипта</h5>
                )}
                <Card.Body>
                    <Form onSubmit={postData}>

                        <Form.Group controlId='ScriptName'>
                            <Form.Label>Название</Form.Label>
                            {(localStorage.getItem('rights') !== 'super') ? (
                                <Form.Control
                                    type='text'
                                    name='ScriptName'
                                    value={updateScriptInfo.ScriptName}
                                    disabled
                                />
                            ) : (
                                <Form.Control
                                    type='text'
                                    name='ScriptName'
                                    value={updateScriptInfo.ScriptName}
                                    onChange={updateForm}
                                    placeholder='Название'
                                    required
                                />
                            )}
                        </Form.Group>

                        <Form.Group controlId='Role' className="mt-2">
                            <Form.Label>Роль</Form.Label>
                            {(localStorage.getItem('rights') !== 'super') ? (
                                <Form.Control
                                    type='text'
                                    name='Role'
                                    value={updateScriptInfo.Role}
                                    disabled
                                />
                            ) : (
                                <Form.Control
                                    type='text'
                                    name='Role'
                                    value={updateScriptInfo.Role}
                                    onChange={updateForm}
                                    placeholder='Роль'
                                    required
                                />
                            )}
                        </Form.Group>

                        <Form.Group controlId='ScriptText' className="mt-2">
                            <Form.Label>Текст скрипта</Form.Label>
                            {(localStorage.getItem('rights') !== 'super') ? (
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name='ScriptText'
                                    value={updateScriptInfo.ScriptText}
                                    disabled
                                />
                            ) : (
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name='ScriptText'
                                    value={updateScriptInfo.ScriptText}
                                    onChange={updateForm}
                                    placeholder='Текст скрипта'
                                    required
                                />
                            )}                            
                        </Form.Group>

                        <div className="d-md-flex justify-content-md-end d-grid gap-2">
                            <Button onClick={()=>handleBack()} className="btn btn-danger mt-4 col-3">Назад</Button>
                            {(localStorage.getItem('rights') === 'super') ? (
                                <Button className="mt-4 col-3" variant='success' type="submit">Сохранить</Button>
                            ) : (
                                <br/>
                            )}
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default UpdateScript;
