import react, { useEffect, useContext } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

import { OperatorsContext } from './OperatorsContext'

const OperatorsRow = ({id, comp_id, name, role, dialogues_num, score, script_score, handleUpdate}) => {
    let color = "";
    if (score == null || script_score == null ) {
        color = ""
    } else if (score >= 8 && script_score >= 70) {
        color = "table-success"
    } else if (score <= 5 || script_score <= 40) {
        color = "table-danger"
    }

    let color_score = "";
    if (score == null) {
        color_score = ""
    } else if (score >= 8) {
        color_score = "text-success"
    } else if (score <= 5) {
        color_score = "text-danger"
    }

    let color_script = "";
    if (script_score == null ) {
        color_script = ""
    } else if (script_score >= 70) {
        color_script = "text-success"
    } else if (script_score <= 40) {
        color_script = "text-danger"
    }

    return (
        <tr className={color}>
            <td>{comp_id}</td>
            <td>{name}</td>            
            <td>
                {role}
                <div className="mt-3">
                    <button onClick={()=>handleUpdate(id)} className="btn btn-outline-info btn-sm">Изменить</button>
                </div>
            </td>
            <td>{dialogues_num}</td> 
            <td className={color_score}>{Math.round((score + Number.EPSILON) * 10) / 10}</td>
            <td className={color_script}>{Math.round(script_score)}</td>
        </tr>
    );
}

const OperatorsTable = () => {
    const [operators, setOperators] = useContext(OperatorsContext)

    let history = useHistory()

    const handleUpdate = (id) => {
        history.push("/updateoperator/" + id)
        document.location.reload()
    }

    useEffect(() => {
        fetch("http://127.0.0.1:8000/operator")
            .then(resp => {
                return resp.json();
            }).then(results => {
                setOperators({"data": [...results.data]})
            })
    }, [])

    return (
        <div className="row justify-content-center container-fluid">
            <div className="col-lg-11 col-xm-10 mr-auto ml-auto mt-2 mb-2">
                <Table hover>   
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ФИО</th>                        
                            <th>Роль</th>
                            <th>Разговоров <br/> за месяц</th>
                            <th>Средний балл</th>
                            <th>Средний процент <br/> выполнения скрипта</th>
                        </tr>
                    </thead>
                    <tbody>
                        { operators.data.map((operator) => (
                            <OperatorsRow
                                id = {operator.id}
                                comp_id = {operator.comp_id}
                                name = {operator.surname + " " + operator.name + " " + operator.patronymic}
                                role = {operator.role}
                                dialogues_num = {operator.dialogues_num}
                                score = {operator.score}
                                script_score = {operator.script_score}
                                handleUpdate = {handleUpdate}
                                key = {operator.id}
                            />
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default OperatorsTable;
