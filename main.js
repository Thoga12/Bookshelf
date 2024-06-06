document.addEventListener('DOMContentLoaded', function () {
    const SAVED_BOOK = 'saved-book';
    const STORAGE_KEY = 'BOOK_APPS';
    const submitForm = document.getElementById('inputBook');
    const searchs = document.getElementById('searchBook');
    const books = [];
    const RENDER_BOOK = 'render-book';
    if (isStorageExist()){
        loadDataFromStorage()
    }
    const isChecked = document.getElementById('inputBookIsComplete');

    isChecked.addEventListener('change', function () {
        if (isChecked.checked) {
            document.getElementsByTagName('span')[0].innerText = `Selesai Dibaca`;
        }else{
            document.getElementsByTagName('span')[0].innerText = `Belum Selesai Dibaca`;     
        }
    })
    searchs.addEventListener('submit', function (event) {
        event.preventDefault()
        searchBook()
    })
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    function isStorageExist() {
        if (typeof (Storage) === undefined) {
            alert('Browser kamu tidak mendukung local storage');
            return false;
        }
        return true;
    }
    function addBook() {
        const title = document.getElementById('inputBookTitle').value;
        const author = document.getElementById('inputBookAuthor').value;
        const year = document.getElementById('inputBookYear').value;
        const isCompleted = document.getElementById('inputBookIsComplete').checked;
        const generatedID = generateId();
        const todoObject = generateTodoObject(generatedID, title, author, parseInt(year), isCompleted);
        books.push(todoObject);
        console.log(books);
        document.dispatchEvent(new Event(RENDER_BOOK));
        saveData();
    }
    
    function generateId() {
        return +new Date();
    }
    function generateTodoObject(id, title, author, year, isCompleted) {
        return {
            id,
            title,
            author,
            year,
            isCompleted
        }
    }

    function searchBook() {
        const searc = document.getElementById('searchBookTitle').value;
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);

        const uncompletedRead = document.getElementById('incompleteBookshelfList');
        uncompletedRead.innerHTML = '';
        
        const completedRead = document.getElementById('completeBookshelfList');
        completedRead.innerHTML = '';
        if (data !== null) {
            if (searc === "") {
                const uncompletedRead = document.getElementById('incompleteBookshelfList');
                uncompletedRead.innerHTML = '';
                
                const completedRead = document.getElementById('completeBookshelfList');
                completedRead.innerHTML = '';
                
                for (const book of data) {
                    const bookElement = makeBook(book);
                    if (!book.isCompleted){
                        uncompletedRead.append(bookElement);
                    }
                    else{
                        completedRead.append(bookElement);
                    }
                }
            }else {    
                let found = false;
                for(const book of data){
                    const bookElement = makeBook(book);
                    if (book.title === searc){
                        found = true
                        console.log(!book.title === searc)
                        if (!book.isCompleted) {
                            uncompletedRead.append(bookElement);
                            
                        }else{
                            completedRead.append(bookElement);
                        }
                    }
                }
                if (!found) {
                    alert(`Tidak Ada Buku dengan judul "${searc}"`);
                }
            }
        }
    }

    function saveData() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(books);
            localStorage.setItem(STORAGE_KEY, parsed);
            document.dispatchEvent(new Event(SAVED_BOOK));
        }
    }
    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);
        const uncompletedRead = document.getElementById('incompleteBookshelfList');
        uncompletedRead.innerHTML = '';
        
        const completedRead = document.getElementById('completeBookshelfList');
        completedRead.innerHTML = '';
        if (data !== null) {    
          for (const book of data) {
            books.push(book);
            const bookElement = makeBook(book);
            if (!book.isCompleted){
                uncompletedRead.append(bookElement);
            }else{
                completedRead.append(bookElement);
            }
          }
        }     
        document.dispatchEvent(new Event(RENDER_BOOK));
    }
    
    document.addEventListener(SAVED_BOOK, function () {
        const uncompletedRead = document.getElementById('incompleteBookshelfList');
        uncompletedRead.innerHTML = '';
        
        const completedRead = document.getElementById('completeBookshelfList');
        completedRead.innerHTML = '';
        
        for (const bookItem of books) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isCompleted){
                uncompletedRead.append(bookElement);
            }else{
                completedRead.append(bookElement);
            }
        }
    });

    function makeBook(bookObject) {
        const textTitle = document.createElement('h3');
        textTitle.innerText = bookObject.title;
       
        const textAuthor = document.createElement('p');
        textAuthor.innerText = bookObject.author;

        const textYear = document.createElement('p');
        textYear.innerText = bookObject.year;
       
        const textContainer = document.createElement('article');
        textContainer.classList.add('book_item');
        textContainer.append(textTitle, textAuthor, textYear);
       
        textContainer.setAttribute('id', `book-${bookObject.id}`);
        
        if (bookObject.isCompleted) {
            const undoButton = document.createElement('button');
            undoButton.classList.add('green');
            undoButton.innerText = "Belum Selesai Dibaca";
         
            undoButton.addEventListener('click', function () {
              undoBookFromCompleted(bookObject.id);
            });
         
            const trashButton = document.createElement('button');
            trashButton.classList.add('red');
            trashButton.innerText = "Hapus Buku"
            
            const action = document.createElement('div');
            action.classList.add('action')
            action.append(undoButton,trashButton)

            trashButton.addEventListener('click', function () {
              removeBookFromCompleted(bookObject.id);
            });
         
            textContainer.append(action);
        } else {
            const undoButton = document.createElement('button');
            undoButton.classList.add('green');
            undoButton.innerText = "Selesai Dibaca";
            
            undoButton.addEventListener('click', function () {
              addBookToCompleted(bookObject.id);
            });
        
            const trashButton = document.createElement('button');
            trashButton.classList.add('red');
            trashButton.innerText = "Hapus Buku"
            trashButton.addEventListener('click', function () {
                removeBookFromCompleted(bookObject.id);
            });
            const action = document.createElement('div');
            action.classList.add('action')
            action.append(undoButton,trashButton)

            textContainer.append(action);
        }
        return textContainer;   
    }

    function addBookToCompleted (todoId) {
        const bookTarget = findTodo(todoId);
       
        if (bookTarget == null) return;
       
        bookTarget.isCompleted = true;
        document.dispatchEvent(new Event(RENDER_BOOK));
        saveData();
    }
    function findTodo(bookId) {
        for (const bookItem of books) {
          if (bookItem.id === bookId) {
            return bookItem;
          }
        }
        return null;
    }
    function removeBookFromCompleted(todoId) {
        const confirmDeleteButton = document.getElementById('confirmDelete');
        const cancelDeleteButton = document.getElementById('cancelDelete');
        showDialog()

        confirmDeleteButton.addEventListener('click', () => {
            const todoTarget = findTodoIndex(todoId);
       
            if (todoTarget === -1) return;
        
            books.splice(todoTarget, 1);
            document.dispatchEvent(new Event(RENDER_BOOK));      
            hideDialog();
            saveData()

        });
        cancelDeleteButton.addEventListener('click', () => {
            hideDialog();
        });
    }

    function showDialog() {
        const deleteDialog = document.getElementById('deleteDialog');
        deleteDialog.style.display = 'block';
    }

    function hideDialog() {
        const deleteDialog = document.getElementById('deleteDialog');

        bookToDelete = null;
        deleteDialog.style.display = 'none';
    }
    function undoBookFromCompleted(todoId) {
        const bookTarget = findTodo(todoId);
       
        if (bookTarget == null) return;
       
        bookTarget.isCompleted = false;
        document.dispatchEvent(new Event(RENDER_BOOK));
        saveData()
    }
    function findTodoIndex(todoId) {
        for (const index in books) {
          if (books[index].id === todoId) {
            return index;
          }
        }
       
        return -1;
    }
})