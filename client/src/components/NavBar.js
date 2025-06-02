import react from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'

import "./navbar.css"

const NavBar = (props) => {

    const handleExit = () => {
        localStorage.clear()
    }

    return (
    <Navbar expand="lg" className="navbar-custom sticky-top" data-bs-theme="light">
      <Container>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/dialogues">Разговоры</Nav.Link>
          {
            (localStorage.getItem('rights') == 'super') ? (
            <Nav.Link href="/operators">Операторы</Nav.Link>
            ) : (<br/>)
          }
            <Nav.Link href="/scripts">Скрипты</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <Navbar.Collapse className="justify-content-end">
            { (localStorage.getItem('id')) ? (
              <Navbar.Text>
                Вы вошли как: <u>{localStorage.getItem('name')}</u>{(localStorage.getItem('rights') === "operator") ? (", Оператор") : (
                            (localStorage.getItem('rights') === "super") ? (", Супервайзер") : ("") )}
              </Navbar.Text>
              ) : (<br/>) }
            <Nav.Link href="/login" onClick={()=>handleExit()} className="px-3 pb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                    <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                </svg>
            </Nav.Link>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    );
}

export default NavBar;
