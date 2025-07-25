// Menunggu hingga seluruh halaman HTML dimuat sebelum menjalankan JavaScript
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. MEMILIH ELEMEN HTML ---
    const todoForm = document.querySelector('.add-todo-list');
    const todoInput = document.querySelector('.add-todo');
    const dateInput = document.querySelector('.date');
    const todoListUL = document.querySelector('.todo-task');
    const deleteAllButton = document.querySelector('.delete-all');
    const noTaskMsg = document.querySelector('.no-task-msg');
    const sortDateButton = document.querySelector('.filter-date');
    const filterStatusButton = document.querySelector('.filter-sts');

    // --- 2. STATE APLIKASI ---
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentStatusFilter = 'all'; // 'all', 'pending', atau 'completed'
    let dateSortOrder = 'asc'; // 'asc' (menaik) atau 'desc' (menurun)
    // --- 3. FUNGSI-FUNGSI UTAMA ---

    function saveAndRender() {
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    }

    function renderTodos() {
        todoListUL.innerHTML = '';

        // Langkah 1: Filter berdasarkan status
        let filteredTodos = todos;
        if (currentStatusFilter === 'pending') {
            filteredTodos = todos.filter(todo => !todo.completed);
        } else if (currentStatusFilter === 'completed') {
            filteredTodos = todos.filter(todo => todo.completed);
        }

        // Langkah 2: Urutkan hasil filter berdasarkan tanggal
        filteredTodos.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // Langkah 3: Tampilkan hasilnya
        if (filteredTodos.length === 0) {
            todoListUL.innerHTML = '<li class="no-task-msg">No Task Found for this Filter</li>';
        } else {
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `task-item ${todo.completed ? 'completed' : ''}`;
                li.setAttribute('data-id', todo.id);

                const formattedDate = todo.date ? new Date(todo.date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date';
                const statusText = todo.completed ? 'Completed' : 'Pending';

                li.innerHTML = `
                    <span class="task-name">${todo.text}</span>
                    <span class="due-date">${formattedDate}</span>
                    <span class="status">${statusText}</span>
                    <span class="actions">
                        <input type="checkbox" class="status-checkbox" title="Tandai sebagai selesai" ${todo.completed ? 'checked' : ''}>
                        <button class="delete-btn" title="Hapus tugas"></button>
                    </span>
                `;
                todoListUL.appendChild(li);
            });
        }
    }

    // --- BARU: Fungsi untuk mengubah urutan tanggal ---
    function toggleDateSort() {
        dateSortOrder = dateSortOrder === 'asc' ? 'desc' : 'asc';
        sortDateButton.textContent = dateSortOrder === 'asc' ? 'Sort: Oldest First' : 'Sort: Newest First';
        sortDateButton.classList.add('active'); // Memberi tanda visual
        renderTodos();
    }

    // --- BARU: Fungsi untuk mengganti filter status ---
    function cycleStatusFilter() {
        if (currentStatusFilter === 'all') {
            currentStatusFilter = 'pending';
        } else if (currentStatusFilter === 'pending') {
            currentStatusFilter = 'completed';
        } else {
            currentStatusFilter = 'all';
        }
        filterStatusButton.textContent = `Filter: ${currentStatusFilter.charAt(0).toUpperCase() + currentStatusFilter.slice(1)}`;
        
        // Atur kelas 'active'
        if(currentStatusFilter !== 'all') {
            filterStatusButton.classList.add('active');
        } else {
            filterStatusButton.classList.remove('active');
        }
        renderTodos();
    }

    function addTodo(event) {
        event.preventDefault();
        const todoText = todoInput.value.trim();
        const todoDate = dateInput.value;

        //memastikan tugas & tanggal diisi
        if (todoText === '' && todoDate === '') {
            alert('Silahkan isi tugas & tanggal!');
            return;
        }
        
        // memastikan tugas diisi
        if (todoText === '') {
            alert('Silahkan isi tugas!');
            return;
        }

        // memastikan tanggal diisi
        if (todoDate === '') {
            alert('Silahkan isi tanggal!');
            return;
        }

        const newTodo = {
            id: Date.now(),
            text: todoText,
            date: todoDate,
            completed: false // Status awal selalu 'false', yang akan dirender sebagai "Pending"
        };

        todos.push(newTodo);
        todoInput.value = '';
        dateInput.value = '';
        saveAndRender();
    }

    function handleListActions(event) {
        const target = event.target;
        const parentLi = target.closest('.task-item');
        if (!parentLi) return;

        const todoId = Number(parentLi.getAttribute('data-id'));

        // Jika tombol hapus yang diklik
        if (target.classList.contains('delete-btn')) {
            todos = todos.filter(todo => todo.id !== todoId);
            saveAndRender();
        }

        // --- DIUBAH: Menggunakan checkbox untuk mengubah status ---
        // Aksi dijalankan saat checkbox di-klik.
        if (target.classList.contains('status-checkbox')) {
            todos = todos.map(todo => 
                todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
            );
            saveAndRender();
        }
    }

    function deleteAllTasks() {
        if (confirm('Apakah Anda yakin ingin menghapus semua tugas?')) {
            todos = [];
            saveAndRender();
        }
    }

    // --- 4. EVENT LISTENERS ---
    todoForm.addEventListener('submit', addTodo);
    todoListUL.addEventListener('click', handleListActions);
    deleteAllButton.addEventListener('click', deleteAllTasks);
    sortDateButton.addEventListener('click', toggleDateSort);
    filterStatusButton.addEventListener('click', cycleStatusFilter);

    // --- 5. RENDER AWAL ---
    renderTodos();
});