import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;
if (window.location.protocol === 'https:') {
    window.axios.defaults.baseURL = window.location.origin;
}
