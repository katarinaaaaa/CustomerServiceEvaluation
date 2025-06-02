import react, { useEffect, useContext } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

import { ScriptsContext } from './ScriptsContext'
import "./script_row.css"

const ScriptsRow = ({id, name, script_text, role, handleDelete, handleUpdate}) => {
    return (
        <tr>
            <td>{name}</td>            
            <td>{role}</td>
            <td><div className="scrollable">{script_text}</div></td>
            {
                (localStorage.getItem('rights') === 'super') ? (
                <td>
                    <button onClick={()=>handleUpdate(id)} className="btn btn-outline-info btn-sm ml-1 mr-2 mb-2">Редактировать</button>
                    <button onClick={()=>handleDelete(id)} className="btn btn-outline-danger btn-sm ml-1 mr-2">Удалить</button>
                </td> 
                ) : (
                    <td>
                        <button onClick={()=>handleUpdate(id)} className="btn btn-success btn-sm ml-1 mr-2 mb-2">Открыть</button>
                    </td>
                )
            }
        </tr>
    );
}

const ScriptsTable = () => {
    const [scripts, setScripts] = useContext(ScriptsContext)

    let history = useHistory()

    const handleDelete = (id) => {
        fetch("http://127.0.0.1:8000/script/" + id, {
        method: "DELETE",
        headers: {
            accept: 'application/json'
        }
    })
        .then(resp => {
            return resp.json()
        })
        .then(result => {
            if (result.status === "ok") {
                const filteredScripts = scripts.data.filter((script) => script.id !== id);
                setScripts({"data": [...filteredScripts]})
                alert("Скрипт успешно удален")
            } else {
                alert("Не удалось удалить скрипт")
            }
        })
    }

    const handleAdd = () => {
        history.push("/addscript")
        document.location.reload()
    }

    const handleUpdate = (id) => {
        history.push("/updatescript/" + id)
        document.location.reload()
    }

    useEffect(() => {
        fetch("http://127.0.0.1:8000/script")
            .then(resp => {
                return resp.json();
            }).then(results => {
                setScripts({"data": [...results.data]})
            })
    }, [])

    return (
        <div className="row justify-content-center container-fluid">
            <div className="col-lg-11 col-xm-10 mr-auto ml-auto mt-2 mb-2">
                <Table hover>   
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Роль</th>                        
                            <th>Текст скрипта</th>
                            {
                                (localStorage.getItem('rights') === 'super') ? (
                                    <th><Button onClick={()=>handleAdd()} className="btn btn-success btn-sm ml-1 mr-2">
                                        Создать скрипт
                                    </Button></th>
                                ) : (<th></th>)
                            }
                        </tr>
                    </thead>
                    <tbody>
                        { scripts.data.map((script) => (
                            <ScriptsRow
                                id = {script.id}
                                name = {script.name}
                                script_text = {script.script_text}
                                role = {script.role}
                                key = {script.id}
                                handleDelete = {handleDelete}
                                handleUpdate = {handleUpdate}
                            />
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default ScriptsTable;
