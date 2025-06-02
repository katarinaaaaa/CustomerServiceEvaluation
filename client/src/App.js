import react from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

import { ScriptsProvider } from './components/ScriptsContext'
import { UpdateScriptContextProvider } from './components/UpdateScriptContext'
import { OperatorsContextProvider } from './components/OperatorsContext'
import { UpdateOperatorContextProvider } from './components/UpdateOperatorContext'
import { DialoguesContextProvider } from './components/DialoguesContext'
import { DialogueMoreContextProvider } from './components/DialogueMoreContext'

import NavBar from './components/NavBar'
import Login from './components/Login'
import ScriptsTable from './components/ScriptsTable'
import AddScript from './components/AddScript'
import UpdateScript from './components/UpdateScript'
import OperatorsTable from './components/OperatorsTable'
import UpdateOperator from './components/UpdateOperator'
import DialoguesTable from './components/DialoguesTable'
import AddDialogue from './components/AddDialogue'
import DialogueMore from './components/DialogueMore'

import "./components/login.css"

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={(props) => (
            localStorage.getItem('id') ?
                <Component {...props} /> : <Redirect to="/login" />
        )}
    />
);

const PrivateSuperRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={(props) => (
            (localStorage.getItem('id') && localStorage.getItem('rights') === 'super') ?
                <Component {...props} /> : <Redirect to="/dialogues" />
        )}
    />
);

function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route exact path="/login" component={Login} />
          <ScriptsProvider>
            <NavBar/>
            <UpdateScriptContextProvider>
              <OperatorsContextProvider>
                <UpdateOperatorContextProvider>
                  <DialoguesContextProvider>
                    <DialogueMoreContextProvider>
                      <Route exact path="/login" component={ScriptsTable} />

                      <PrivateRoute exact path="/scripts" component={ScriptsTable} />
                      <PrivateRoute exact path="/updatescript/:id" component={UpdateScript} />
                      <PrivateSuperRoute exact path="/addscript" component={AddScript} />

                      <PrivateRoute exact path="/operators" component={OperatorsTable} />
                      <PrivateSuperRoute exact path="/updateoperator/:id" component={UpdateOperator} />

                      <PrivateRoute exact path="/" component={DialoguesTable} />
                      <PrivateRoute exact path="/dialogues" component={DialoguesTable} />

                      <PrivateRoute exact path="/adddialogue" component={AddDialogue} />
                      <PrivateRoute exact path="/dialogue/:id" component={DialogueMore} />
                    </DialogueMoreContextProvider>
                  </DialoguesContextProvider>
                </UpdateOperatorContextProvider>
              </OperatorsContextProvider>
            </UpdateScriptContextProvider>
          </ScriptsProvider>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
