document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção dos Elementos do Formulário ---
    const cadastrar = document.getElementById('cadastrar');
    const retornaLogin = document.getElementById('voltarAoLogin');
    const campoNome = document.getElementById("nome_usuario");
    const campoEmail = document.getElementById("email_usuario");
    const senha = document.getElementById("senha");
    const confirmaSenha = document.getElementById("confirma_senha");


    // --- Funções de Interface (Limpar campos) ---
    document.querySelectorAll('.clear-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            input.value = "";
            input.focus();
            this.style.display = "none";
        });
    });
    document.querySelectorAll('.input-clearable input').forEach(input => {
        input.addEventListener('input', function () {
            const clearBtn = this.nextElementSibling;
            if (clearBtn) {
                clearBtn.style.display = this.value.length > 0 ? "block" : "none";
            }
        });
        if (input.nextElementSibling) {
            input.nextElementSibling.style.display = "none";
        }
    });

    // --- Funções de Validação ---
    function validaEmail(emailElement) {
        const email = emailElement.value;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // CORRIGIDO: Lógica da função de validação de senha
    function validarSenha(senhaElement, confirmaSenhaElement) {
        if (senhaElement.value.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres.");
            return false; // Retorna falso para impedir o envio
        }
        if (senhaElement.value !== confirmaSenhaElement.value) {
            alert("As senhas não coincidem. Por favor, tente novamente.");
            return false; // Retorna falso para impedir o envio
        }
        return true; // Se tudo estiver certo, retorna verdadeiro
    }

    // --- Event Listeners dos Botões --

    if (retornaLogin) {
        retornaLogin.addEventListener('click', async() => {
            window.location.href = '/AgroAnalyst-VersaoFinal/src/paginas/cadastro_login/login.html'
        })
    }
    if (cadastrar) {
        cadastrar.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // CORRIGIDO: Validações sendo chamadas na ordem correta
            if (campoNome.value.trim().length < 3) {
                alert("O nome precisa ter pelo menos 3 caracteres.");
            } else if (!validaEmail(campoEmail)) {
                alert("Por favor, insira um e-mail válido.");
            } else if (!validarSenha(senha, confirmaSenha)) {
                // Não precisa de alert aqui, a função `validarSenha` já mostra a mensagem
            } else {
                // Se todas as validações passarem, tenta enviar os dados
                try {
                    const resposta = await enviaDadosCadastro(campoNome.value.trim(), campoEmail.value.trim(), senha.value);
                    
                    if (!resposta) return; // Erro de rede já foi tratado na função enviaDadosCadastro

                    // Lê a resposta da API como JSON
                    const dadosDaResposta = await resposta.json();

                    if (resposta.ok) { // Verifica se o status HTTP é de sucesso (ex: 200, 201)
                        alert(dadosDaResposta.msg || "Cadastro realizado com sucesso!");
                        window.location.href = '/AgroAnalyst-VersaoFinal/src/paginas/cadastro_login/login.html'; // Exemplo de redirecionamento
                    } else {
                        // Mostra a mensagem de erro específica enviada pelo PHP
                        alert(`Erro ao cadastrar: ${dadosDaResposta.erro}`); 
                    }
                } catch (error) {
                    console.error('Houve um problema com a sua requisição:', error);
                    alert('O servidor retornou uma resposta inválida. Verifique o console para mais detalhes.');
                }
            }
        });
    }

    // --- Função de Envio de Dados para a API ---
    async function enviaDadosCadastro(usuario, email, senha) {
        const dadosFormatados = new URLSearchParams();
        dadosFormatados.append('usuario', usuario);
        dadosFormatados.append('email', email);
        dadosFormatados.append('senha', senha);    

        try {
            const resposta = await fetch('https://servidor-db-php.onrender.com/cadastro.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: dadosFormatados
            });
            return resposta;
        } catch (error) {
            console.error('Houve um problema com a sua requisição fetch:', error);
            alert('Erro de conexão. Verifique sua internet e tente novamente.');
            return null;
        }
    }
});