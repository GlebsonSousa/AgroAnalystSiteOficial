document.addEventListener('DOMContentLoaded', () => {
    //Define variaveis para objetos do html

    const btn_analisa = document.getElementById('btn-analisar')
    const logo = document.getElementById('logo')
    const cadastro = document.getElementById('cadastro')
    
    const btnLogin = document.getElementById('login')

    btn_analisa.addEventListener('click', () => {
        location.href = "/AgroAnalyst-VersaoFinal/src/paginas/analise-solo.html"
    })

    logo.addEventListener('click', () => {
        console.log('Clique captado!')
        location.href = "index.html"
    })

    function capturaTokenLocal() {
        token = localStorage.getItem('token')
        if (token == '1') {
            btnLogin.style.display ='none'
        }
    }

    function contarAte(span, maximo) {
    let valor = 0;
    const timer = setInterval(function () {
        valor++;
        span.textContent = valor;
        if (valor >= maximo) {
            clearInterval(timer);
        }
        }, 80); // muda a velocidade aqui se quiser
    }

    function ativarContadorQuandoVisivel(seletor, valorMaximo) {
        const elemento = document.querySelector(seletor);
        const span = elemento.querySelector('span');

        const observer = new IntersectionObserver(function (entradas, obs) {
        if (entradas[0].isIntersecting) {
            contarAte(span, valorMaximo);
            obs.unobserve(elemento);
        }
        });

        observer.observe(elemento);
    }

    // Define os seletores e os valores máximos manualmente:
    ativarContadorQuandoVisivel('.monitoramento-porcentagem-sat', 30);
    ativarContadorQuandoVisivel('.monitoramento-porcentagem-rec', 37);
    capturaTokenLocal()
})