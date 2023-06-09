import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const API = {
    authentication: {
      login: (formValues: any) => {
        return axios.post(`${API_URL}/auth/signin`, formValues);
      } 
    }
}

export default API;