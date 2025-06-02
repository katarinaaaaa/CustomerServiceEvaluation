import react, { useContext, useState, useEffect } from 'react'
import { Form, Button, Card } from 'react-bootstrap'
import { useHistory, useParams } from 'react-router-dom'

import { UpdateOperatorContext } from './UpdateOperatorContext'

const RoleSelect = ({updateForm}) => {
    const [updateOperatorInfo, setUpdateOperatorInfo] = useContext(UpdateOperatorContext)
    const [options, setOptions] = useState({"data": []});

    useEffect(() => {
            fetch("http://127.0.0.1:8000/role")
            .then(resp => {
                return resp.json()
            }).then(result => {
                    setOptions({"data": [...result.data]});
                })
    }, [])
    
    return (
    <Form.Select name='Role' onChange={(e)=>updateForm(e)} value={updateOperatorInfo.Role}>
        { 
            options.data.map((opt, i) => (
                        <option key={i}>{opt}</option>
        ))}
    </Form.Select>
    );
}

const UpdateOperator = () => {
    const [updateOperatorInfo, setUpdateOperatorInfo] = useContext(UpdateOperatorContext)
    let { id } = useParams()

    const postData = async (e) => {
        e.preventDefault()
        const url = "http://localhost:8000/operatorrole/" + updateOperatorInfo['OperatorID']
        const response = await fetch(url, {
            method: "PUT",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                role: updateOperatorInfo['Role'],
            })
        })
        response.json().then(resp => {
            if(resp.status === "ok") {
                alert("Роль успешно изменена");
            } else {
                alert("Не удалось изменить роль");
            }
        })
    } 

    useEffect(() => {
        fetch("http://127.0.0.1:8000/operator/" + id)
            .then(resp => {
                return resp.json();
            }).then(results => 
                {
                    setUpdateOperatorInfo({
                        OperatorID: id,
                        CompID: results.data.comp_id,
                        Name: results.data.surname + " " + results.data.name + " " + results.data.patronymic,
                        Role: results.data.role,
                    })
                })
    }, [])

    let history = useHistory()
    const handleBack = () => {
        history.push("/operators")
        document.location.reload()
    }

    const updateForm = (e) => {
        setUpdateOperatorInfo({...updateOperatorInfo, [e.target.name]: e.target.value})
    }
    
    return (
        <div className="d-flex justify-content-center mt-5">
            <Card style={{ width: '40vw' }}> 
                <h5 className="card-title mt-4 mb-4 text-center">Редактирование роли</h5>
                <Card.Body>
                    <Form onSubmit={postData}>

                        <Form.Group controlId='CompID'>
                            <Form.Label>ID</Form.Label>
                            <Form.Control
                                type='text'
                                name='CompID'
                                value={updateOperatorInfo.CompID}
                                disabled
                            />
                        </Form.Group>

                        <Form.Group controlId='Name' className="mt-2">
                            <Form.Label>ФИО</Form.Label>
                            <Form.Control
                                type='text'
                                name='Name'
                                value={updateOperatorInfo.Name}
                                disabled
                            />
                        </Form.Group>

                        <Form.Group controlId='Role' className="mt-2">
                            <Form.Label>Роль</Form.Label>
                            <RoleSelect updateForm={updateForm}/>
                        </Form.Group>

                        <div className="d-md-flex justify-content-md-end d-grid gap-2">
                            <Button onClick={()=>handleBack()} className="btn btn-danger mt-4 col-3">Назад</Button>
                            <Button className="mt-4 col-3" variant='success' type="submit">Сохранить</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default UpdateOperator;
