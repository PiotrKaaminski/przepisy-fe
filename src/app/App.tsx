// Bootstrap CSS & Bundle JS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import * as React from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { CreateRecipePage, ProtectedPage, RecipeDetailsPage, RecipesPage, RegisterPage } from "./pages";
import { useLoginMutation } from "./api/modules/authentication";
import { QueryClient, QueryClientProvider } from "react-query";

import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useCallback, useMemo } from "react";

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/protected"
              element={
                <RequireAuth>
                  <ProtectedPage />
                </RequireAuth>
              }
            />
            <Route
              path="/register"
              element={
                <RegisterPage />
              }
            />
            <Route
              path="/"
              element={<RecipesPage />}
            />
            <Route
              path="/recipes-create"
              element={
                <RequireAuth>
                  <CreateRecipePage />
                </RequireAuth>
              }
            />
            <Route
              path="/recipes/:id"
              element={<RecipeDetailsPage />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function Layout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation()

  return (
    <>
    {location.pathname !== '/login' && location.pathname !== '/register' && (<div className="bg-white">
      {!auth.token && (<Button type="button" className="btn-lg btn-success m-3" onClick={() => navigate('/login')}>
        Zaloguj się
      </Button>)}
          {auth.token && (<Button type="button" className="btn-lg btn-danger m-3" onClick={() => navigate('/login')}>
        Wyloguj się
      </Button>)}
    </div>)}
    <Outlet /></>
  );
}

interface AuthContextType {
  token: string;
  signin: (username: string, password: string) => void;
  isAdmin: boolean;
  isUser: boolean;
}

enum Roles {
  ROLE_USER = 'ROLE_USER',
  ROLE_ADMIN = 'ROLE_ADMIN'
}

interface IResponseLogin {
  data: {
    accessToken: string;
    id: string;
    roles: Roles;
    username: string;
  }
}

const AuthContext = React.createContext<AuthContextType>(null!);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<any>();
  const [username, setUsername] = React.useState<any>();
  const [roles, setRoles] = React.useState<any>();

  const navigate = useNavigate();
  const location = useLocation();

  const defaultAuthorizedPathname = '/';
  const from = location.state?.from?.pathname || defaultAuthorizedPathname;

  const { mutate: login } = useLoginMutation({
    onSuccess: (res: IResponseLogin) => {
      setToken(res?.data?.accessToken);
      setUsername(res?.data?.username);
      setRoles(res?.data?.roles);
      navigate(from, { replace: true });
    },
    onError: (error: Error) => {
      console.log(error);
    }
  });

  const signin = useCallback(async(username: string, password: string) => {
    login({
      username: username,
      password: password
    })
  }, [login]);

  const isAdmin = roles?.includes('ROLE_ADMIN');
  const isUser = roles?.includes('ROLE_USER');
  console.log('roles: ', roles);

  const value = useMemo(() => {
    return {
      token, signin, username, roles, isAdmin, isUser
    }
  }, [roles, signin, token, username, isAdmin])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

function RequireAuth({ children }: { children: any }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (formData: any) => {
    formData.preventDefault();
    formData.stopPropagation();

    const username = formData.target[0].value;
    const password = formData.target[1].value;

    auth.signin(username, password);

    formData.target.reset();
  };

  return (
    <Container className="h-100 d-flex justify-content-center align-items-center">
      <Form onSubmit={handleSubmit}>
        <Row className="bg-white p-5 rounded">
          <Form.Group as={Col} xs="12">
            <h1 className="text-center pb-5">Logowanie</h1>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicLogin" as={Col} xs="6">
            <Form.Label>Login</Form.Label>
            <Form.Control type="text" name="username" placeholder="Login" required />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword" as={Col} xs="6">
            <Form.Label>Hasło</Form.Label>
            <Form.Control type="password" name="password" placeholder="Password" required />
          </Form.Group>
          <Form.Group as={Col} xs="12" className="text-center mb-3">
            <Button type="submit" className="btn-lg w-50 m-3">
              Zaloguj się
            </Button>
          </Form.Group>
          <Form.Group as={Col} xs="12" className="text-center mb-3">
            <Button type="button" className="btn-lg m-3 w-49 " variant="light" onClick={() => navigate('/register')}>
              Rejestracja
            </Button>
            <Button type="button" className="btn-lg w-49 m-3" variant="light" onClick={() => navigate('/')}>
              Powrót do listy przepisów
            </Button>
          </Form.Group>
        </Row>
      </Form>
    </Container>
  );
}
