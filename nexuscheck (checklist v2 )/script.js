 document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const taskInput = document.getElementById('taskInput');
            const addBtn = document.getElementById('addBtn');
            const taskList = document.getElementById('taskList');
            const totalCount = document.getElementById('totalCount');
            const completedCount = document.getElementById('completedCount');
            const clearCompletedBtn = document.getElementById('clearCompleted');
            const groupsList = document.getElementById('groupsList');
            const addGroupBtn = document.getElementById('addGroupBtn');
            const currentGroupTitle = document.getElementById('currentGroupTitle');
            const currentGroupName = document.getElementById('currentGroupName');
            const currentGroupColor = document.getElementById('currentGroupColor');
            const editGroupBtn = document.getElementById('editGroupBtn');
            const deleteGroupBtn = document.getElementById('deleteGroupBtn');

            // Modal Elements
            const groupModal = document.getElementById('groupModal');
            const groupModalTitle = document.getElementById('groupModalTitle');
            const groupNameInput = document.getElementById('groupName');
            const colorOptions = document.querySelectorAll('.color-option');
            const closeGroupModal = document.getElementById('closeGroupModal');
            const cancelGroupModal = document.getElementById('cancelGroupModal');
            const saveGroupModal = document.getElementById('saveGroupModal');

            // State
            let groups = JSON.parse(localStorage.getItem('groups')) || [];
            let currentGroupId = null;
            let selectedColor = '#ff2d7b';
            let isEditingGroup = false;
            let editingGroupId = null;

            // Initialize
            renderGroups();

            // Event Listeners
            addBtn.addEventListener('click', addTask);
            taskInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') addTask();
            });

            clearCompletedBtn.addEventListener('click', clearCompletedTasks);
            addGroupBtn.addEventListener('click', openGroupModal);
            editGroupBtn.addEventListener('click', editCurrentGroup);
            deleteGroupBtn.addEventListener('click', deleteCurrentGroup);

            closeGroupModal.addEventListener('click', closeModal);
            cancelGroupModal.addEventListener('click', closeModal);
            saveGroupModal.addEventListener('click', saveGroup);

            colorOptions.forEach(option => {
                option.addEventListener('click', function() {
                    colorOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedColor = this.dataset.color;
                });
            });

            // Functions
            function renderGroups() {
                groupsList.innerHTML = '';

                if (groups.length === 0) {
                    // Create a default group if none exist
                    const defaultGroup = {
                        id: Date.now(),
                        name: 'My Tasks',
                        color: '#00f7ff',
                        tasks: []
                    };
                    groups.push(defaultGroup);
                    saveGroups();
                }

                groups.forEach(group => {
                    const groupItem = document.createElement('li');
                    groupItem.className = `group-item ${currentGroupId === group.id ? 'active' : ''}`;
                    groupItem.dataset.id = group.id;

                    groupItem.innerHTML = `
                        <div class="group-color" style="background-color: ${group.color};"></div>
                        <span class="group-name">${group.name}</span>
                    `;

                    groupItem.addEventListener('click', function() {
                        selectGroup(group.id);
                    });

                    groupsList.appendChild(groupItem);
                });

                // Select the first group if none is selected
                if (!currentGroupId && groups.length > 0) {
                    selectGroup(groups[0].id);
                }
            }

            function selectGroup(groupId) {
                currentGroupId = groupId;
                const group = groups.find(g => g.id === groupId);

                // Update UI
                document.querySelectorAll('.group-item').forEach(item => {
                    item.classList.remove('active');
                    if (parseInt(item.dataset.id) === groupId) {
                        item.classList.add('active');
                    }
                });

                currentGroupName.textContent = group.name;
                currentGroupColor.style.backgroundColor = group.color;

                // Render tasks for this group
                renderTasks();
            }

            function renderTasks() {
                taskList.innerHTML = '';

                const group = groups.find(g => g.id === currentGroupId);
                if (!group) return;

                if (group.tasks.length === 0) {
                    taskList.innerHTML = '<li class="no-tasks">No tasks in this group yet. Add one above!</li>';
                } else {
                    group.tasks.forEach(task => {
                        const taskItem = document.createElement('li');
                        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
                        taskItem.dataset.id = task.id;

                        taskItem.innerHTML = `
                            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                            <div class="task-content">
                                <span class="task-text">${task.text}</span>
                            </div>
                            <div class="task-actions">
                                <button class="delete-btn">✕</button>
                            </div>
                        `;

                        taskList.appendChild(taskItem);

                        // Add event listeners
                        const checkbox = taskItem.querySelector('.task-checkbox');
                        const deleteBtn = taskItem.querySelector('.delete-btn');

                        checkbox.addEventListener('change', function() {
                            toggleTask(task.id, this.checked);
                        });

                        deleteBtn.addEventListener('click', function() {
                            deleteTask(task.id);
                        });
                    });
                }

                updateStats();
            }

            function addTask() {
                const taskText = taskInput.value.trim();
                if (taskText === '' || !currentGroupId) return;

                const newTask = {
                    id: Date.now(),
                    text: taskText,
                    completed: false
                };

                const groupIndex = groups.findIndex(g => g.id === currentGroupId);
                if (groupIndex !== -1) {
                    groups[groupIndex].tasks.push(newTask);
                    saveGroups();
                    renderTasks();

                    taskInput.value = '';
                    taskInput.focus();

                    // Animation for new task
                    const lastTask = taskList.lastChild;
                    if (lastTask) {
                        lastTask.style.opacity = '0';
                        lastTask.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            lastTask.style.opacity = '1';
                            lastTask.style.transform = 'translateY(0)';
                        }, 10);
                    }
                }
            }

            function toggleTask(taskId, isChecked) {
                const groupIndex = groups.findIndex(g => g.id === currentGroupId);
                if (groupIndex === -1) return;

                const taskIndex = groups[groupIndex].tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    groups[groupIndex].tasks[taskIndex].completed = isChecked;
                    saveGroups();
                    renderTasks();
                }
            }

            function deleteTask(taskId) {
                const groupIndex = groups.findIndex(g => g.id === currentGroupId);
                if (groupIndex === -1) return;

                groups[groupIndex].tasks = groups[groupIndex].tasks.filter(t => t.id !== taskId);
                saveGroups();
                renderTasks();
            }

            function clearCompletedTasks() {
                const groupIndex = groups.findIndex(g => g.id === currentGroupId);
                if (groupIndex === -1) return;

                groups[groupIndex].tasks = groups[groupIndex].tasks.filter(t => !t.completed);
                saveGroups();
                renderTasks();
            }

            function updateStats() {
                const group = groups.find(g => g.id === currentGroupId);
                if (!group) return;

                totalCount.textContent = group.tasks.length;
                const completed = group.tasks.filter(t => t.completed).length;
                completedCount.textContent = completed;
            }

            function openGroupModal() {
                isEditingGroup = false;
                editingGroupId = null;
                groupModalTitle.textContent = 'Add New Group';
                groupNameInput.value = '';
                selectedColor = '#ff2d7b';

                colorOptions.forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.color === selectedColor) {
                        option.classList.add('selected');
                    }
                });

                groupModal.classList.add('active');
            }

            function editCurrentGroup() {
                if (!currentGroupId) return;

                const group = groups.find(g => g.id === currentGroupId);
                if (!group) return;

                isEditingGroup = true;
                editingGroupId = currentGroupId;
                groupModalTitle.textContent = 'Edit Group';
                groupNameInput.value = group.name;
                selectedColor = group.color;

                colorOptions.forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.color === selectedColor) {
                        option.classList.add('selected');
                    }
                });

                groupModal.classList.add('active');
            }

            function deleteCurrentGroup() {
                if (!currentGroupId || groups.length <= 1) return;

                if (confirm('Are you sure you want to delete this group? All tasks in it will be lost.')) {
                    groups = groups.filter(g => g.id !== currentGroupId);
                    saveGroups();
                    renderGroups();

                    // Select the first available group
                    if (groups.length > 0) {
                        selectGroup(groups[0].id);
                    } else {
                        currentGroupId = null;
                        currentGroupName.textContent = 'Select a Group';
                        taskList.innerHTML = '<li class="no-tasks">Select or create a group to get started</li>';
                        updateStats();
                    }
                }
            }

            function closeModal() {
                groupModal.classList.remove('active');
            }

            function saveGroup() {
                const name = groupNameInput.value.trim();
                if (name === '') return;

                if (isEditingGroup) {
                    const groupIndex = groups.findIndex(g => g.id === editingGroupId);
                    if (groupIndex !== -1) {
                        groups[groupIndex].name = name;
                        groups[groupIndex].color = selectedColor;
                    }
                } else {
                    const newGroup = {
                        id: Date.now(),
                        name: name,
                        color: selectedColor,
                        tasks: []
                    };
                    groups.push(newGroup);
                }

                saveGroups();
                renderGroups();

                if (!isEditingGroup && groups.length > 0) {
                    selectGroup(groups[groups.length - 1].id);
                }

                closeModal();
            }

            function saveGroups() {
                localStorage.setItem('groups', JSON.stringify(groups));
            }
        });