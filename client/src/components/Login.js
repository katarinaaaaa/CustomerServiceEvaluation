import react, { useState } from 'react'
import { Form, Button, Alert } from "react-bootstrap"
import { useHistory } from 'react-router-dom'

import "./login.css"

const Login = () => {
    const [inputUsername, setInputUsername] = useState("");
    const [inputPassword, setInputPassword] = useState("");

    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    let history = useHistory()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);
        const url = "http://localhost:8000/auth/?id=" + inputUsername + "&password=" + inputPassword
        console.log(url)
        const response = await fetch(url)
        response.json().then(resp => {
            if(resp.status === 'ok') {
                localStorage.setItem('rights', resp.data.rights);
                localStorage.setItem('id', resp.data.user_id);
                localStorage.setItem('name', resp.data.name);
                history.push("/dialogues")
                document.location.reload()   
            } else {
                setShow(true);
                setLoading(false);
            }
        })
    } 

    return (
    <div className="sign-in__wrapper">
        <div className="sign-in__backdrop"></div>
        <Form className="shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
        <div className="h4 mt-2 mb-4 text-center">Вход</div>

        <Form.Group className="mb-3" controlId="username">
            <Form.Label>ID</Form.Label>
            <Form.Control
            type="text"
            value={inputUsername}
            placeholder="ID"
            onChange={(e) => setInputUsername(e.target.value)}
            required
            />
        </Form.Group>

        <Form.Group className="mb-4" controlId="password">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
            type="password"
            value={inputPassword}
            placeholder="Пароль"
            onChange={(e) => setInputPassword(e.target.value)}
            required
            />

        {show ? (
            <Alert
            className="mb-2 mt-2"
            variant="danger"
            onClose={() => setShow(false)}
            dismissible
            >
            Некорректный ID или пароль.
            </Alert>
        ) : (
            <div />
        )}

        </Form.Group>
        {!loading ? (
            <Button className="mb-2 w-100" variant="dark" type="submit">
            Войти
            </Button>
        ) : (
            <Button className="mb-2 w-100" variant="dark" type="submit" disabled>
            Вход...
            </Button>
        )}
        </Form>
    </div>
    );
};

export default Login;
