import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../App';

interface IIngredients {
    amount: number;
    createdAt: string;
    name: string;
    unit: string;
    id: number
}

interface IComments {
    id: number;
    author: {
      id: number;
      firstName: string;
      lastName: string;
      username: string;  
    },
    content: string;
    createdAt: string;
}

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
    ingredients: IIngredients[];
    comments: IComments[];
    description: string;
}

function RecipeDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const auth = useAuth();
    const [data, setData] = useState<ITableRow>();
    const [refresh, refreshData] = useState<any>();

    const getRecipe = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/recipes/${id}`);
            const jsonData = await response.json();
            setData(jsonData);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const content = event.target[0].value;

        try {
            await fetch(`http://localhost:8080/api/recipes/${id}/comments`, {
                method: 'POST',
                headers: {
                    'x-access-token': auth?.token,
                    'Content-Type': 'application/json',
                    Accept: '*/*'
                },
                body: JSON.stringify({ 
                    content: content
                })
            }).then((response) => { 
                refreshData(response?.ok)
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getRecipe();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [id, refresh]);

    return (
        <>
            <Container className="">
                <Button type="button" className="btn-lg my-5" variant="light" onClick={() => navigate('/')}>
                    Powrót do listy przepisów
                </Button>
                <Row key={data?.id}>
                    <Col xs={12}>
                        <h1 className="pb-5">Szczegóły przepisu: {data?.name}</h1>
                    </Col>
                    <Col xs={3}>
                        <img src={`http://localhost:8080/api/images/${data?.imageId}`} alt="test" width="100%" />
                    </Col>
                    <Col xs={9}>
                        Typ: {data?.type}<br />
                        Trudność: {data?.difficulty}<br />
                        Czas przygotowywania: {data?.prepareMinutes}<br /><br />
                        Utworzono: {data?.createdAt}<br />
                        Autor: {data?.author.firstName} {data?.author.lastName}<br /><br />
                    </Col>
                    <Col xs={12}>
                        <h3 className="pt-5">Składniki:</h3>
                    </Col>
                    <Col xs={12}>
                        <ul>
                            {data?.ingredients.map((row) => {
                                return (
                                    <li key={row?.id}>
                                        {row?.name} {row?.amount} {row?.unit}
                                    </li>
                                );
                            })}
                        </ul>
                    </Col>
                    <Col xs={12}>
                        {data?.description}
                    </Col>
                    <Col xs={12}>
                        <h3 className="pt-5">Komentarze:</h3>
                    </Col>
                    <Col xs={12}>
                        <div>
                            {data?.comments.map((row) => {
                                return (
                                    <div key={row?.content}>
                                        <b>{row?.author?.username} {row?.createdAt}</b><br />
                                        {row?.content}<hr />
                                    </div>
                                );
                            })}
                        </div>
                    </Col>
                    {!auth || !auth.isUser ? (<div className="pb-5">Zaloguj się, aby dodać komantarz</div>) :
                        (data && data.comments.length < 5 ? (
                            <Col xs={12}>
                                <Form onSubmit={handleSubmit}>
                                    <Row className="bg-white p-5 my-5 rounded">
                                        <Form.Group className="mb-3" controlId="formBasicDifficulty" as={Col} xs="6">
                                            <Form.Label>Komentarz</Form.Label>
                                            <Form.Control as="textarea" rows={3} name="comment" required />
                                            <Button type="submit" className="btn-lg w-auto m-3">
                                                Dodaj
                                            </Button>
                                        </Form.Group>
                                    </Row>
                                </Form>
                            </Col>
                        ) : <div className="pb-5">Maksymalna liczba komentarzy</div>)}
                </Row>
            </Container>
        </>
    );
}

export default RecipeDetailsPage;
