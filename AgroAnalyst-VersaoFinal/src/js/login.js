document.addEventListener('DOMContentLoaded', () => {
    
    // Captura os elementos do DOM
    const form = document.getElementById('form');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');

    // Adiciona um evento de 'submit' ao formulário
    form.addEventListener('submit', async (e) => {
        // Evita que a página recarregue
        e.preventDefault(); 
        
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        // Validação simples no frontend
        if (!email || !senha) {
            alert('Por favor, preencha o e-mail e a senha.');
            return;
        }

        try {
            // Chama a função que envia os dados e aguarda a resposta
            const resposta = await enviaDadosLogin(email, senha);

            if (!resposta) return; // Se a função retornou null (erro de rede)

            // Lê o corpo da resposta como JSON
            const dadosDaResposta = await resposta.json();

            // Verifica se a requisição foi bem-sucedida (status 200-299)
            if (resposta.ok) {
                console.log('Login bem-sucedido:', dadosDaResposta);
                alert(dadosDaResposta.msg); // Mostra a mensagem de sucesso da API
                localStorage.setItem('UsuarioLogado', 1)
                // Exemplo: Salvar dados do usuário e redirecionar
                // localStorage.setItem('usuarioLogado', JSON.stringify(dadosDaResposta.usuario));
                // window.location.href = "/pagina_principal.html"; 
            } else {
                // Se a requisição falhou, mostra a mensagem de erro da API
                console.error('Erro no login:', dadosDaResposta);
                alert(`Erro: ${dadosDaResposta.erro}`);
            }

        } catch (error) {
            // Este erro acontece se a resposta não for um JSON válido (ex: erro 500 com página HTML)

            console.error('Houve um problema ao processar a resposta:', error);
            alert('Ocorreu um erro inesperado. Verifique o console para mais detalhes.');
        }
    });

    async function verificaConexaoArmazenaConexao(status) {
        if (status == 200){
            console.log('Autenticado com sucesso!')
            localStorage.setItem('token', '1')
        }
        else {
            console.log('Erro')
        }
    }

    async function enviaDadosLogin(email, senha) {
        
        // CORRIGIDO: Formata os dados para x-www-form-urlencoded
        const dadosFormatados = new URLSearchParams();
        dadosFormatados.append('email', email);
        dadosFormatados.append('senha', senha);

        try {
            // CORRIGIDO: URL do endpoint para /login.php
            const resposta = await fetch("https://servidor-db-php.onrender.com/login.php", {
                method: 'POST',
                // CORRIGIDO: Header para o tipo de conteúdo correto
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                // CORRIGIDO: Corpo da requisição com os dados formatados
                body: dadosFormatados
            });

            verificaConexaoArmazenaConexao(resposta.status)

            return resposta;

        } catch (error) {
            console.error('Houve um problema com a sua requisição fetch:', error);
            alert('Erro de conexão. Verifique sua internet e tente novamente.');
            return null; // Retorna nulo para indicar falha de rede
        }
    }
});