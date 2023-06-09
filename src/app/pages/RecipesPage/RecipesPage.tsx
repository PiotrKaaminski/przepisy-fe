import { useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Form, Row, ToggleButton } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

interface ITableRow {
    author: {
        // tego nie wystwielać
        id: number;
        firstName: string;
        lastName: string;
        // tego nie wystwielać
        username: string;
    };
    createdAt: string;
    difficulty: string;
    // tego nie wystwielać
    id: number;
    imageId: number;
    name: string;
    prepareMinutes: number;
    type: string;
}

function RecipesPage() {
  const [data, setData] = useState<ITableRow[]>([]);
  const [checked, setChecked] = useState<boolean>();
  const [refresh, refreshData] = useState<any>();

  const auth = useAuth();
  const navigate = useNavigate();

  const status = useMemo(() => (
    checked ? 'ASC' : 'DESC'
  ), [checked])


  const fetchData = async (e?: any) => {
    const target = e?.target.value as string || '';
    try {
        const response = await fetch(`http://localhost:8080/api/recipes?difficulty=${target}&orderDirection=${status}&orderBy=prepareMinutes`);
        const jsonData = await response.json();
        setData(jsonData);
    } catch (error) {
        console.error(error);
    }
  };

  const deleteRecipe = async (id?: number) => {
    try {
        await fetch(`http://localhost:8080/api/recipes/${id}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': auth?.token
            },
        }).then((response) => { 
            refreshData(response.ok);
        })
    } catch (error) {
        console.error(error);
    }
  }

  const details = (id: number) => {
    navigate(`/recipes/${id}`);
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, refresh, checked]);


  return (
    <>
        <Container>
        <h1 className="my-5">Lista przepisów</h1>
        {auth.isUser && (<Button type="button" className="btn-lg btn btn-success" onClick={() => navigate('/recipes-create')}>
            Dodaj nowy przepis
        </Button>)}
        <Form>
            <Row className="bg-white p-5 my-5 rounded">
                <h2>Sortowanie i filtrowanie</h2><br /><br /><br />
                <Form.Group as={Col} xs="12" className="mb-3">
                    <ToggleButton
                        id="toggle-check"
                        type="checkbox"
                        variant="secondary"
                        checked={checked}
                        value="1"
                        onChange={(e) => setChecked(e.currentTarget.checked)}
                        >
                        Sortuj po czas przygotowania {checked ? 'DESC' : 'ASC'}
                    </ToggleButton>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicDifficulty" as={Col} xs="6">
                    <Form.Label>Trudność</Form.Label>
                    <Form.Select name="role" onChange={(e) => fetchData(e)}>
                        <option value="" selected></option>
                        <option value="łatwy">Łatwy</option>
                        <option value="średni">Średni</option>
                        <option value="trudny">Trudny</option>
                    </Form.Select>
                </Form.Group>
            </Row>
        </Form>
        {data.map((row) => {
            return (
                <>
                    <Row key={row.id}>
                        <Col xs={3}>
                            <img src={`http://localhost:8080/api/images/${row.imageId}`} alt="test" width="100%" />
                        </Col>
                        <Col xs={9}>
                            <h2><b>{row.name}</b></h2>
                            <br />
                            Typ: {row.type}<br />
                            Trudność: {row.difficulty}
                            <br />
                            Czas przygotowywania: {row.prepareMinutes}
                            <br /><br />
                            Utworzono: {row.createdAt}<br />
                            Autor: {row.author.firstName} {row.author.lastName}<br /><br />
                            <Button type="button" className="btn-lg btn btn-primary" onClick={() => details(row?.id)}>
                                Szczegóły
                            </Button>
                            {auth.isAdmin && (<Button type="button" className="btn-lg btn btn-danger mx-3" onClick={() => deleteRecipe(row?.id)}>
                                Usuń
                            </Button>)}
                        </Col>
                    </Row><hr />
                </>
            )
        })}
        </Container>
    </>
  )
}

export default RecipesPage;
