import react, { useEffect, useContext, useState } from 'react'
import { Button, Table, Form, FormControl, Row, Col } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

import { DialoguesContext } from './DialoguesContext'

const DialoguesRow = ({id, oper, time, theme, score, script_score, handleMore}) => {
    const date = new Date(time);
    
    let color = "";
    if (score === null || script_score === null ) {
        color = ""
    } else if (score >= 8 && script_score >= 70) {
        color = "table-success"
    } else if (score <= 5 || script_score <= 40) {
        color = "table-danger"
    }

    let color_score = "";
    if (score === null) {
        color_score = ""
    } else if (score >= 8) {
        color_score = "text-success"
    } else if (score <= 5) {
        color_score = "text-danger"
    } else {
        color_score = "text-warning"
    }

    let color_script = "";
    if (script_score === null ) {
        color_script = ""
    } else if (script_score >= 70) {
        color_script = "text-success"
    } else if (script_score <= 40) {
        color_script = "text-danger"
    } else {
        color_script = "text-warning"
    }

    return (
        <tr className={color}>
            <td>{date.toLocaleString()}</td> 
            <td>{oper}</td>
            <td><div>{theme}</div></td>
            <td className={color_score}>{score ? (Math.round((score + Number.EPSILON) * 10) / 10) : score }</td>
            <td className={color_script}>{script_score}</td>
            { (score && script_score) ? (
                <td>
                <button onClick={()=>handleMore(id)} className="btn btn-outline-info btn-sm ml-1 mr-2 mb-2">Подробнее</button>
                </td>
            ) : (<td></td>)
            }
        </tr>
    );
}

const DialoguesTable = () => {
    const [dialogues, setDialogues] = useContext(DialoguesContext)
    const [search, setSearch] = useState("")
    const [searchDate, setDateSearch] = useState("")

    let history = useHistory()

    const handleMore = (id) => {
        history.push("/dialogue/" + id)
        document.location.reload()
    }

    const handleAdd = () => {
        history.push("/adddialogue")
        document.location.reload()
    }

    const updateSearch = (e) => {
        setSearch(e.target.value)
    }

    const updateDateSearch = (e) => {
        setDateSearch(e.target.value)
    }

    const filterDialogues = (e) => {
        e.preventDefault()
        const dialogue = dialogues.data.filter(dialogue => dialogue.theme.toLowerCase().includes(search.toLowerCase()))
        setDialogues({"data" : dialogue})
    }

    const filterDialoguesDate = (e) => {
        e.preventDefault()
        const dialogue = dialogues.data.filter(dialogue => 
            ( dialogue.time.split("-")[2].split("T")[0] == searchDate.split(".")[0] &&
              dialogue.time.split("-")[1] == searchDate.split(".")[1] &&
              dialogue.time.split("-")[0] == searchDate.split(".")[2] 
            ))
        setDialogues({"data" : dialogue})
    }

    useEffect(() => {
        fetch("http://127.0.0.1:8000/dialogue")
            .then(resp => {
                return resp.json();
            }).then(results => {
                setDialogues({"data": [...results.data]})
                if (localStorage.getItem('rights') === 'operator') {
                    setDialogues({"data": results.data.filter((dialogue) => dialogue.oper_id == localStorage.getItem('id'))})
                }
            })
    }, [])

    return (
        <div>
            <Row className="mt-3 mb-1 mx-4">
                <Col className="d-flex justify-content-start">
                    <Form onSubmit={ filterDialoguesDate }>
                        <Row>
                            <Col>
                                <FormControl 
                                    value = {searchDate}
                                    onChange={updateDateSearch}
                                    type="text"
                                    placeholder="Дата разговора"
                                    className="mr-lg-2" 
                                    style={{ width: '25vw' }}
                                />
                            </Col>
                            <Col>
                                <Button type="submit" variant="outline-info">Искать</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
                <Col className="d-flex justify-content-end">
                    <Form onSubmit={ filterDialogues }>
                        <Row>
                            <Col>
                                <FormControl 
                                    value = {search}
                                    onChange={updateSearch}
                                    type="text"
                                    placeholder="Тема разговора"
                                    className="mr-lg-2" 
                                    style={{ width: '25vw' }}
                                />
                            </Col>
                            <Col>
                                <Button type="submit" variant="outline-info">Искать</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <div className="row justify-content-center container-fluid">
                <div className="col-lg-11 mr-auto ml-auto mb-2">
                    <Table hover>   
                        <thead>
                            <tr>
                                <th>Дата добавления</th>
                                <th>Оператор</th>                        
                                <th>Тема</th>
                                <th>Оценка</th>
                                <th>Процент выполнения <br/>скрипта</th>
                                <th><Button onClick={()=>handleAdd()} className="btn btn-success btn-sm ml-1 mr-2">Добавить разговор</Button></th>
                            </tr>
                        </thead>
                        <tbody>
                            { dialogues.data.map((dialogue) => (
                                <DialoguesRow
                                    id = {dialogue.id}
                                    oper = {dialogue.oper}
                                    time = {dialogue.time}
                                    theme = {dialogue.theme}
                                    score = {dialogue.score}
                                    script_score = {dialogue.script_score}
                                    handleMore = {handleMore}
                                    key = {dialogue.id}
                                />
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

export default DialoguesTable;
