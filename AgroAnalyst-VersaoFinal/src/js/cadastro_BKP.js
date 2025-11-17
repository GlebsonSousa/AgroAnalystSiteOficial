document.addEventListener('DOMContentLoaded', () => {

    const cadastrar = document.getElementById('cadastrar')
    const retornaLogin = document.getElementById('voltarAoLogin')

    const campoNome = document.getElementById("nome_usuario")
    const campoEmail = document.getElementById("email_usuario")
    const campoDataNasc = document.getElementById("dte_nasc_usuario")
    const campoCPF = document.getElementById("cpf_usuario")
    const campoNum = document.getElementById("num_tell_usuario")


     // Função para limpar campos ao clicar no "X"
    document.querySelectorAll('.clear-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            input.value = "";
            input.focus();
            this.style.display = "none";
        });
    });
      
    // Mostrar/ocultar "X" apenas quando tiver texto
    document.querySelectorAll('.input-clearable input').forEach(input => {
        input.addEventListener('input', function () {
            const clearBtn = this.nextElementSibling;
            clearBtn.style.display = this.value.length > 0 ? "block" : "none";
        });

        // Inicialmente esconder o "X"
        input.nextElementSibling.style.display = "none";
    });
    

    // Constroi Mascaras de exibição
    const cpfInput = campoCPF;
        cpfInput.addEventListener('input', function() {
            let value = cpfInput.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            cpfInput.value = value
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        });

    
    const telInput = campoNum;
        telInput.addEventListener('input', function() {
            let value = telInput.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length > 10) {
                telInput.value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
            } else {
                telInput.value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
            }
        });    
    

    function validaEmail(email){
        email = email.value
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email);
    }

    function validarCPF(cpf) {

        cpf = cpf.replace(/[^\d]+/g, ''); // remove tudo que não for número
       
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
          return false; // inválido se tiver tamanho errado ou todos os dígitos iguais
        }
       
        let soma = 0;
        for (let i = 0; i < 9; i++) {
          soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
       
        let resto = 11 - (soma % 11);
        let digito1 = (resto >= 10) ? 0 : resto;
       
        if (digito1 !== parseInt(cpf.charAt(9))) return false;
       
        soma = 0;
        for (let i = 0; i < 10; i++) {
          soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
       
        resto = 11 - (soma % 11);
        let digito2 = (resto >= 10) ? 0 : resto;
       
        return digito2 === parseInt(cpf.charAt(10));
      }

      function validaDataNascimento(dataString) {
        if (!dataString) return false;
       
        const dataNasc = new Date(dataString);
        const hoje = new Date();
       
        if (isNaN(dataNasc)) return false; // Verifica se a data é inválida
       
        const idade = hoje.getFullYear() - dataNasc.getFullYear();
        const mes = hoje.getMonth() - dataNasc.getMonth();
        const dia = hoje.getDate() - dataNasc.getDate();
       
        const idadeReal = mes < 0 || (mes === 0 && dia < 0) ? idade - 1 : idade;
       
        if (dataNasc > hoje) return false;      // Data futura
        if (idadeReal < 18) return false;       // Menor de idade
        if (idadeReal > 120) return false;      // Idade irreal
       
        return true; // ✅ Data válida
      }


    retornaLogin.addEventListener('click', () => {
        cadastro1.style.display = 'flex';
        cadastro2.style.display = 'none';
        formulario.style.height =  "80vh";
        console.log('chamou')
    })

    cadastrar.addEventListener('click', async(e) => {
        e.preventDefault()

       // .value -> Pega o valor da div
       // .trim() -> Tira os espaços vazios
        let valcpf = validarCPF(campoCPF.value.trim())
        console.log(valcpf)

        console.log(campoEmail.value.length, "tamanho email", campoEmail.value)
        console.log(validaEmail(campoEmail), "email valido?")

        try {
          if (campoNome.value.length < 3) { // Corrigido para 3, conforme sua condição original.
              alert("O nome precisa ter pelo menos 3 caracteres.");
          } else if (!validaEmail(campoEmail)) {
              alert("Por favor, insira um e-mail válido.");
          } else if (!validaDataNascimento(campoDataNasc.value)) {
              alert("Por favor, insira uma data de nascimento válida (dd/mm/aaaa) e certifique-se de que a pessoa tenha mais de 18 anos."); // Adicionei um exemplo de validação de idade comum.
          } else {
              // Se todas as validações passarem
              const cadastro = await enviaDadosCadastro(campoNome.value.trim(), campoEmail.value.trim(), campoCPF.value.trim());
              if (cadastro.ok) {
                  alert("Cadastro realizado com sucesso! Você será redirecionado para a página de login.");
              } else {
                  alert(`Erro ao cadastrar: || 'Ocorreu um erro inesperado no servidor.'}`);
              }
          }
        } catch (error) {
            console.error('Houve um problema com a sua requisição fetch:', error);
            alert('Erro de conexão ou problema na comunicação com o servidor. Tente novamente.');
        }
    })

    confirmar.addEventListener('click', () => {
        location.href = "/index.html"
    })

    async function enviaDadosCadastro(nome, email, cpf) {
        
        const dadosUsuario = {
            usuario: nome,
            email: email,
            senha: 123
        };
        try{
          const resposta = await fetch('https://backendagrodb.onrender.com/registra', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(dadosUsuario)
          });

          return resposta

        } catch (error) {
          console.error('Houve um problema com a sua requisição fetch:', error);
          alert('Erro de conexão. Tente novamente.');
        }
        
      }


})
    //------------------------------------------------
