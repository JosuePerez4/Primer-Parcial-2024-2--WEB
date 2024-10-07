document.getElementById('enviar').addEventListener('click', function () {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    fetch('https://fakestoreapi.com/users')
        .then(res => res.json())
        .then(users => {
            const user = users.find(user => user.username === username && user.password === password);
            if (user) {
                localStorage.setItem('userId', user.id);
                window.location.href = 'shop.html';
            } else {
                alert('Usuario o contraseña incorrectos');
            }
        })
        .catch(err => {
            console.error('Error al obtener los usuarios:', err);
            alert('Ocurrió un error al verificar el usuario');
        });
});