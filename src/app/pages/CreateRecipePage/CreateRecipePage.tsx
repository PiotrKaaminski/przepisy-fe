import { useState } from 'react';
import { Button, Col, Container, Form, Row, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

function CreateRecipePage() {
    const navigate = useNavigate();
    const auth = useAuth();

    console.log('auth: ', auth);

    const [isSuccess, setSuccess] = useState<boolean>(false);
    const [isError, setError] = useState<boolean>(false);
    const defaultIngredient = { name: '', amount: 0, unit: 'ml' }
    const [ingredients, setIngredients] = useState([defaultIngredient]);

    const [image, setImage] = useState<any>();

    const handleFileChange = (e: any) => {
        console.log('e: ', e);
        if (e.target.files) {
            setImage(e.target.files);
        }
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        const name = event.target[1].value;
        const type = event.target[2].value;
        const difficulty = event.target[3].value;
        const prepareMinutes = event.target[4].value;
        const description = event.target[5].value;

        setSuccess(false);
        setError(false);

        const recipe = {
            name: name,
            type: type,
            difficulty: difficulty,
            prepareMinutes: prepareMinutes,
            description: description,
            ingredients: ingredients
        };

        console.log('image: ', image[0])

        const form = new FormData();
        form.append("recipe", JSON.stringify(recipe));
        if (image[0]) {
            form.append("image", image[0]);
        }

        try {
            await fetch(`http://localhost:8080/api/recipes`, {
                method: 'POST',
                headers: {
                    'x-access-token': auth?.token
                },
                body: form
            }).then((response) => { 
                console.log('response: ', response);
                response.ok === true ? setSuccess(true) : setError(true);
            })
        } catch (error) {
            console.error(error);
        }
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { ...defaultIngredient }]);
      };

      const onChangeIngredient = (index: number) => ({ target: { value, name } }: any) => {
        const newIngredients = ingredients.map((ingredient, _index) =>
          _index === index ? { ...ingredient, [name]: value } : ingredient
        );
        setIngredients(newIngredients);
      };

      const removeIngredient = (index: number) => {
        if (ingredients.length === 1) {
          return;
        }
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients);
      };

    return (
        <section id="createRecipe">
            <Container className="h-100 d-flex justify-content-center align-items-center flex-direction-column">
                <Form onSubmit={handleSubmit}>
                    <Button type="button" className="btn-lg my-5" variant="light" onClick={() => navigate('/')}>
                        Powrót do listy przepisów
                    </Button>
                    <Row className="bg-white p-5 rounded">
                        <Form.Group as={Col} xs="12">
                            <h1 className="text-center pb-5">Tworzenie nowego przepisu</h1>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicName" as={Col} xs="12">
                            <Form.Label>Nazwa</Form.Label>
                            <Form.Control type="text" name="name" placeholder="Nazwa" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicType" as={Col} xs="4">
                            <Form.Label>Typ</Form.Label>
                            <Form.Select name="type" required>
                                <option value="śniadanie">Śniadanie</option>
                                <option value="obiad">Obiad</option>
                                <option value="deser">Deser</option>
                                <option value="kolacja">Kolacja</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicDifficulty" as={Col} xs="4">
                            <Form.Label>Trudność</Form.Label>
                            <Form.Select name="difficulty" required>
                                <option value="łatwy">Łatwy</option>
                                <option value="średni">Średni</option>
                                <option value="trudny">Trudny</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPrepareMinutes" as={Col} xs="4">
                            <Form.Label>Szacowany czas przygotowania (min)</Form.Label>
                            <Form.Control type="number" name="prepareMinutes" min="0" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicDescription" as={Col} xs="12">
                            <Form.Label>Opis</Form.Label>
                            <Form.Control as="textarea" rows={3} name="description" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicFile" as={Col} xs="12" onChange={(e) => handleFileChange(e)}>
                            <Form.Label>Zdjęcie</Form.Label>
                            <Form.Control type="file" name="image" />
                        </Form.Group>
                        <strong>Składniki:</strong>
                        {ingredients.map((_: any, index: number) => (
                            <div key={index}>
                                    <Form.Group as={Row} controlId="formGridName" className="d-flex align-items-end">
                                        <Form.Group as={Col} xs="5">
                                            <Form.Label>Nazwa</Form.Label>
                                            <Form.Control
                                                autoComplete="off"
                                                type="text"
                                                name="name"
                                                onChange={onChangeIngredient(index)}
                                                required
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} xs="2">
                                            <Form.Label>Ilość</Form.Label>
                                            <Form.Control
                                                autoComplete="off"
                                                type="number"
                                                name="amount"
                                                onChange={onChangeIngredient(index)}
                                                required
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} xs="3">
                                        <Form.Label>Jednostka</Form.Label>
                                            <Form.Select name="unit" onChange={onChangeIngredient(index)} required>
                                                <option value="ml">ml</option>
                                                <option value="l">l</option>
                                                <option value="g">g</option>
                                                <option value="dg">dg</option>
                                                <option value="kg">kg</option>
                                                <option value="szt">szt</option>
                                                <option value="łyżka">łyżka</option>
                                                <option value="szklanka">szklanka</option>
                                        </Form.Select>
                                        </Form.Group>
                                        <Form.Group as={Col} xs="2">
                                            {ingredients.length > 1 && (
                                            <Button variant="danger" onClick={() => removeIngredient(index)}>
                                                Usuń
                                            </Button>
                                            )}
                                        </Form.Group>
                                    </Form.Group>
                            </div>
                        ))}
                        <Button onClick={addIngredient} variant="success" className="w-auto mt-3">Dodaj nowy składnik</Button>
                        <Form.Group as={Col} xs="12" className="mt-5">
                            <Button type="submit" className="btn-lg w-auto m-3">
                                Zapisz
                            </Button>
                        </Form.Group>
                    </Row>
                </Form>
                <Toast show={isSuccess} onClose={() => setSuccess(false)}>
                    <Toast.Header>
                        <strong>Tworzenie</strong>
                    </Toast.Header>
                    <Toast.Body>:)</Toast.Body>
                </Toast>
                <Toast show={isError} onClose={() => setError(false)}>
                    <Toast.Header>
                        <strong>Tworzenie</strong>
                    </Toast.Header>
                    <Toast.Body>:(</Toast.Body>
                </Toast>
            </Container>
        </section>
    );
};

export default CreateRecipePage;
