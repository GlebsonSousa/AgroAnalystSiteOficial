document.addEventListener('DOMContentLoaded', () => {
    //Define variaveis para objetos do html

    const logo = document.getElementById('area-logo')
    const cadastrar = document.getElementById('cadastro')
    const logar = document.getElementById('login')
  

    logo.addEventListener('click', () => {
        console.log('Clique captado!')
        location.href = "/AgroAnalyst-VersaoFinal/index.html"
    })

    cadastrar.addEventListener('click', () => {
        location.href = "/AgroAnalyst-VersaoFinal/src/paginas/cadastro_login/cadastro.html"
        console.log('chamou')
    })

    login.addEventListener('click', () => {
        location.href = "/AgroAnalyst-VersaoFinal/src/paginas/cadastro_login/login.html"
        console.log('chamou')
    })
})