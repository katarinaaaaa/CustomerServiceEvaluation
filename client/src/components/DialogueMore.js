import react, { useContext, useEffect } from 'react'
import { Form, Button, Card, Row, Col } from 'react-bootstrap'
import { useHistory, useParams } from 'react-router-dom'

import { DialogueMoreContext } from './DialogueMoreContext'
import "./dialogue_more.css"

const DialogueMore = () => {
    const [dialogueMore, setDialogueMore] = useContext(DialogueMoreContext)
    let { id } = useParams()
    let script_color = "";
    if (dialogueMore['script_score'] >= 70) {
        script_color = "text-success"
    } else if (dialogueMore['script_score'] <= 40) {
        script_color = "text-danger"
    } else {
        script_color = "text-warning"
    }

    let res_color = "";
    if (dialogueMore['result'] === "Да") {
        res_color = "text-success"
    } else if (dialogueMore['result'] === "Нет") {
        res_color = "text-danger"
    }

    let score_color = "";
    if (dialogueMore['total_score'] == null) {
        score_color = ""
    } else if (dialogueMore['total_score'] >= 8) {
        score_color = "text-success"
    } else if (dialogueMore['total_score'] <= 5) {
        score_color = "text-danger"
    } else {
        score_color = "text-warning"
    }

    useEffect(() => {
        fetch("http://127.0.0.1:8000/dialogue/" + id)
            .then(resp => {
                return resp.json();
            }).then(results => {
                setDialogueMore(results.data);
            })
    }, [])

    let history = useHistory()
    const handleBack = () => {
        history.push("/dialogues")
        document.location.reload()
    }

    const color = (score) => {
        let col = "";
        if (score >= 8) {
            col = "text-success"
        } else if (score <= 5) {
            col = "text-danger"
        } else {
            col = "text-warning"
        }
        return col;
    }

    return (
        <div className="d-flex justify-content-center mt-4">
            <Card style={{ width: '95vw' }} className="mb-3"> 

                <h5 className="card-title mt-4 mb-1 text-center">{dialogueMore['theme']}</h5>
                <Card.Body>                   
                    <Row>
                        <Col>
                            <Form.Group as={Row} controlId='Operator' className="mt-2">
                                    <Form.Label column="sm" className="fw-bold">Оператор</Form.Label>
                                    <Form.Control
                                        size="sm" 
                                        style={{ width: '39vw' }}
                                        className="dial-text"
                                        type="text"
                                        name='Operator'
                                        value={dialogueMore['oper'] + ", " + dialogueMore['role']}
                                        plaintext
                                        readOnly
                                    />                      
                            </Form.Group>
                            <Form.Group as={Row} controlId='Result'>
                                    <Form.Label column="sm" className="fw-bold">Результат</Form.Label>
                                    <Form.Control
                                        size="sm" 
                                        style={{ width: '39vw' }}
                                        className={"dial-text-plain " + res_color}
                                        as="textarea"
                                        name='Result'
                                        value={dialogueMore['result_comment']}
                                        plaintext
                                        readOnly
                                    />                      
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group as={Row} controlId='Score' className="mt-2">
                                    <Form.Label column="sm"></Form.Label>
                                    <Form.Control
                                        size="sm" 
                                        style={{ width: '8vw' }}
                                        className={"dial-text fw-bold fs-1 " + score_color}
                                        type="text"
                                        name='Score'
                                        value={Math.round((dialogueMore['total_score'] + Number.EPSILON) * 10) / 10}
                                        plaintext
                                        readOnly
                                    />                      
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-2">
                        <Form.Group as={Col} controlId='DialogueText' className="mt-2">
                            <Form.Label column="sm" className="fw-bold">Текст разговора</Form.Label>
                            <Form.Control
                                size="sm" 
                                style={{ width: '50vw' }}
                                className="dial-text"
                                as="textarea"
                                rows={9}
                                name='DialogueText'
                                value={dialogueMore['text']}
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group as={Col} controlId='ScriptText' className="mt-2">
                            <Form.Label column="sm" className="fw-bold">Скрипт</Form.Label>
                            <Form.Control
                                size="sm" 
                                style={{ width: '40vw' }}
                                className="dial-text"
                                as="textarea"
                                rows={9}
                                name='ScriptText'
                                value={dialogueMore['script']}
                                readOnly
                            />
                        </Form.Group>
                    </Row>

                    <Row>
                        <Form.Group as={Col} controlId='ScriptMatch' className="mt-2" xs={2}>
                            <Form.Label column="sm" className="fw-bold">Соответствие скрипту</Form.Label>
                            <Form.Control
                                style={{ width: '10vw' }}
                                size="lg" 
                                className={"dial-text fw-bold fs-2 " + script_color}
                                type="text"
                                name='ScriptMatch'
                                value={dialogueMore['script_score'] + "%"}
                                plaintext 
                                readOnly 
                            />
                        </Form.Group>
                        <Form.Group as={Col} controlId='ScriptCom' className="mt-2" xs={4}>
                            <Form.Label column="sm" className="fw-bold">Комментарий</Form.Label>
                            <Form.Control
                                size="sm" 
                                className="dial-text-plain"
                                as="textarea"
                                name='ScriptCom'
                                rows={7}
                                value={dialogueMore['script_comment']} 
                                readOnly 
                            />
                        </Form.Group>
                        <Form.Group as={Col} controlId='ScriptRec' className="mt-2" xs={6}>
                            <Form.Label column="sm" className="fw-bold">Рекомендации по скрипту</Form.Label>
                            <Form.Control
                                size="sm" 
                                className="dial-text-plain"
                                as="textarea"
                                name='ScriptRec'
                                rows={7}
                                value={dialogueMore['script_recs']} 
                                readOnly 
                            />
                        </Form.Group>
                    </Row>


                    <h5 className="mt-5 mb-4 text-center">Подробная оценка</h5>
                    <Row>
                        <Col>
                            <Form.Label column="sm" className="fw-bold">Профессионализм и вежливость</Form.Label>
                            <Row>
                                <Form.Group as={Col} controlId='Criteria1' className="mt-2">
                                    <Form.Control
                                        style={{ width: '3vw' }}
                                        className={"score pt-0 pb-2 dial-text fs-4 " + color(dialogueMore['prof_score'])}
                                        type="text"
                                        name='Criteria1'
                                        value={dialogueMore['prof_score']}
                                        plaintext
                                        readOnly
                                    />                      
                                </Form.Group>
                                <Form.Group as={Col} controlId='ComCriteria1' className="mt-2">
                                    <Form.Control
                                        style={{ width: '39vw' }}
                                        size="sm" 
                                        className="dial-text"
                                        as="textarea"
                                        rows={5}
                                        name='ComCriteria1'
                                        value={dialogueMore['prof_com']}
                                        plaintext
                                        readOnly
                                    />                      
                                </Form.Group>
                            </Row>
                        </Col>
                        <Col className="col-mar">
                            <Form.Label column="sm" className="fw-bold">Соблюдение регламента и компетентность</Form.Label>
                            <Row>
                                <Form.Group as={Col} controlId='Criteria2' className="mt-2">
                                    <Form.Control
                                        style={{ width: '3vw' }}
                                        className={"pt-0 pb-2 dial-text fs-4 " + color(dialogueMore['reg_score'])}
                                        type="text"
                                        name='Criteria2'
                                        value={dialogueMore['reg_score']}
                                        plaintext
                                        readOnly
                                    />                      
                                </Form.Group>
                                <Form.Group as={Col} controlId='ComCriteria2' className="mt-2">
                                    <Form.Control
                                        style={{ width: '39vw' }}
                                        size="sm" 
                                        className="dial-text"
                                        as="textarea"
                                        rows={5}
                                        name='ComCriteria2'
                                        value={dialogueMore['reg_com']}
                                        plaintext
                                        readOnly
                                    />                      
                                </Form.Group>
                            </Row>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Form.Label column="sm" className="fw-bold">Эффективность коммуникации</Form.Label>
                            <Row>
                                <Form.Group as={Col} controlId='Criteria3' className="mt-2">
                                    <Form.Control
                                        style={{ width: '3vw' }}
                                        className={"score pt-0 pb-2 dial-text fs-4 " + color(dialogueMore['eff_score'])}
                                        type="text"
                                        name='Criteria3'
                                        value={dialogueMore['eff_score']}
                                        plaintext
                                        readOnly
                                    />                      
                                </Form.Group>
                                <Form.Group as={Col} controlId='ComCriteria3' className="mt-2">
                                    <Form.Control
                                        style={{ width: '39vw' }}
                                        size="sm" 
                                        className="dial-text"
                                        as="textarea"
                                        rows={5}
                                        name='ComCriteria3'
                                        value={dialogueMore['eff_com']}
                                        plaintext
                                        readOnly
                                    />                      
                                </Form.Group>
                            </Row>
                        </Col>
                        <Col className="col-mar">
                            <Form.Label column="sm" className="fw-bold">Результативность</Form.Label>
                            <Row>
                                <Form.Group as={Col} controlId='Criteria4' className="mt-2">
                                    <Form.Control
                                        style={{ width: '3vw' }}
                                        className={"pt-0 pb-2 dial-text fs-4 " + color(dialogueMore['res_score'])}
                                        type="text"
                                        name='Criteria4'
                                        value={dialogueMore['res_score']}
                                        plaintext
                                        readOnly
                                    />                      
                                </Form.Group>
                                <Form.Group as={Col} controlId='ComCriteria4' className="mt-2">
                                    <Form.Control
                                        style={{ width: '39vw' }}
                                        size="sm" 
                                        className="dial-text"
                                        as="textarea"
                                        rows={5}
                                        name='ComCriteria4'
                                        value={dialogueMore['res_com']}
                                        plaintext
                                        readOnly
                                    />                      
                                </Form.Group>
                            </Row>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Form.Label column="sm" className="fw-bold">Граммотность</Form.Label>
                            <Row>
                                <Form.Group as={Col} controlId='Criteria5' className="mt-2">
                                    <Form.Control
                                        style={{ width: '3vw' }}
                                        className={"score pt-0 pb-2 dial-text fs-4 " + color(dialogueMore['gram_score'])}
                                        type="text"
                                        name='Criteria5'
                                        value={dialogueMore['gram_score']}
                                        plaintext
                                        readOnly
                                    />                      
                                </Form.Group>
                                <Form.Group as={Col} controlId='ComCriteria5' className="mt-2">
                                    <Form.Control
                                        style={{ width: '39vw' }}
                                        size="sm" 
                                        className="dial-text"
                                        as="textarea"
                                        rows={5}
                                        name='ComCriteria5'
                                        value={dialogueMore['gram_com']}
                                        plaintext
                                        readOnly
                                    />                      
                                </Form.Group>
                            </Row>
                        </Col>

                        <Col className="col-mar">
                            <Form.Label column="sm" className="fw-bold">Эмпатия и эмоциональный интеллект</Form.Label>
                            <Row>
                                <Form.Group as={Col} controlId='Criteria6' className="mt-2">
                                    <Form.Control
                                        style={{ width: '3vw' }}
                                        className={"pt-0 pb-2 dial-text fs-4 " + color(dialogueMore['emp_score'])}
                                        type="text"
                                        name='Criteria6'
                                        value={dialogueMore['emp_score']}
                                        plaintext
                                        readOnly
                                    />                      
                                </Form.Group>
                                <Form.Group as={Col} controlId='ComCriteria6' className="mt-2">
                                    <Form.Control
                                        style={{ width: '39vw' }}
                                        size="sm" 
                                        className="dial-text"
                                        as="textarea"
                                        rows={5}
                                        name='ComCriteria6'
                                        value={dialogueMore['emp_com']}
                                        plaintext
                                        readOnly
                                    />                      
                                </Form.Group>
                            </Row>
                        </Col>
                    </Row>

                    <h5 className="mt-1 mb-3">Общие рекоммендации</h5>
                    <Form.Group as={Col} controlId='Recs' className="mt-1">
                        <Form.Control
                            size="sm" 
                            className="dial-text"
                            as="textarea"
                            rows={4}
                            name='Recs'
                            value={dialogueMore['recs']}
                            plaintext
                            readOnly
                        />                      
                    </Form.Group>

                    <div className="d-md-flex justify-content-md-end d-grid gap-2">
                        <Button onClick={()=>handleBack()} className="btn btn-danger mt-4 col-3">Назад</Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}

export default DialogueMore;
