const API_BASE_URL = 'http://localhost:8000';

// Axios 기본 설정
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Todo 목록 조회
async function fetchTodos() {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/todos/`);
        const todoList = document.getElementById('todoList');

        todoList.innerHTML = response.data.map(todo => 
            `<div class="todo-item flex items-center gap-4 p-4 bg-white shadow-md rounded-lg transition-all hover:shadow-xl">
                <input type="checkbox"
                    class="w-5 h-5 accent-blue-500"
                    ${todo.is_completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id}, this.checked)">
                <span class="flex-1 text-lg font-medium ${todo.is_completed ? 'line-through text-gray-500' : ''}">
                    <b>${todo.title}</b>: ${todo.content}
                </span>
                <button onclick="deleteTodo(${todo.id})"
                    class="px-3 py-1 text-sm font-semibold text-red-600 hover:text-white border border-red-500 hover:bg-red-500 rounded transition-all">
                    삭제
                </button>
            </div>`
        ).join('');
    } catch (error) {
        console.error('Error:', error);
        if (error.response?.status === 401) {
            window.location.href = 'login.html'; // 로그인 페이지 이동
        }
    }
}

document.getElementById("createTodoForm").addEventListener('submit', async (e) => {
    e.preventDefault();

    const titleInput = document.getElementById("newTodoTitle");
    const contentInput = document.getElementById("newTodoContent");

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        alert("제목과 내용을 모두 입력하세요!");
        return;
    }

    try {
        await axios.post(`${API_BASE_URL}/api/todos/`, { title, content });
        titleInput.value = '';
        contentInput.value = '';
        fetchTodos(); // 목록 다시 불러오기
    } catch (error) {
        console.log(error);
        alert('TODO 생성 실패: ' + error.message);
    }
});

// Todo 삭제 기능 추가
async function deleteTodo(todoId) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    
    try {
        await axios.delete(`${API_BASE_URL}/api/todos/${todoId}/`);
        fetchTodos();
    } catch (error) {
        console.error('Error:', error);
        alert('삭제 실패: ' + error.message);
    }
}

// 페이지 로드 시 Todo 목록 조회
document.addEventListener('DOMContentLoaded', fetchTodos);
